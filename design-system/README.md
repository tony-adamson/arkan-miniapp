# Дизайн-система «Аркан»

Токены, 12 компонентов и кликабельный UI-кит Mini App на 7 экранов. Спроектирована
в Claude Design. Целевое ощущение — спокойный тёмный интерфейс с ощущением ритуала,
ближе к приложению для медитации или дневника, чем к магическому салону.

Полное руководство — тон, визуальные основы, анимация раскрытия карты —
в [GUIDE.md](GUIDE.md).

## Структура

| Путь | Что внутри |
| --- | --- |
| `styles.css` | единая точка входа, только `@import` токенов |
| `tokens/` | цвета, типографика, шрифты, отступы, радиусы, тени, анимация, base |
| `components/` | 12 React-компонентов, у каждого `.jsx`, `.d.ts` (контракт пропсов) и `.prompt.md` (когда применять) |
| `ui_kits/arkan-miniapp/` | кликабельный прототип 390×844: онбординг → вопрос → расклад → итог → история → карта дня → профиль |
| `_ds_bundle.js` | собранный бандл компонентов (`window.DesignSystem_8c38cb`) для UI-кита |

| Группа | Компоненты |
| --- | --- |
| `core/` | Button, Chip |
| `forms/` | QuestionInput |
| `tarot/` | TarotCard, RitualLoader |
| `chat/` | Message, QuickReplies |
| `surfaces/` | SpreadCard, Modal, BottomSheet |
| `feedback/` | EmptyState, ErrorState |

## Назначение токенов

Разметка использует только семантические токены (`var(--surface)`,
`var(--text-secondary)`, `var(--accent-border)`), а не сырые значения шкал.
Сырые шкалы (`--ink-*`, `--iris-*`, `--candle-*`) нужны только внутри токенов.

Каноническая копия токенов — `landing/site/assets/css/tokens/`: по ней считается
контраст и собирается CSS лендинга. `design-system/tokens/` — её побайтное зеркало;
правка токена делается в обеих копиях, сверка — `cmp` по каждому файлу.

| Файл | Что задаёт |
| --- | --- |
| `tokens/colors.css` | шкалы и семантические цвета обеих тем, контраст указан в комментариях |
| `tokens/typography.css` | шкала кегля и утилитарные классы `t-title`, `t-body`, `t-read`… |
| `tokens/fonts.css` | `@font-face` для Manrope (интерфейс), Literata (толкование), Cormorant Garamond (акцент) |
| `tokens/spacing.css` | шаг отступов, поля экрана, минимальная зона касания |
| `tokens/radii.css` | радиусы от `--radius-xs` до `--radius-pill` |
| `tokens/elevation.css` | тени и свечение акцента |
| `tokens/motion.css` | длительности и кривые, включая сценарий раскрытия карты |
| `tokens/base.css` | базовые стили `body`, фокус, выделение, `prefers-reduced-motion` |

## Подключение

```html
<link rel="stylesheet" href="/design-system/styles.css">
```

Компоненты используют только CSS-переменные из токенов и переносятся в приложение
как есть, без переписывания стилей.

Шрифты самохостятся: `tokens/fonts.css` ссылается на woff2 по абсолютному пути
`/assets/fonts/`, файлы лежат в `landing/site/assets/fonts/`. Внешних CDN для шрифтов нет.

UI-кит открывается `ui_kits/arkan-miniapp/index.html` через любой статический сервер
из корня `design-system/`. React, Babel и иконки Lucide он грузит с CDN — это прототип,
а не продакшен-сборка.

## Две темы

- **Тёмная — по умолчанию** (`:root` и `[data-theme="dark"]`). Основной сценарий
  — телефон вечером в тёмной комнате.
- **Светлая** — `[data-theme="light"]` на корневом элементе.

Обе темы обязательны и проверены по контрасту WCAG
(`landing/tools/contrast-check.py`).
