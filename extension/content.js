let tip = null;

function removeTip() { if (tip) { tip.remove(); tip = null; } }

document.addEventListener("mousedown", (e) => {
  if (tip && !tip.contains(e.target)) removeTip();
});

document.addEventListener("mouseup", (e) => {
  if (tip && tip.contains(e.target)) return;
  setTimeout(() => {
    const sel = window.getSelection();
    const text = sel ? sel.toString().trim() : "";
    if (!text || text.length > 60) return;
    chrome.runtime.sendMessage({ type: "lookup", text }, (res) => {
      if (chrome.runtime.lastError || !res) return;
      const rect = sel.getRangeAt(0).getBoundingClientRect();
      removeTip();
      tip = document.createElement("div");
      tip.className = "tapi-tip";
      const ru = document.createElement("div");
      ru.textContent = "RU: " + (res.literary_ru || "—");
      const en = document.createElement("div");
      en.textContent = "EN: " + (res.translation_en || "—");
      tip.append(ru, en);
      tip.style.top = window.scrollY + rect.bottom + 6 + "px";
      tip.style.left = window.scrollX + rect.left + "px";
      document.body.appendChild(tip);
    });
  }, 0);
});
