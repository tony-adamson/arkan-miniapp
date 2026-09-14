Кнопка действия — одна primary на экран, всё остальное secondary или text.

```jsx
<Button variant="primary" size="lg" block onClick={next}>Раскрыть карту</Button>
<Button variant="secondary">Позже</Button>
<Button variant="text">Пропустить</Button>
<Button loading>Отправляем</Button>
```

Варианты: primary (акцент, тёмный текст), secondary (обводка), text, danger. Размеры sm/md/lg — в доке всегда `size="lg" block`. Нажатие: scale(.978) за `--dur-instant`, без теней.
