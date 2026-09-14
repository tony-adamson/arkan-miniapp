function Summary({question, onHistory}) {
  const {TarotCard, Button, BottomSheet} = window.DesignSystem_8c38cb;
  const spread = window.ARKAN_SPREAD;
  const [sheet, setSheet] = React.useState(false);
  return (
    <>
      <Scroll style={{gap:"var(--space-8)"}}>
        <div style={{display:"flex", flexDirection:"column", gap:"var(--space-3)"}}>
          <span className="t-label" style={{color:"var(--text-tertiary)"}}>Расклад целиком · сегодня, 21:04</span>
          <h1 className="t-heading" style={{margin:0, textWrap:"pretty"}}>«{question}»</h1>
        </div>
        <div style={{display:"flex", gap:"var(--space-4)", justifyContent:"space-between"}}>
          {spread.map(c => <TarotCard key={c.name} size="sm" state="face" numeral={c.numeral} name={c.name} position={c.position} />)}
        </div>
        <div style={{display:"flex", flexDirection:"column", gap:"var(--space-7)"}}>
          {spread.map(c => (
            <section key={c.name} style={{display:"flex", flexDirection:"column", gap:"var(--space-3)"}}>
              <span className="t-label" style={{color:"var(--accent)"}}>{c.position}</span>
              <h2 className="t-display" style={{margin:0, fontSize:26, lineHeight:1.15}}>{c.name}</h2>
              <div className="t-read" style={{color:"var(--text-secondary)"}}>{c.text.map((t, n) => <p key={n} style={{margin: n ? "var(--read-para-gap) 0 0" : 0}}>{t}</p>)}</div>
            </section>
          ))}
        </div>
        <div style={{padding:"var(--space-5)", background:"var(--accent-muted)", border:"1px solid var(--accent-border)", borderRadius:"var(--radius-lg)", display:"flex", flexDirection:"column", gap:"var(--space-3)"}}>
          <span className="t-label" style={{color:"var(--accent)"}}>Шаг на неделю</span>
          <p className="t-body" style={{margin:0}}>Не принимать решение до пятницы. Записать, что изменится, если вы согласитесь.</p>
        </div>
      </Scroll>
      <Dock>
        <Button size="lg" block onClick={onHistory}>Сохранить и закрыть</Button>
        <Button variant="text" block onClick={() => setSheet(true)}>Поделиться</Button>
      </Dock>
      <BottomSheet open={sheet} onClose={() => setSheet(false)} title="Поделиться раскладом"
        footer={<Button block onClick={() => setSheet(false)}>Отправить в чат</Button>}>
        <p className="t-body" style={{margin:0, color:"var(--text-secondary)"}}>В сообщение попадут названия карт и итоговый шаг. Ваш вопрос и толкования остаются здесь.</p>
      </BottomSheet>
    </>
  );
}
Object.assign(window, {Summary});
