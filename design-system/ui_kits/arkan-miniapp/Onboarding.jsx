const STEPS = [
  {title:"Это разговор, а не предсказание", body:"Вы формулируете ситуацию. Аркан подбирает расклад и раскрывает его по одной карте, задавая уточняющие вопросы между ними."},
  {title:"Одна карта за ход", body:"Между картами Аркан спрашивает, что откликается, а что нет. Толкование собирается из ваших ответов, а не выдаётся готовым текстом."},
  {title:"Расклады сохраняются", body:"К любому разговору можно вернуться — через неделю или через год. Аркан помнит, о чём вы спрашивали раньше."}
];

function Onboarding({onDone}) {
  const {Button, TarotCard} = window.DesignSystem_8c38cb;
  const [i, setI] = React.useState(0);
  const [consent, setConsent] = React.useState(false);
  const last = i === STEPS.length;
  return (
    <>
      <Scroll style={{justifyContent:"center", gap:"var(--space-9)", textAlign:"center", alignItems:"center"}}>
        {!last ? (
          <>
            <TarotCard size="md" state={i === 0 ? "back" : "face"} numeral={["","II","XVII"][i]} name={["","Жрица","Звезда"][i]} />
            <div style={{display:"flex", flexDirection:"column", gap:"var(--space-5)", maxWidth:300}}>
              <h1 className="t-title" style={{margin:0}}>{STEPS[i].title}</h1>
              <p className="t-body" style={{margin:0, color:"var(--text-secondary)", textWrap:"pretty"}}>{STEPS[i].body}</p>
            </div>
          </>
        ) : (
          <div style={{display:"flex", flexDirection:"column", gap:"var(--space-6)", maxWidth:320, textAlign:"left"}}>
            <h1 className="t-title" style={{margin:0}}>Прежде чем начать</h1>
            <p className="t-read" style={{margin:0, color:"var(--text-secondary)"}}>
              Аркан хранит ваши вопросы и толкования, чтобы возвращаться к ним в следующих раскладах. Данные не передаются третьим лицам и удаляются вместе с аккаунтом.
            </p>
            <label style={{display:"flex", gap:"var(--space-4)", alignItems:"flex-start", cursor:"pointer", padding:"var(--space-4)", border:"1px solid " + (consent ? "var(--accent-border)" : "var(--border)"), background: consent ? "var(--accent-muted)" : "transparent", borderRadius:"var(--radius-md)", transition:"all var(--dur-fast) var(--ease-standard)"}}>
              <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} style={{width:20, height:20, accentColor:"var(--accent)", marginTop:2, flex:"none"}} />
              <span className="t-body" style={{color:"var(--text-primary)"}}>Согласен на обработку персональных данных</span>
            </label>
            <a href="#" className="t-caption">Политика конфиденциальности</a>
          </div>
        )}
      </Scroll>
      <Dock>
        <div style={{display:"flex", gap:6, justifyContent:"center", padding:"0 0 var(--space-3)"}}>
          {STEPS.concat([0]).map((_, n) => (
            <span key={n} style={{width: n === i ? 18 : 6, height:6, borderRadius:3, background: n === i ? "var(--accent)" : "var(--border-strong)", transition:"all var(--dur-base) var(--ease-standard)"}} />
          ))}
        </div>
        <Button size="lg" block disabled={last && !consent} onClick={() => last ? onDone() : setI(i + 1)}>
          {last ? "Начать" : "Дальше"}
        </Button>
        {!last && <Button variant="text" block onClick={() => setI(STEPS.length)}>Пропустить</Button>}
      </Dock>
    </>
  );
}
Object.assign(window, {Onboarding});
