const SUGGESTIONS = [
  "Что мне мешает принять это решение",
  "Как развиваются наши отношения",
  "Стоит ли соглашаться на новую роль",
  "Что я не вижу в этой ситуации"
];

function AskQuestion({onSubmit}) {
  const {QuestionInput, Chip, Button} = window.DesignSystem_8c38cb;
  const [q, setQ] = React.useState("");
  const [state, setState] = React.useState("idle");
  const send = () => {
    if (q.trim().length < 8) return setState("error");
    setState("sending");
    setTimeout(() => { setState("idle"); onSubmit(q.trim()); }, 700);
  };
  return (
    <>
      <Scroll style={{gap:"var(--space-8)"}}>
        <div style={{display:"flex", flexDirection:"column", gap:"var(--space-4)"}}>
          <span className="t-label" style={{color:"var(--text-tertiary)"}}>Новый расклад</span>
          <h1 className="t-title" style={{margin:0, textWrap:"pretty"}}>О чём вы думаете сегодня?</h1>
          <p className="t-body" style={{margin:0, color:"var(--text-secondary)", textWrap:"pretty"}}>
            Опишите ситуацию своими словами — на пару фраз. Чем конкретнее вопрос, тем точнее расклад.
          </p>
        </div>
        <QuestionInput value={q} onChange={v => { setQ(v); if (state === "error") setState("idle"); }}
          onSubmit={send} state={state} />
        <div style={{display:"flex", flexDirection:"column", gap:"var(--space-4)"}}>
          <span className="t-label" style={{color:"var(--text-tertiary)"}}>Если сложно начать</span>
          <div style={{display:"flex", flexWrap:"wrap", gap:"var(--space-3)"}}>
            {SUGGESTIONS.map(s => <Chip key={s} onClick={() => setQ(s)} selected={q === s}>{s}</Chip>)}
          </div>
        </div>
      </Scroll>
      <Dock>
        <Button size="lg" block loading={state === "sending"} disabled={!q.trim()} onClick={send}>Собрать расклад</Button>
      </Dock>
    </>
  );
}
Object.assign(window, {AskQuestion});
