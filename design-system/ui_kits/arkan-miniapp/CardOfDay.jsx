function CardOfDay() {
  const {TarotCard, Button, Message} = window.DesignSystem_8c38cb;
  const [open, setOpen] = React.useState(false);
  const [phase, setPhase] = React.useState("back");
  const reveal = () => { setPhase("revealing"); setTimeout(() => { setPhase("face"); setOpen(true); }, 900); };
  return (
    <>
      <Scroll style={{gap:"var(--space-7)", alignItems:"center", textAlign:"center", justifyContent: open ? "flex-start" : "center"}}>
        <div style={{display:"flex", flexDirection:"column", gap:"var(--space-2)"}}>
          <span className="t-label" style={{color:"var(--accent-2)"}}>30 августа</span>
          <h1 className="t-heading" style={{margin:0}}>Карта дня</h1>
        </div>
        <TarotCard size="lg" state={phase} numeral="IX" name="Отшельник"
          onReveal={phase === "back" ? reveal : undefined} />
        {!open && <p className="t-body" style={{margin:0, color:"var(--text-tertiary)"}}>Одна карта в день, без вопроса</p>}
        {open && (
          <Message from="arkan" longform appear>
            <p style={{margin:0}}>Отшельник — не про одиночество, а про право не быть на связи. Сегодня хорошо получается то, что вы делаете без свидетелей.</p>
            <p style={{margin:"var(--read-para-gap) 0 0"}}>Если день предлагает выбирать между вниманием к себе и чужой срочностью — выберите первое.</p>
          </Message>
        )}
      </Scroll>
      {open && <Dock><Button variant="secondary" size="lg" block>Задать вопрос по этой карте</Button></Dock>}
    </>
  );
}
Object.assign(window, {CardOfDay});
