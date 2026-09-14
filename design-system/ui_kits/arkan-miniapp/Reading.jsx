function Reading({question, onFinish}) {
  const {TarotCard, Message, QuickReplies, RitualLoader, Button} = window.DesignSystem_8c38cb;
  const spread = window.ARKAN_SPREAD;
  const [i, setI] = React.useState(0);
  const [phase, setPhase] = React.useState("loading"); // loading | back | dim | flip | text | reply
  const [answers, setAnswers] = React.useState({});
  const [loadStep, setLoadStep] = React.useState(0);
  const scrollRef = React.useRef(null);
  const card = spread[i];

  React.useEffect(() => {
    if (phase !== "loading") return;
    const a = setTimeout(() => setLoadStep(1), 900);
    const b = setTimeout(() => setLoadStep(2), 1800);
    const c = setTimeout(() => setPhase("back"), 2600);
    return () => [a,b,c].forEach(clearTimeout);
  }, [phase]);

  const reveal = () => {
    setPhase("dim");
    setTimeout(() => setPhase("flip"), 760);      // пауза-подъём
    setTimeout(() => setPhase("text"), 1760);     // после переворота
    setTimeout(() => setPhase("reply"), 2600);
  };

  const answer = (opt) => {
    setAnswers(a => ({...a, [i]: opt}));
    setTimeout(() => {
      if (i === spread.length - 1) return onFinish(answers);
      setI(i + 1); setPhase("back");
      if (scrollRef.current) scrollRef.current.scrollTop = 0;
    }, 500);
  };

  if (phase === "loading") return (
    <Scroll style={{justifyContent:"center"}}>
      <RitualLoader activeStep={loadStep} caption="Три карты — прошлое не спрашиваем" />
    </Scroll>
  );

  const dim = phase === "dim" || phase === "flip";
  const open = phase === "flip" || phase === "text" || phase === "reply";

  return (
    <>
      <div ref={scrollRef} style={{flex:1, overflowY:"auto", padding:"var(--space-5) var(--screen-pad-x) var(--space-9)", display:"flex", flexDirection:"column", gap:"var(--space-7)"}}>
        <div style={{
          display:"flex", flexDirection:"column", gap:"var(--space-5)",
          opacity: dim ? .35 : 1, filter: dim ? "blur(3px)" : "none",
          transition:"opacity var(--dur-base) var(--ease-standard), filter var(--dur-base) var(--ease-standard)"
        }}>
          <div style={{display:"flex", gap:6}}>
            {spread.map((s, n) => (
              <span key={n} style={{flex:1, height:2, borderRadius:1, background: n <= i ? "var(--accent)" : "var(--border-strong)", transition:"background var(--dur-slow) var(--ease-standard)"}} />
            ))}
          </div>
          <p className="t-caption" style={{margin:0, color:"var(--text-tertiary)"}}>«{question}»</p>
        </div>

        <div style={{
          display:"flex", justifyContent:"center", padding:"var(--space-4) 0",
          transform: dim ? "translateY(-8px)" : "none",
          transition:"transform var(--dur-slow) var(--ease-ritual)"
        }}>
          <div style={{filter: dim ? "drop-shadow(0 0 34px rgba(142,140,216,.30))" : "none", transition:"filter var(--dur-reveal) var(--ease-ritual)"}}>
            <TarotCard size="lg" numeral={card.numeral} name={card.name} position={card.position}
              state={open ? (phase === "flip" ? "revealing" : "face") : "back"}
              onReveal={phase === "back" ? reveal : undefined} />
          </div>
        </div>

        {phase === "back" && (
          <p className="t-body" style={{margin:0, textAlign:"center", color:"var(--text-tertiary)"}}>Коснитесь карты, когда будете готовы</p>
        )}

        {(phase === "text" || phase === "reply") && (
          <Message from="arkan" longform appear>
            {card.text.map((p, n) => (
              <p key={n} style={{margin: n ? "var(--read-para-gap) 0 0" : 0, animation:"arkan-rise var(--dur-slow) var(--ease-enter) both", animationDelay:(n * 70) + "ms"}}>{p}</p>
            ))}
          </Message>
        )}

        {phase === "reply" && (
          <div style={{display:"flex", flexDirection:"column", gap:"var(--space-5)", animation:"arkan-rise var(--dur-base) var(--ease-enter) both"}}>
            <p className="t-lead" style={{margin:0}}>{card.ask}</p>
            <QuickReplies options={card.options} value={answers[i]} onSelect={answer} />
          </div>
        )}

        {answers[i] && <Message from="user" time={"21:0" + (4 + i)}>{answers[i]}</Message>}
      </div>
      <Dock>
        <Button variant="text" block onClick={() => onFinish(answers)}>Свернуть расклад</Button>
      </Dock>
    </>
  );
}
Object.assign(window, {Reading});
