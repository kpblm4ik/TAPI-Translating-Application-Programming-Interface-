# 🚀 TAPI — Translating Application Programming Interface

**TAPI** — это открытое, легковесное API данных для перевода современного интернет-сленга, IT-жаргона и неологизмов в литературную речь и иностранные языки.

Проект создан для веб-разработчиков, чтобы избавить их от необходимости писать собственные парсеры, словари и содержать бэкенд-сервера для адаптации контента под разную аудиторию.

## 🧩 Браузерное расширение

В папке [`extension/`](extension/) лежит расширение для Chrome / Edge (Manifest V3). Выдели слово на любой странице — появится подсказка с литературным значением и английским вариантом.

Установка для теста: `chrome://extensions` → «Режим разработчика» → «Загрузить распакованное» → папка `extension/`.

Новые слова добавляются в `extension/dictionary.json` и `v1/all.json` (формат: `literary_ru`, `translation_en`).

## 🌐 Как подключить TAPI к любому сайту

Вы можете делать прямые `GET`-запросы к готовым JSON-эндпоинтам TAPI, развернутым на GitHub Pages.

### Пример на JavaScript:

```js
async function fetchSlangTranslation(word) {
    const url = 'https://kpblm4ik.github.io/TAPI-Translating-Application-Programming-Interface-/v1/all.json';
    try {
        const response = await fetch(url);
        const tapiData = await response.json();

        const cleanWord = word.toLowerCase().trim();
        if (tapiData.dictionary[cleanWord]) {
            return tapiData.dictionary[cleanWord];
        }
        return null; // Слово не найдено в TAPI
    } catch (error) {
        console.error('TAPI Error:', error);
    }
}

// Использование:
fetchSlangTranslation('имба').then(data => {
    if (data) console.log(`Литературно: ${data.literary_ru} | EN: ${data.translation_en}`);
});
```

## 📊 Доступные эндпоинты

- `https://kpblm4ik.github.io/TAPI-Translating-Application-Programming-Interface-/v1/all.json` — полная база данных словаря.
- `https://kpblm4ik.github.io/TAPI-Translating-Application-Programming-Interface-/v1/schema.json` — JSON-схема для валидации.

> Эндпоинты заработают после включения GitHub Pages (Settings → Pages → Deploy from branch → `main` / root).
