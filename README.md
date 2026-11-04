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

## 2. 🧩 Расширение для Яндекс Браузера

Готовое расширение лежит в архиве [`tapi-extension.zip`](tapi-extension.zip) (Manifest V3, версия 1.3.0). Оно переводит слова и фразы из словаря TAPI прямо в тексте страницы — без подчёркиваний и подсказок. Язык перевода (русский / English) переключается кнопкой «Т» в левом нижнем углу страницы или в окне расширения.

Словарь встроен в расширение: интернет не нужен, страницы никуда не отправляются. Текст в полях ввода и в блоках кода не меняется.

### Установка в Яндекс Браузере

1. Скачайте [tapi-extension.zip](https://github.com/kpblm4ik/TAPI-Translating-Application-Programming-Interface-/raw/main/tapi-extension.zip).
2. Распакуйте архив в постоянную папку, например `Документы\tapi-extension`. Внутри должен лежать файл `manifest.json`.
   > Не удаляйте и не переносите эту папку после установки — браузер читает расширение прямо из неё.
3. Откройте в Яндекс Браузере страницу расширений: введите в адресной строке `browser://extensions` (или меню ≡ → «Дополнения»).
4. В правом верхнем углу страницы включите **«Режим разработчика»**.
5. Над списком расширений нажмите **«Загрузить распакованное расширение»** и выберите папку из шага 2 (ту, где лежит `manifest.json`).
6. Расширение «TAPI — переводчик сленга» появится в списке. Обновите уже открытые вкладки — и текст на страницах начнёт переводиться.

### Использование

- Кнопка **«Т»** в левом нижнем углу страницы (или значок расширения на панели) открывает настройки: язык перевода, включение расширения, перевод на конкретном сайте, скрытие кнопки.
- Чтобы временно отключить перевод, снимите галочку «Расширение включено» — исходный текст на странице вернётся.

### Обновление

Скачайте новый `tapi-extension.zip`, распакуйте его поверх старой папки (с заменой файлов), затем на странице `browser://extensions` нажмите на кнопку обновления у TAPI (или перезагрузите расширение выключением и включением).

> Папка [`extension/`](extension/) — ранняя версия расширения (подсказка по выделенному слову). Актуальная версия — в архиве `tapi-extension.zip`.

## 3. 📱 Android-приложение (APK)

Папка [`android/`](android/) — приложение на Kotlin. Выдели текст в любом приложении и выбери «TAPI перевод» в меню; либо введи слово на главном экране.

APK собирается автоматически: вкладка **Actions** → последний запуск «Build APK» → артефакт **tapi-apk**. Разреши установку из неизвестных источников и открой `app-debug.apk`.

## ➕ Как добавить слова

Добавляй записи в `v1/all.json`, `extension/dictionary.json` и `android/app/src/main/assets/dictionary.json` (одинаковый формат).

Для расширения из `tapi-extension.zip` словарь — файл `dict.js` внутри архива (тот же формат записей: `literary_ru`, `translation_en`, `aliases`, `example`).
