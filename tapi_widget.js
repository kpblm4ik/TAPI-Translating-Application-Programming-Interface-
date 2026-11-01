/*!
 * TAPI widget — кнопка «Т» в левом нижнем углу.
 * Кладётся в репозиторий TAPI рядом с tapi.js и подключается ОДНОЙ строкой:
 *   <script src=".../tapi-widget.js" defer></script>
 * Сам подгружает tapi.js с выбранным языком (ru → literary_ru, en → translation_en).
 *
 * Необязательные атрибуты тега <script>:
 *   data-scope   — CSS-селектор области страницы (по умолчанию body)
 *   data-lookup  — wiktionary | off (по умолчанию off)
 *   data-mode    — hover | replace | off (по умолчанию hover)
 */
(function () {
  'use strict';

  var me = document.currentScript;
  if (!me || window.__tapiWidget) return;
  window.__tapiWidget = true;

  var base = me.src.replace(/[^\/]*$/, '');          // папка, где лежит этот файл
  var KEY = 'tapi-lang';

  var LANGS = {
    ru: { label: 'Русский', short: 'RU', tapi: 'literary_ru' },
    en: { label: 'English', short: 'EN', tapi: 'translation_en' }
  };

  function store(v) {
    try { if (v === undefined) return localStorage.getItem(KEY); localStorage.setItem(KEY, v); }
    catch (e) { return null; }
  }

  var current = store();
  if (!LANGS[current]) current = null;

  /* ---------- загрузка самого словаря ---------- */
  function loadTapi(code) {
    var s = document.createElement('script');
    s.src = base + 'tapi.js';
    s.defer = true;
    s.setAttribute('data-lang', LANGS[code].tapi);
    ['scope', 'lookup', 'mode', 'src'].forEach(function (a) {
      var v = me.getAttribute('data-' + a);
      if (v) s.setAttribute('data-' + a, v);
    });
    document.head.appendChild(s);
  }
  if (current) loadTapi(current);

  /* ---------- стили ---------- */
  var css =
    '.tapi-w{position:fixed;left:16px;bottom:16px;z-index:2147483000;font:14px/1.4 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;' +
    '--bg:#fff;--fg:#1a1a1a;--bd:#d0d0d0;--ac:#2f6fed;--hv:#f0f3fa}' +
    '@media (prefers-color-scheme:dark){.tapi-w{--bg:#23262b;--fg:#eceff4;--bd:#454a52;--ac:#6ea0ff;--hv:#2d3138}}' +
    '.tapi-w-btn{width:44px;height:44px;border-radius:50%;border:1px solid var(--bd);background:var(--bg);color:var(--fg);' +
    'font:700 20px/1 Georgia,serif;cursor:pointer;box-shadow:0 2px 10px rgba(0,0,0,.25);display:flex;align-items:center;justify-content:center;padding:0}' +
    '.tapi-w-btn:hover,.tapi-w-btn:focus-visible{border-color:var(--ac);outline:none}' +
    '.tapi-w-btn.tapi-w-new{animation:tapiw-pulse 2s ease-in-out infinite}' +
    '@keyframes tapiw-pulse{0%,100%{box-shadow:0 2px 10px rgba(0,0,0,.25),0 0 0 0 var(--ac)}50%{box-shadow:0 2px 10px rgba(0,0,0,.25),0 0 0 8px transparent}}' +
    '.tapi-w-pop{position:absolute;left:0;bottom:54px;min-width:210px;padding:12px;border:1px solid var(--bd);border-radius:12px;' +
    'background:var(--bg);color:var(--fg);box-shadow:0 6px 24px rgba(0,0,0,.3)}' +
    '.tapi-w-pop[hidden]{display:none}' +
    '.tapi-w-title{margin:0 0 8px;font-weight:600}' +
    '.tapi-w-opt{display:flex;align-items:center;justify-content:space-between;gap:12px;width:100%;margin:4px 0 0;padding:9px 12px;' +
    'border:1px solid var(--bd);border-radius:8px;background:transparent;color:inherit;font:inherit;cursor:pointer;text-align:left}' +
    '.tapi-w-opt:hover,.tapi-w-opt:focus-visible{background:var(--hv);outline:none}' +
    '.tapi-w-opt[aria-checked="true"]{border-color:var(--ac);box-shadow:inset 0 0 0 1px var(--ac)}' +
    '.tapi-w-code{font-size:12px;opacity:.65}';
  var st = document.createElement('style');
  st.textContent = css;
  document.head.appendChild(st);

  /* ---------- разметка ---------- */
  function build() {
    var root = document.createElement('div');
    root.className = 'tapi-w tapi-skip';     // tapi-skip — чтобы TAPI не подчёркивал слова в самом виджете
    root.setAttribute('translate', 'no');

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'tapi-w-btn' + (current ? '' : ' tapi-w-new');
    btn.textContent = 'Т';
    btn.setAttribute('aria-label', 'TAPI: выбрать язык / choose language');
    btn.setAttribute('aria-haspopup', 'dialog');
    btn.setAttribute('aria-expanded', 'false');

    var pop = document.createElement('div');
    pop.className = 'tapi-w-pop';
    pop.setAttribute('role', 'dialog');
    pop.setAttribute('aria-label', 'Выбор языка');
    pop.hidden = true;

    var title = document.createElement('p');
    title.className = 'tapi-w-title';
    title.textContent = 'Выберите язык / Choose language';
    pop.appendChild(title);

    var group = document.createElement('div');
    group.setAttribute('role', 'radiogroup');
    pop.appendChild(group);

    Object.keys(LANGS).forEach(function (code) {
      var o = document.createElement('button');
      o.type = 'button';
      o.className = 'tapi-w-opt';
      o.setAttribute('role', 'radio');
      o.setAttribute('aria-checked', String(code === current));
      var n = document.createElement('span');
      n.textContent = LANGS[code].label;
      var c = document.createElement('span');
      c.className = 'tapi-w-code';
      c.textContent = LANGS[code].short;
      o.appendChild(n);
      o.appendChild(c);
      o.addEventListener('click', function () { choose(code); });
      group.appendChild(o);
    });

    function open(v) {
      pop.hidden = !v;
      btn.setAttribute('aria-expanded', String(v));
      if (v) group.querySelector('button').focus();
    }
    btn.addEventListener('click', function (e) { e.stopPropagation(); open(pop.hidden); });
    document.addEventListener('click', function (e) { if (!root.contains(e.target)) open(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !pop.hidden) { open(false); btn.focus(); }
    });

    root.appendChild(pop);
    root.appendChild(btn);
    document.body.appendChild(root);
  }

  function choose(code) {
    if (code === current) { return; }
    store(code);
    location.reload();      // самый надёжный способ: словарь заново читает data-lang
  }

  if (document.body) build();
  else document.addEventListener('DOMContentLoaded', build);
})();
