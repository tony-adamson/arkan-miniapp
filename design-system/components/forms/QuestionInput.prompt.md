Поле ввода вопроса — единственное текстовое поле продукта; используется на экране формулировки и в диалоге расклада.

```jsx
<QuestionInput value={q} onChange={setQ} onSubmit={send} state={sending ? "sending" : "idle"} />
```

Состояния: idle (обводка `--border`), focus (`--accent-border` + кольцо `--accent-muted`), error (`--danger` + текст ошибки вместо подсказки), sending (opacity .6, спиннер в кнопке). Кнопка отправки неактивна при пустом значении.
