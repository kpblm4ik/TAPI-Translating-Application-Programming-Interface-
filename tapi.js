/*! TAPI v1.1.0 — Translating Application Programming Interface
 *  Подключение одной строкой:
 *  <script src="https://kpblm4ik.github.io/TAPI-Translating-Application-Programming-Interface-/tapi.js" defer></script>
 *
 *  Необязательные атрибуты тега script:
 *    data-src     адрес словаря (по умолчанию v1/all.json рядом с tapi.js)
 *    data-lang    literary_ru (по умолчанию) или translation_en
 *    data-mode    hover (подсказка, по умолчанию) | replace (заменить слово) | off (только API)
 *    data-scope   CSS-селектор области страницы (по умолчанию body)
 *  Закрыть кусок страницы от перевода: class="tapi-skip" или translate="no".
 */
(function () {
  'use strict';
  if (window.TAPI && window.TAPI.version) return;

  var script = document.currentScript || (function () {
    var s = document.getElementsByTagName('script');
    return s[s.length - 1];
  })();
  var ds = (script && script.dataset) || {};
  var base = (script && script.src) || location.href;

  var cfg = {
    src: ds.src || new URL('v1/all.json', base).href,
    lang: ds.lang || 'literary_ru',
    mode: ds.mode || 'hover',
    scope: ds.scope || 'body',
    ttl: 24 * 60 * 60 * 1000
  };

  var SKIP = 'script,style,noscript,textarea,input,select,code,pre,svg,canvas,' +
             '[contenteditable="true"],[translate="no"],.tapi-skip,.tapi-word,.tapi-tip';
  var TOKEN = /[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu;
  var ENDINGS = ['ами', 'ями', 'ов', 'ев', 'ей', 'ом', 'ем', 'ах', 'ях', 'ой', 'ы', 'и', 'а', 'я', 'у', 'ю', 'е', 'о'];
  var TAILS = ['', 'а', 'я', 'ь', 'ы'];

  var index = Object.create(null);
  var maxPhrase = 1;
  var loaded = false;

  function norm(s) {
    return String(s).toLowerCase().replace(/ё/g, 'е').replace(/’/g, "'").trim();
  }

  // Глаголы-ключи (кемперить, шарить, лутать): сами строим личные формы и прошедшее время
  var VERB_SUFFIXES = {
    'ить': ['ю', 'ишь', 'ит', 'им', 'ите', 'ят', 'ил', 'ила', 'или', 'ило'],
    'ать': ['аю', 'аешь', 'ает', 'аем', 'аете', 'ают', 'ал', 'ала', 'али', 'ало'],
    'ять': ['яю', 'яешь', 'яет', 'яем', 'яете', 'яют', 'ял', 'яла', 'яли', 'яло']
  };
  function verbForms(n) {
    if (n.indexOf(' ') !== -1 || n.length < 6) return [];
    var end = n.slice(-3), sufs = VERB_SUFFIXES[end];
    if (!sufs) return [];
    var base = n.slice(0, -3);
    return sufs.map(function (s) { return base + s; });
  }

  function buildIndex(data) {
    index = Object.create(null);
    maxPhrase = 1;
    var dict = (data && data.dictionary) || {};
    Object.keys(dict).forEach(function (key) {
      var entry = dict[key];
      if (!entry || typeof entry !== 'object') return;
      entry = Object.assign({ key: key }, entry);
      [key].concat(entry.aliases || []).forEach(function (form) {
        var n = norm(form);
        if (!n) return;
        index[n] = entry;
        maxPhrase = Math.max(maxPhrase, n.split(/\s+/).length);
        verbForms(n).forEach(function (f) { if (!index[f]) index[f] = entry; });
      });
    });
    loaded = true;
  }

  function lookup(word) {
    var n = norm(word);
    if (index[n]) return index[n];
    if (n.indexOf(' ') !== -1 || n.length < 4) return null;
    for (var i = 0; i < ENDINGS.length; i++) {
      var e = ENDINGS[i];
      if (n.length - e.length >= 3 && n.slice(-e.length) === e) {
        var stem = n.slice(0, -e.length);
        for (var j = 0; j < TAILS.length; j++) {
          var hit = index[stem + TAILS[j]];
          if (hit && !hit.exact) return hit; // exact: короткие слова не угадываем по окончанию
        }
      }
    }
    return null;
  }

  // Ищет в тексте слова и фразы словаря. Возвращает [{start,end,entry}]
  function findMatches(text) {
    var tokens = [], m;
    TOKEN.lastIndex = 0;
    while ((m = TOKEN.exec(text)) !== null) {
      tokens.push({ s: m.index, e: m.index + m[0].length, t: m[0] });
    }
    var out = [], i = 0;
    while (i < tokens.length) {
      var hit = null, used = 1;
      for (var n = Math.min(maxPhrase, tokens.length - i); n >= 1; n--) {
        if (n > 1) {
          var ok = true;
          for (var k = i; k < i + n - 1; k++) {
            if (!/^\s+$/.test(text.slice(tokens[k].e, tokens[k + 1].s))) { ok = false; break; }
          }
          if (!ok) continue;
        }
        var phrase = tokens.slice(i, i + n).map(function (x) { return x.t; }).join(' ');
        var entry = lookup(phrase);
        if (entry) { hit = entry; used = n; break; }
      }
      if (hit) out.push({ start: tokens[i].s, end: tokens[i + used - 1].e, entry: hit });
      i += used;
    }
    return out;
  }

  // ---------- Оформление ----------
  function injectStyle() {
    if (document.getElementById('tapi-style')) return;
    var st = document.createElement('style');
    st.id = 'tapi-style';
    st.textContent =
      '.tapi-word{border-bottom:1px dotted currentColor;cursor:help;text-decoration:none}' +
      '.tapi-word:focus-visible{outline:2px solid #a066ff;outline-offset:2px}' +
      '.tapi-tip{position:fixed;z-index:2147483647;display:none;box-sizing:border-box;' +
      'max-width:min(300px,calc(100vw - 16px));padding:10px 12px;border-radius:10px;' +
      'background:#1b1626;color:#f1ecfa;border:1px solid #a066ff;' +
      'box-shadow:0 6px 24px rgba(0,0,0,.45);font:14px/1.45 system-ui,-apple-system,Segoe UI,sans-serif;' +
      'pointer-events:none;text-align:left}' +
      '.tapi-tip b{display:block;font-size:15px;margin-bottom:4px;color:#fff}' +
      '.tapi-tip span{display:block;margin-top:2px}' +
      '.tapi-tip small{display:block;margin-top:6px;color:#bcaada}';
    document.head.appendChild(st);
  }

  var tip = null, tipFor = null;
  function ensureTip() {
    if (tip) return tip;
    tip = document.createElement('div');
    tip.className = 'tapi-tip';
    tip.setAttribute('role', 'tooltip');
    document.body.appendChild(tip);
    return tip;
  }
  function line(parent, label, value) {
    if (!value) return;
    var s = document.createElement('span');
    s.textContent = label + value;
    parent.appendChild(s);
  }
  function placeTip(r) {
    var t = ensureTip();
    t.style.display = 'block';
    var tw = t.offsetWidth, th = t.offsetHeight;
    var x = Math.min(Math.max(8, r.left), window.innerWidth - tw - 8);
    var y = r.bottom + 8;
    if (y + th > window.innerHeight - 8) y = Math.max(8, r.top - th - 8);
    t.style.left = x + 'px';
    t.style.top = y + 'px';
  }
  function showTip(el) {
    var entry = index[norm(el.getAttribute('data-tapi'))];
    if (!entry) return;
    var t = ensureTip();
    t.textContent = '';
    var h = document.createElement('b');
    h.textContent = entry.key;
    t.appendChild(h);
    if (cfg.lang === 'translation_en') {
      line(t, 'EN: ', entry.translation_en);
      line(t, 'По-русски: ', entry.literary_ru);
    } else {
      line(t, 'По-русски: ', entry.literary_ru);
      line(t, 'EN: ', entry.translation_en);
    }
    if (entry.example) {
      var ex = document.createElement('small');
      ex.textContent = '«' + entry.example + '»';
      t.appendChild(ex);
    }
    t.style.pointerEvents = 'none';
    placeTip(el.getBoundingClientRect());
    tipFor = el;
  }
  function hideTip() { if (tip) tip.style.display = 'none'; tipFor = null; }

  function bindEvents() {
    var closest = function (n) { return n && n.closest ? n.closest('.tapi-word') : null; };
    document.addEventListener('mouseover', function (e) { var w = closest(e.target); if (w) showTip(w); });
    document.addEventListener('mouseout', function (e) { if (closest(e.target)) hideTip(); });
    document.addEventListener('focusin', function (e) { var w = closest(e.target); if (w) showTip(w); });
    document.addEventListener('focusout', function (e) { if (closest(e.target)) hideTip(); });
    document.addEventListener('click', function (e) {
      var w = closest(e.target);
      if (w && w !== tipFor) showTip(w); else hideTip();
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') hideTip(); });
    window.addEventListener('scroll', hideTip, { passive: true });
  }

  // ---------- Обход страницы ----------
  function wrapTextNode(node) {
    var text = node.nodeValue;
    var matches = findMatches(text);
    if (!matches.length) return;
    var frag = document.createDocumentFragment(), pos = 0;
    matches.forEach(function (m) {
      if (m.start > pos) frag.appendChild(document.createTextNode(text.slice(pos, m.start)));
      var span = document.createElement('span');
      var original = text.slice(m.start, m.end);
      span.className = 'tapi-word';
      span.setAttribute('data-tapi', m.entry.key);
      span.setAttribute('data-orig', original);
      span.tabIndex = 0;
      span.textContent = cfg.mode === 'replace' ? (m.entry[cfg.lang] || original) : original;
      frag.appendChild(span);
      pos = m.end;
    });
    if (pos < text.length) frag.appendChild(document.createTextNode(text.slice(pos)));
    node.parentNode.replaceChild(frag, node);
  }

  function process(root) {
    if (!loaded || cfg.mode === 'off' || !root) return;
    if (root.nodeType === 1 && root.closest && root.closest(SKIP)) return;
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        if (!n.nodeValue || n.nodeValue.trim().length < 2) return NodeFilter.FILTER_REJECT;
        var p = n.parentNode;
        return p && p.closest && p.closest(SKIP) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
      }
    });
    var nodes = [], n;
    while ((n = walker.nextNode())) nodes.push(n);
    nodes.forEach(wrapTextNode);
  }

  function observe(rootEl) {
    if (!window.MutationObserver) return;
    var queue = [], timer = null;
    new MutationObserver(function (list) {
      list.forEach(function (rec) {
        rec.addedNodes.forEach(function (nd) {
          if (nd.nodeType === 1 || nd.nodeType === 3) queue.push(nd.nodeType === 3 ? nd.parentNode : nd);
        });
      });
      if (timer) return;
      timer = setTimeout(function () {
        var items = queue.splice(0);
        timer = null;
        items.forEach(function (el) { if (el && el.isConnected) process(el); });
      }, 200);
    }).observe(rootEl, { childList: true, subtree: true });
  }

  // ---------- Загрузка словаря ----------
  function cacheKey() { return 'tapi:v1.1:' + cfg.src; }
  function readCache() {
    try { return JSON.parse(localStorage.getItem(cacheKey()) || 'null'); } catch (e) { return null; }
  }
  function writeCache(data) {
    try { localStorage.setItem(cacheKey(), JSON.stringify({ t: Date.now(), d: data })); } catch (e) {}
  }
  function loadDictionary() {
    var cached = readCache();
    if (cached && cached.d && Date.now() - cached.t < cfg.ttl) return Promise.resolve(cached.d);
    return fetch(cfg.src, { credentials: 'omit' })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (data) {
        if (!data || typeof data.dictionary !== 'object') throw new Error('Неверный формат словаря');
        writeCache(data);
        return data;
      })
      .catch(function (err) {
        if (cached && cached.d) return cached.d; // устаревший кэш лучше, чем ничего
        throw err;
      });
  }

  // ---------- Публичный API ----------
  var api = {
    version: '1.1.0',
    config: cfg,
    ready: null,
    // TAPI.translate('имба') -> "очень сильный ..." (или null)
    translate: function (word, lang) {
      var e = lookup(word);
      return e ? (e[lang || cfg.lang] || null) : null;
    },
    lookup: lookup,
    refresh: function (root) { process(root || document.querySelector(cfg.scope)); },
    setLanguage: function (lang) { cfg.lang = lang; },
    _core: { norm: norm, buildIndex: buildIndex, lookup: lookup, findMatches: findMatches }
  };
  window.TAPI = api;

  function start() {
    injectStyle();
    api.ready = loadDictionary().then(function (data) {
      buildIndex(data);
      var root = document.querySelector(cfg.scope) || document.body;
      if (cfg.mode !== 'off') {
        bindEvents();
        process(root);
        observe(root);
      }
      document.dispatchEvent(new CustomEvent('tapi:ready', { detail: { words: Object.keys(data.dictionary).length } }));
      return api;
    }).catch(function (err) {
      if (window.console) console.warn('[TAPI] словарь не загружен:', err);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
