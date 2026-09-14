Чип быстрого ответа под репликой продукта: 2–4 штуки, переносятся по строкам.

```jsx
<div style={{display:"flex",flexWrap:"wrap",gap:"var(--space-3)"}}>
  <Chip onClick={pick}>Скорее да</Chip>
  <Chip selected>Пока не понимаю</Chip>
</div>
```

Высота ≥44px, pill-радиус. Выбранный чип — `--accent-muted` + `--accent-border`; после отправки остальные чипы исчезают, выбранный превращается в реплику пользователя.
