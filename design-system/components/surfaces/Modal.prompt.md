Модалка — для необратимых решений. Всё остальное — нижний шит.

```jsx
<Modal title="Удалить расклад?" description="История и толкования исчезнут навсегда."
  actions={<><Button variant="danger" block>Удалить</Button><Button variant="text" block>Отмена</Button></>}
  onClose={close} />
```

Ставится внутри контейнера с `position:relative` (экран Mini App). Скрим — `--scrim` + `--blur-overlay`.
