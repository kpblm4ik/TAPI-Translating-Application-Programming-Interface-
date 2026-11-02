/*
 * TAPI embed: подключение к любому сайту одной строкой.
 * <script src="https://kpblm4ik.github.io/TAPI-Translating-Application-Programming-Interface-/v1/tapi.js" defer></script>
 * Слова из словаря подчёркиваются пунктиром, перевод показывается при наведении.
 */
(function () {
  var BASE = "https://kpblm4ik.github.io/TAPI-Translating-Application-Programming-Interface-/v1/";
  var s = document.currentScript;
  if (s && s.src) BASE = s.src.replace(/tapi\.js.*$/, "");

  function esc(str) { return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }

  fetch(BASE + "all.json")
    .then(function (r) { return r.json(); })
    .then(function (data) {
      var dict = {};
      Object.keys(data.dictionary || {}).forEach(function (k) {
        dict[k.toLowerCase().trim()] = data.dictionary[k];
      });
      var keys = Object.keys(dict).sort(function (a, b) { return b.length - a.length; });
      if (!keys.length) return;
      var re = new RegExp(
        "(^|[^\\p{L}\\p{N}_])(" + keys.map(esc).join("|") + ")(?=$|[^\\p{L}\\p{N}_])",
        "giu"
      );

      function process(node) {
        var text = node.nodeValue, m, last = 0, found = false;
        var frag = document.createDocumentFragment();
        re.lastIndex = 0;
        while ((m = re.exec(text))) {
          var word = m[2], entry = dict[word.toLowerCase()];
          if (!entry) continue;
          found = true;
          var start = m.index + m[1].length;
          frag.appendChild(document.createTextNode(text.slice(last, start)));
          var el = document.createElement("abbr");
          el.className = "tapi-word";
          el.title = entry.literary_ru + " | EN: " + entry.translation_en;
          el.style.textDecoration = "underline dotted";
          el.textContent = word;
          frag.appendChild(el);
          last = start + word.length;
        }
        if (found) {
          frag.appendChild(document.createTextNode(text.slice(last)));
          node.parentNode.replaceChild(frag, node);
        }
      }

      function walk(node) {
        if (node.nodeType === 3) { process(node); return; }
        if (node.nodeType !== 1) return;
        if (/^(SCRIPT|STYLE|TEXTAREA|INPUT|NOSCRIPT|ABBR)$/.test(node.tagName)) return;
        Array.prototype.slice.call(node.childNodes).forEach(walk);
      }

      walk(document.body);
    })
    .catch(function (e) { console.warn("TAPI: не удалось загрузить словарь", e); });
})();
