# 🚀 TAPI — Translating Application Programming Interface

Открытый словарь для перевода интернет-сленга, игрового жаргона и неологизмов в литературную речь и на английский. Подключается к любому сайту **одной строкой**.

## Подключение

```html
<script src="https://kpblm4ik.github.io/TAPI-Translating-Application-Programming-Interface-/tapi.js" defer></script>
```

Скрипт сам найдёт на странице слова из словаря, подчеркнёт их точками, а при наведении (на телефоне при нажатии) покажет перевод.

### Настройки (необязательно)

| Атрибут | Значения | По умолчанию |
|---------|----------|--------------|
| `data-lang` | `literary_ru`, `translation_en` | `literary_ru` |
| `data-mode` | `hover` (подсказка), `replace` (заменить слово), `off` (только API) | `hover` |
| `data-scope` | CSS-селектор области страницы | `body` |
| `data-src` | свой адрес словаря | `v1/all.json` рядом со скриптом |

```html
<script src=".../tapi.js" data-lang="translation_en" data-scope="main" defer></script>
```

Не хотите переводить фрагмент: `<div class="tapi-skip">…</div>` или `translate="no"`.

### JavaScript API

```js
await TAPI.ready;
TAPI.translate('имба');                   // "чрезмерно сильный, ..."
TAPI.translate('имба', 'translation_en'); // "overpowered (OP)"
TAPI.lookup('Нерфнули');                  // вся запись словаря
TAPI.refresh();                           // перепроверить страницу вручную
```

## Как включить хостинг

1. Репозиторий → **Settings → Pages** → Source: `main`, папка `/ (root)`.
2. Через минуту адрес `https://kpblm4ik.github.io/TAPI-Translating-Application-Programming-Interface-/tapi.js` заработает.
3. Запасной вариант без Pages: `https://cdn.jsdelivr.net/gh/kpblm4ik/TAPI-Translating-Application-Programming-Interface-@main/tapi.js`.

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

`aliases` — другие формы слова и фразы (глаголы, «нерфнули» и т. п.). Падежные окончания существительных скрипт отрабатывает сам, а глаголы нужно перечислять в `aliases`. Фразы из нескольких слов тоже можно добавлять ключом («испанский стыд»).

## Как добавить слово

Допишите запись в `v1/all.json` и проверьте файл по `schema.json`. Хорошая запись: объясняет смысл одной фразой, не повторяет само слово и указывает категорию.
