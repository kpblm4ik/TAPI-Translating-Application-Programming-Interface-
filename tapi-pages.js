/*! TAPI Pages v1.0.0 — перевод страницы целиком по таблице фраз
 *
 *  Подключается кнопкой «Т» (tapi_widget.js), когда выбран English и задан data-phrases.
 *  Работает ДО разметки слов в tapi.js, чтобы перевод шёл по целым фразам и абзацам.
 *
 *  Формат таблицы (JSON):
 *    { "version": 1, "phrases": { "<русский текст блока>": "<английский текст>" } }
 *
 *  Блок = элемент, внутри которого только текст и строчные теги (a, strong, em, span…).
 *  Ключ — textContent блока без учёта пробелов и регистра.
 *  Чтобы в переводе сохранить ссылки и выделение, оберни кусок маркером {n}…{/n},
 *  где n — номер (с 1) строчного тега внутри блока. Перенос строки <br> — символ \n.
 *    "Сектор: {1}Катушки{/1}"  →  "Sector: {1}Coils{/1}"
 *  Непереведённый текст остаётся как есть.
 */
(function () {
  'use strict';
  if (window.TAPIPages) return;

  var INLINE_SEL = 'a,abbr,b,bdi,bdo,br,cite,code,del,em,i,ins,kbd,mark,q,s,small,span,strong,sub,sup,time,u,var';
  var INLINE_RE = new RegExp('^(' + INLINE_SEL.split(',').join('|') + ')$', 'i');
  var SKIP = 'script,style,noscript,textarea,input,select,code,pre,canvas,' +
             '[contenteditable="true"],[translate="no"],.tapi-skip,.tapi-tip,.tapi-w';

  function collapse(s) { return String(s).replace(/\s+/g, ' ').trim(); }
  function squash(s) { return String(s).replace(/\s+/g, '').toLowerCase().replace(/ё/g, 'е'); }

  var map = Object.create(null);

  function onlyInline(el) {
    var kids = el.children;
    for (var i = 0; i < kids.length; i++) {
      var k = kids[i];
      if (!INLINE_RE.test(k.tagName)) return false;
      if (k.querySelector('*:not(' + INLINE_SEL + ')')) return false;
    }
    return true;
  }

  // Собирает «единицы перевода»: блоки с текстом и отдельные текстовые узлы
  function collect(root) {
    var out = [];
    (function visit(el) {
      if (el.nodeType !== 1 || el.matches(SKIP)) return;
      if (el.localName === 'svg') {
        Array.prototype.forEach.call(el.querySelectorAll('text'), function (t) {
          if (t.textContent.trim()) out.push({ el: t });
        });
        return;
      }
      if (onlyInline(el)) {
        if (el.textContent.trim()) out.push({ el: el });
        return;
      }
      Array.prototype.forEach.call(el.childNodes, function (n) {
        if (n.nodeType === 1) visit(n);
        else if (n.nodeType === 3 && n.nodeValue.trim()) out.push({ node: n });
      });
    })(root);
    return out;
  }

  // Текст блока с маркерами {n}…{/n} вокруг строчных тегов (для составления таблицы)
  function marked(el) {
    var s = '', idx = 0;
    Array.prototype.forEach.call(el.childNodes, function (n) {
      if (n.nodeType === 3) s += n.nodeValue.replace(/\s+/g, ' ');
      else if (n.nodeType === 1) {
        if (n.tagName === 'BR') { s = s.replace(/ +$/, '') + '\n'; return; }
        idx++;
        s += '{' + idx + '}' + collapse(n.textContent) + '{/' + idx + '}';
      }
    });
    return s.replace(/ *\n */g, '\n').trim();
  }

  // Для составления таблицы: TAPIPages.dump(document.querySelector('.wrapper')) в консоли браузера
  function dump(root) {
    return collect(root || document.body).map(function (u) {
      if (u.el) return { key: collapse(u.el.textContent), marked: marked(u.el), tag: u.el.localName };
      var t = collapse(u.node.nodeValue);
      return { key: t, marked: t, tag: '#text' };
    });
  }

  // Копия строчного тега вместе с вложенной «обёрткой» (например <em><strong>…</strong></em>),
  // внутрь которой кладётся переведённый текст
  function shell(src, txt) {
    var c = src.cloneNode(true), t = c;
    function ownText(n) {
      return Array.prototype.some.call(n.childNodes, function (x) { return x.nodeType === 3 && x.nodeValue.trim(); });
    }
    while (t.children.length === 1 && !ownText(t)) t = t.children[0];
    t.textContent = txt;
    return c;
  }

  // Однословный перевод повторяет регистр первой буквы оригинала («Зеленый» → «Green», «зеленый» → «green»)
  function fitCase(orig, v) {
    var o = collapse(orig);
    if (!v || /\s/.test(o) || /\s/.test(v) || /[{}]/.test(v)) return v;
    var f = o.charAt(0), g = v.charAt(0);
    if (f === f.toUpperCase() && f !== f.toLowerCase()) return g.toUpperCase() + v.slice(1);
    if (f === f.toLowerCase() && f !== f.toUpperCase()) return g.toLowerCase() + v.slice(1);
    return v;
  }

  function render(el, v) {
    var kids = Array.prototype.filter.call(el.children, function (c) { return c.tagName !== 'BR'; });
    var frag = document.createDocumentFragment();
    var re = /\{(\d+)\}([\s\S]*?)\{\/\1\}/g, pos = 0, m;
    var svg = el.namespaceURI !== 'http://www.w3.org/1999/xhtml';
    function text(s) {
      s.split('\n').forEach(function (part, i) {
        if (i && !svg) frag.appendChild(document.createElement('br'));
        if (part) frag.appendChild(document.createTextNode(part));
      });
    }
    while ((m = re.exec(v))) {
      text(v.slice(pos, m.index));
      var src = kids[+m[1] - 1];
      if (src) frag.appendChild(shell(src, m[2]));
      else text(m[2]);
      pos = re.lastIndex;
    }
    text(v.slice(pos));
    while (el.firstChild) el.removeChild(el.firstChild);
    el.appendChild(frag);
  }

  function translate(root) {
    var n = 0;
    collect(root).forEach(function (u) {
      if (u.el) {
        var v = map[squash(u.el.textContent)];
        if (v != null) { render(u.el, fitCase(u.el.textContent, v)); n++; }
      } else {
        var w = map[squash(u.node.nodeValue)];
        if (w != null) {
          var s = u.node.nodeValue;
          u.node.nodeValue = s.match(/^\s*/)[0] + fitCase(s, w) + s.match(/\s*$/)[0];
          n++;
        }
      }
    });
    if (root.querySelectorAll) {
      Array.prototype.forEach.call(root.querySelectorAll('[alt],[title],[aria-label]'), function (el) {
        ['alt', 'title', 'aria-label'].forEach(function (a) {
          var val = el.getAttribute(a);
          if (val && map[squash(val)] != null) el.setAttribute(a, map[squash(val)]);
        });
      });
    }
    return n;
  }

  function ready() {
    return new Promise(function (res) {
      if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', res);
      else res();
    });
  }

  function observe(root) {
    if (!window.MutationObserver) return;
    var queue = [], timer = null;
    new MutationObserver(function (list) {
      list.forEach(function (rec) {
        rec.addedNodes.forEach(function (nd) {
          var el = nd.nodeType === 3 ? nd.parentNode : nd;
          if (el && el.nodeType === 1) queue.push(el);
        });
      });
      if (timer || !queue.length) return;
      timer = setTimeout(function () {
        var items = queue.splice(0);
        timer = null;
        items.forEach(function (el) { if (el.isConnected) translate(el); });
      }, 150);
    }).observe(root, { childList: true, subtree: true });
  }

  function load(data) {
    var p = (data && data.phrases) || data || {};
    map = Object.create(null);
    Object.keys(p).forEach(function (k) {
      if (typeof p[k] === 'string') map[squash(k)] = p[k];
    });
  }

  // opts: { url, scope }
  function run(opts) {
    return ready().then(function () {
      return fetch(opts.url, { credentials: 'omit', cache: 'no-cache' });
    }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    }).then(function (data) {
      load(data);
      var root = document.querySelector(opts.scope || 'body') || document.body;
      var n = translate(root);
      if (map[squash(document.title)] != null) document.title = map[squash(document.title)];
      document.documentElement.lang = 'en';
      observe(root);
      return n;
    }).catch(function (err) {
      if (window.console) console.warn('[TAPI Pages] перевод страницы не применён:', err);
      return 0;
    });
  }

  window.TAPIPages = { version: '1.0.0', run: run, translate: translate, collect: collect, dump: dump, load: load };
})();
