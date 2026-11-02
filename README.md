# 🚀 TAPI — Translating Application Programming Interface

**TAPI** — это открытое, легковесное API данных для перевода современного интернет-сленга, IT-жаргона и неологизмов в литературную речь и иностранные языки.

Проект создан для веб-разработчиков, чтобы избавить их от необходимости писать собственные парсеры, словари и содержать бэкенд-сервера для адаптации контента под разную аудиторию.

TAPI существует в трёх версиях, и все они используют один и тот же словарь (формат: `literary_ru`, `translation_en`).

## 1. 🔗 Подключение по ссылке (для сайтов)

Одна строка на любой странице подчеркнёт слова из словаря и покажет перевод при наведении:

```html
<script src="https://kpblm4ik.github.io/TAPI-Translating-Application-Programming-Interface-/v1/tapi.js" defer></script>
```

Демо: `index.html` в корне репозитория.

### Или напрямую через JSON (JavaScript)

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

### Эндпоинты

- `https://kpblm4ik.github.io/TAPI-Translating-Application-Programming-Interface-/v1/all.json` — полная база данных словаря.
- `https://kpblm4ik.github.io/TAPI-Translating-Application-Programming-Interface-/v1/schema.json` — JSON-схема для валидации.
- `https://kpblm4ik.github.io/TAPI-Translating-Application-Programming-Interface-/v1/tapi.js` — скрипт для встраивания.

> Работает после включения GitHub Pages: Settings → Pages → Deploy from branch → `main` / root.

## 2. 🧩 Расширение для браузера

Папка [`extension/`](extension/) — расширение для Chrome / Edge / Brave (Manifest V3). Выдели слово на странице — появится подсказка.

Установка: `chrome://extensions` → «Режим разработчика» → «Загрузить распакованное» → папка `extension/`.

## 3. 📱 Android-приложение (APK)

Папка [`android/`](android/) — приложение на Kotlin. Выдели текст в любом приложении и выбери «TAPI перевод» в меню; либо введи слово на главном экране.

APK собирается автоматически: вкладка **Actions** → последний запуск «Build APK» → артефакт **tapi-apk**. Разреши установку из неизвестных источников и открой `app-debug.apk`.

## ➕ Как добавить слова

Добавляй записи в `v1/all.json`, `extension/dictionary.json` и `android/app/src/main/assets/dictionary.json` (одинаковый формат).
