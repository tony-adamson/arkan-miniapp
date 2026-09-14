Нижний шит — выбор расклада, детали карты, настройки. Появляется снизу за `--dur-slow`.

```jsx
<BottomSheet title="Значение карты" footer={<Button block onClick={close}>Понятно</Button>} onClose={close}>
  <p className="t-read">Башня — про конструкции, которые держались усилием.</p>
</BottomSheet>
```

Учитывает `--safe-bottom` (системная панель Telegram). Закрытие — тап по скриму или свайп вниз.
