# 🚀 TAPI — Translating Application Programming Interface

**TAPI** — это открытое, легковесное API данных для перевода современного интернет-сленга, IT-жаргона и неологизмов в литературную речь и иностранные языки. 

Проект создан для веб-разработчиков, чтобы избавить их от необходимости писать собственные парсеры, словари и содержать бэкенд-сервера для адаптации контента под разную аудиторию.

## 🌐 Как подключить TAPI к любому сайту

Вы можете делать прямые `GET`-запросы к готовым JSON-эндпоинтам TAPI, развернутым на GitHub Pages. База данных обрабатывается локальным ИИ, который сопоставляет слова и гарантирует чистоту структуры.

### Пример на JavaScript:
```javascript
async function fetchSlangTranslation(word) {
    const url = 'https://YOUR_GITHUB_USERNAME.github.io/tapi/v1/all.json';
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
    if(data) console.log(`Литературно: ${data.literary_ru} | EN: ${data.translation_en}`);
});
```

## 📊 Доступные эндпоинты
* `https://YOUR_GITHUB_USERNAME.github.io/tapi/v1/all.json` — Полная база данных словаря.
* `https://YOUR_GITHUB_USERNAME.github.io/tapi/v1/schema.json` — JSON-схема для валидации.
* 
