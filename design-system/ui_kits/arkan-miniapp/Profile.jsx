function Row({icon, title, hint, right, onClick, danger}) {
  return (
    <button onClick={onClick} style={{
      all:"unset", cursor:"pointer", display:"flex", alignItems:"center", gap:"var(--space-4)",
      minHeight:"var(--hit-min)", padding:"var(--space-4) var(--space-5)",
      background:"var(--surface-elevated)", border:"1px solid var(--border)", borderRadius:"var(--radius-md)",
      color: danger ? "var(--danger)" : "var(--text-primary)"
    }}>
      <Icon name={icon} size={18} style={{color: danger ? "var(--danger)" : "var(--text-tertiary)"}} />
      <span style={{flex:1, display:"flex", flexDirection:"column", gap:2}}>
        <span className="t-body">{title}</span>
        {hint && <span className="t-caption" style={{color:"var(--text-tertiary)"}}>{hint}</span>}
      </span>
      {right}
    </button>
  );
}

function Switch({on, onToggle}) {
  return (
    <span onClick={e => { e.stopPropagation(); onToggle(); }} role="switch" aria-checked={on} style={{
      width:44, height:26, borderRadius:"var(--radius-pill)", flex:"none", cursor:"pointer",
      background: on ? "var(--accent)" : "var(--surface-inset)", border:"1px solid " + (on ? "var(--accent-border)" : "var(--border-strong)"),
      display:"flex", alignItems:"center", padding:2,
      transition:"background var(--dur-fast) var(--ease-standard)"
    }}>
      <span style={{width:20, height:20, borderRadius:"50%", background: on ? "var(--text-on-accent)" : "var(--text-tertiary)",
        transform:"translateX(" + (on ? 18 : 0) + "px)", transition:"transform var(--dur-fast) var(--ease-standard)"}} />
    </span>
  );
}

function Profile({theme, onTheme}) {
  const {Modal, Button} = window.DesignSystem_8c38cb;
  const [evening, setEvening] = React.useState(true);
  const [confirm, setConfirm] = React.useState(false);
  return (
    <>
      <Scroll style={{gap:"var(--space-7)"}}>
        <div style={{display:"flex", alignItems:"center", gap:"var(--space-5)"}}>
          <span style={{width:56, height:56, borderRadius:"50%", background:"var(--surface-inset)", border:"1px solid var(--border)", display:"grid", placeItems:"center", fontFamily:"var(--font-accent)", fontSize:22, color:"var(--text-secondary)"}}>А</span>
          <span style={{display:"flex", flexDirection:"column", gap:2}}>
            <span className="t-lead">Анна</span>
            <span className="t-caption" style={{color:"var(--text-tertiary)"}}>17 раскладов · с февраля 2026</span>
          </span>
        </div>
        <section style={{display:"flex", flexDirection:"column", gap:"var(--space-3)"}}>
          <span className="t-label" style={{color:"var(--text-tertiary)"}}>Настройки</span>
          <Row icon="moon" title="Тёмная тема" hint={theme === "dark" ? "Включена" : "Выключена"} right={<Switch on={theme === "dark"} onToggle={() => onTheme(theme === "dark" ? "light" : "dark")} />} />
          <Row icon="bell" title="Напоминание вечером" hint="21:00, каждый день" right={<Switch on={evening} onToggle={() => setEvening(v => !v)} />} />
          <Row icon="languages" title="Язык" hint="Русский" right={<Icon name="chevron-right" size={16} style={{color:"var(--text-tertiary)"}} />} />
        </section>
        <section style={{display:"flex", flexDirection:"column", gap:"var(--space-3)"}}>
          <span className="t-label" style={{color:"var(--text-tertiary)"}}>Данные</span>
          <Row icon="download" title="Выгрузить историю" hint="Файл придёт в чат" right={<Icon name="chevron-right" size={16} style={{color:"var(--text-tertiary)"}} />} />
          <Row icon="trash-2" title="Удалить все расклады" danger onClick={() => setConfirm(true)} />
        </section>
        <p className="t-caption" style={{margin:0, color:"var(--text-tertiary)", textAlign:"center"}}>Аркан не даёт медицинских, юридических и финансовых советов.</p>
      </Scroll>
      <Modal open={confirm} onClose={() => setConfirm(false)} title="Удалить все расклады?"
        description="История и толкования исчезнут навсегда. Отменить это будет нельзя."
        actions={<><Button variant="danger" block onClick={() => setConfirm(false)}>Удалить</Button><Button variant="text" block onClick={() => setConfirm(false)}>Отмена</Button></>} />
    </>
  );
}
Object.assign(window, {Profile});
