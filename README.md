# 🚀 TAPI — Translating Application Programming Interface

Открытый словарь для перевода интернет-сленга, игрового жаргона и неологизмов в литературную речь и на английский. Подключается к любому сайту **одной строкой**.

## Подключение

Кнопка «Т» с выбором языка (рекомендуется):

```html
<script src="https://kpblm4ik.github.io/TAPI-Translating-Application-Programming-Interface-/tapi_widget.js" defer></script>
```

Только подсказки к словам, без кнопки:

```html
<script src="https://kpblm4ik.github.io/TAPI-Translating-Application-Programming-Interface-/tapi.js" defer></script>
```

Скрипт находит на странице слова из словаря, подчёркивает их точками, а при наведении (на телефоне при нажатии) показывает перевод.

## Кнопка «Т» (tapi_widget.js)

Появляется в левом нижнем углу и предлагает выбрать язык: Русский или English. Выбор запоминается в браузере.

| Атрибут | Значения | По умолчанию |
|---------|----------|--------------|
| `data-scope` | CSS-селектор области страницы | `body` |
| `data-mode` | `hover` (подсказка), `replace` (заменить слово), `off` | `hover` |
| `data-phrases` | адрес JSON с английскими фразами для перевода страницы целиком | нет |
| `data-src` | свой адрес словаря | `v1/all.json` |

### Перевод страницы целиком (tapi-pages.js)

Если задан `data-phrases`, при выборе English страница переводится по таблице фраз, а потом поверх накладываются подсказки словаря. Формат таблицы описан в начале `tapi-pages.js`. Непереведённый текст остаётся как есть.

## tapi.js: настройки и API

| Атрибут | Значения | По умолчанию |
|---------|----------|--------------|
| `data-lang` | `literary_ru`, `translation_en` | `literary_ru` |
| `data-mode` | `hover`, `replace`, `off` (только API) | `hover` |
| `data-scope` | CSS-селектор области страницы | `body` |
| `data-src` | свой адрес словаря | `v1/all.json` рядом со скриптом |

Не нужно переводить фрагмент: `<div class="tapi-skip">…</div>` или `translate="no"`.

```js
await TAPI.ready;
TAPI.translate('имба');                   // "чрезмерно сильный, ..."
TAPI.translate('имба', 'translation_en'); // "overpowered (OP)"
TAPI.lookup('Нерфнули');                  // вся запись словаря
TAPI.refresh();                           // перепроверить страницу вручную
```

## Подключение через Jekyll (_config.yml)

```yml
tapi:
  enabled: true
  src: "https://kpblm4ik.github.io/TAPI-Translating-Application-Programming-Interface-/tapi_widget.js"
  scope: ".wrapper"
  phrases: "https://kpblm4ik.github.io/a51bfcts_wikipedia/tapi-en.json"
```

В шаблоне (`_includes/tapi.html`) стоит один `<script>`, который читает эти настройки, поэтому на каждую страницу ссылку писать не нужно.

## Хостинг

1. Репозиторий → **Settings → Pages** → Source: `main`, папка `/ (root)`.
2. Через минуту адреса `…github.io/TAPI-Translating-Application-Programming-Interface-/tapi.js` заработают.
3. Запасной вариант: `https://cdn.jsdelivr.net/gh/kpblm4ik/TAPI-Translating-Application-Programming-Interface-@main/tapi.js`.

## Эндпоинты

- `/v1/all.json` — словарь.
- `/v1/schema.json` — JSON-схема для проверки.

## Формат слова

```json
"имба": {
  "literary_ru": "чрезмерно сильный ...",
  "translation_en": "overpowered (OP)",
  "category": "gaming",
  "aliases": ["имбовый"],
  "example": "Эта катушка просто имба"
}
```

- `category`: `gaming`, `roblox`, `slang`, `it`, `general`.
- `aliases`: другие формы слова и фразы. Падежи существительных скрипт угадывает сам, а для глаголов на -ить/-ать/-ять сам строит личные формы и прошедшее время (шарить → шарю, шарит, шарил). Остальные формы и фразы из нескольких слов добавляйте в `aliases`.
- `exact: true`: не угадывать окончания. Нужно для коротких слов, которые легко спутать с другими (ник ≠ Ника, чит ≠ Чита).

## Как добавить слово

Допишите запись в `v1/all.json` и проверьте файл по `schema.json`. Хорошая запись: объясняет смысл одной фразой, не повторяет само слово и указывает категорию. Слова с несколькими значениями лучше описывать по контексту («в играх: …»).
