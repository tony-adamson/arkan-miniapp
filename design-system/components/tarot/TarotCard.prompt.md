Карта таро. В раскладе всегда одна карта в фокусе — размер lg; в истории и итоге — sm/md рядами.

```jsx
<TarotCard size="lg" state={open ? "face" : "back"} numeral="XVI" name="Башня"
  position="Что уже происходит" onReveal={() => setOpen(true)} />
```

Переворот: `rotateY(180deg)` за `--dur-reveal` с `--ease-ritual`; `state="revealing"` добавляет короткую подсветку. Название появляется только после раскрытия — до этого видна только подпись позиции.
