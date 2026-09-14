const {useState} = React;

function Phone({children, theme = "dark"}) {
  return (
    <div data-theme={theme} style={{
      width:390, height:844, position:"relative", overflow:"hidden",
      borderRadius:44, background:"var(--surface)", color:"var(--text-primary)",
      border:"1px solid var(--border-strong)", boxShadow:"var(--shadow-3)",
      display:"flex", flexDirection:"column", fontFamily:"var(--font-core)"
    }}>{children}</div>
  );
}

function TgHeader({title, onBack, right}) {
  return (
    <header style={{
      flex:"none", height:56, display:"flex", alignItems:"center", gap:"var(--space-4)",
      padding:"0 var(--screen-pad-x)", background:"var(--surface)",
      borderBottom:"1px solid var(--border)", marginTop:18
    }}>
      {onBack
        ? <button onClick={onBack} aria-label="Назад" style={{all:"unset", cursor:"pointer", color:"var(--accent)", display:"grid", placeItems:"center", width:32, height:32, marginLeft:-6}}><Icon name="chevron-left" size={22} /></button>
        : <span style={{fontFamily:"var(--font-accent)", fontWeight:300, letterSpacing:".14em", fontSize:15, color:"var(--text-secondary)"}}>АРКАН</span>}
      <span className="t-body" style={{fontWeight:600, flex:1, textAlign:"center", marginLeft:onBack?0:-40}}>{title}</span>
      <span style={{width:32, display:"grid", placeItems:"center", color:"var(--text-tertiary)"}}>{right}</span>
    </header>
  );
}

function Scroll({children, pad = true, style}) {
  return <div style={{
    flex:1, overflowY:"auto", overflowX:"hidden",
    padding: pad ? "var(--space-6) var(--screen-pad-x) var(--space-9)" : 0,
    display:"flex", flexDirection:"column", ...style}}>{children}</div>;
}

function Dock({children}) {
  return <div style={{
    flex:"none", padding:"var(--space-4) var(--screen-pad-x) calc(var(--space-5) + var(--safe-bottom))",
    borderTop:"1px solid var(--border)", background:"var(--surface)",
    display:"flex", flexDirection:"column", gap:"var(--space-3)"}}>{children}</div>;
}

const TABS = [
  {id:"ask", label:"Расклад", icon:"sparkle"},
  {id:"day", label:"Карта дня", icon:"sun"},
  {id:"history", label:"История", icon:"clock"},
  {id:"profile", label:"Профиль", icon:"user"}
];

function TabBar({active, onChange}) {
  return (
    <nav style={{
      flex:"none", display:"grid", gridTemplateColumns:"repeat(4,1fr)",
      borderTop:"1px solid var(--border)", background:"var(--surface)",
      padding:"var(--space-3) var(--space-2) calc(var(--space-3) + var(--safe-bottom))"
    }}>
      {TABS.map(t => {
        const on = active === t.id;
        return (
          <button key={t.id} onClick={() => onChange(t.id)} style={{
            all:"unset", cursor:"pointer", minHeight:"var(--hit-min)",
            display:"flex", flexDirection:"column", alignItems:"center", gap:6,
            color: on ? "var(--accent)" : "var(--text-tertiary)",
            transition:"color var(--dur-fast) var(--ease-standard)"
          }}>
            <Icon name={t.icon} size={20} />
            <span style={{font:"600 10px/1 var(--font-core)", letterSpacing:".02em"}}>{t.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

Object.assign(window, {Phone, TgHeader, Scroll, Dock, TabBar});
