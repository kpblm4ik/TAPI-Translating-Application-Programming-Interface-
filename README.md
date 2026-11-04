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

## 2. 🧩 Расширение для Яндекс Браузера — умный переводчик

Готовое расширение — архив [`tapi-extension.zip`](tapi-extension.zip) (Manifest V3, версия 2.0.0, около 28 КБ). Это обычный переводчик страниц, только «умнее»: перед переводом сленг из словаря TAPI заменяется понятным смыслом, поэтому игровой, интернет- и хип-хоп сленг переводится точнее. Никаких подчёркиваний и подсказок — переводится весь текст страницы.

- Язык перевода: русский или English (текст, который уже на нужном языке, не трогается).
- Кнопка **«Т»** в левом нижнем углу страницы открывает панель: «Перевести страницу» / «Показать оригинал», выбор языка, «Всегда переводить этот сайт», «Скрыть кнопку».
- Текст в полях ввода и в блоках кода не меняется. Динамически подгружаемый текст переводится автоматически.

> ⚠️ Для перевода текст страницы отправляется в Google Translate. Кнопка работает только по вашему нажатию (или на сайтах, где вы включили «Всегда переводить»).

### Установка в Яндекс Браузере (компьютер)

1. Скачайте [tapi-extension.zip](https://github.com/kpblm4ik/TAPI-Translating-Application-Programming-Interface-/raw/main/tapi-extension.zip).
2. Распакуйте архив в постоянную папку, например `Документы\tapi-extension`. Внутри должен лежать файл `manifest.json`.
   > Не удаляйте и не переносите эту папку после установки — браузер читает расширение прямо из неё.
3. Откройте в Яндекс Браузере страницу расширений: введите в адресной строке `browser://extensions` (или меню ≡ → «Дополнения»).
4. В правом верхнем углу страницы включите **«Режим разработчика»**.
5. Над списком расширений нажмите **«Загрузить распакованное расширение»** и выберите папку из шага 2 (ту, где лежит `manifest.json`).
6. Откройте любую страницу (уже открытые вкладки обновите) и нажмите «Т» → «Перевести страницу».

### Обновление

Скачайте новый `tapi-extension.zip`, распакуйте его поверх старой папки (с заменой файлов), затем на странице `browser://extensions` нажмите на кнопку обновления у TAPI.

> Папка [`extension/`](extension/) — ранняя версия расширения (подсказка по выделенному слову). Актуальная версия — в архиве `tapi-extension.zip`.

## 3. 📱 Android-приложение (APK)

Папка [`android/`](android/) — приложение на Kotlin. Выдели текст в любом приложении и выбери «TAPI перевод» в меню; либо введи слово на главном экране.

APK собирается автоматически: вкладка **Actions** → последний запуск «Build APK» → артефакт **tapi-apk**. Разреши установку из неизвестных источников и открой `app-debug.apk`.

## ➕ Как добавить слова

Добавляй записи в `v1/all.json`, `extension/dictionary.json` и `android/app/src/main/assets/dictionary.json` (одинаковый формат).

Для расширения из `tapi-extension.zip` словарь — файл `dict.js` внутри архива. Формат записи: `w` — слово, `a` — другие формы, `r` — короткий смысл по-русски, `e` — по-английски, `x: 1` — без поиска по окончаниям.
