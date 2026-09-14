Строка истории раскладов. Вопрос — главное, карты — вторичная метка.

```jsx
<SpreadCard date="вчера, 21:40" question="Стоит ли соглашаться на новую роль"
  cards={["Башня","Жрица","Шестёрка жезлов"]} status="unfinished" onOpen={open} />
```

Статусы: done (без метки), today (`--accent-2`), unfinished (`--warning`).
