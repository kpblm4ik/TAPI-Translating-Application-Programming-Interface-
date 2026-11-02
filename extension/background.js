// Удалённая база TAPI (GitHub Pages). Если Pages не включён — расширение работает на встроенном словаре.
const REMOTE_URL = "https://kpblm4ik.github.io/TAPI-Translating-Application-Programming-Interface-/v1/all.json";

let dictPromise = null;

async function loadDict() {
  const local = await (await fetch(chrome.runtime.getURL("dictionary.json"))).json();
  const merged = { ...local.dictionary };
  if (REMOTE_URL) {
    try {
      const remote = await (await fetch(REMOTE_URL)).json();
      Object.assign(merged, remote.dictionary || {});
    } catch (e) {
      console.warn("TAPI: remote dictionary unavailable, using bundled", e);
    }
  }
  return merged;
}

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type !== "lookup") return;
  dictPromise = dictPromise || loadDict();
  dictPromise.then((dict) => {
    const clean = msg.text.toLowerCase().trim();
    let hit = dict[clean];
    if (!hit) {
      for (const w of clean.split(/[\s,.!?;:()"«»]+/)) {
        if (dict[w]) { hit = dict[w]; break; }
      }
    }
    sendResponse(hit || null);
  });
  return true;
});
