import React from "react";

/** Карточка расклада в истории: вопрос, дата, мини-карты, статус. */
export function SpreadCard({question, date, cards = [], status = "done", onOpen, style}) {
  const [press, setPress] = React.useState(false);
  const label = status === "unfinished" ? "Не завершён" : status === "today" ? "Сегодня" : null;
  return (
    <article
      role={onOpen ? "button" : undefined} tabIndex={onOpen ? 0 : undefined} onClick={onOpen}
      onKeyDown={onOpen ? (e => (e.key === "Enter") && onOpen()) : undefined}
      onPointerDown={() => setPress(true)} onPointerUp={() => setPress(false)} onPointerLeave={() => setPress(false)}
      style={{
        display:"flex", flexDirection:"column", gap:"var(--space-5)",
        padding:"var(--space-5)", background:"var(--surface-elevated)",
        border:"var(--border-width) solid var(--border)", borderRadius:"var(--radius-lg)",
        boxShadow:"var(--shadow-1)", cursor: onOpen ? "pointer" : "default",
        transform: press && onOpen ? "scale(.99)" : "scale(1)",
        transition:"transform var(--dur-instant) var(--ease-standard), border-color var(--dur-fast) var(--ease-standard)",
        WebkitTapHighlightColor:"transparent", ...style
      }}>
      <header style={{display:"flex", alignItems:"baseline", justifyContent:"space-between", gap:"var(--space-4)"}}>
        <span className="t-caption" style={{color:"var(--text-tertiary)"}}>{date}</span>
        {label && <span className="t-label" style={{
          color: status === "unfinished" ? "var(--warning)" : "var(--accent-2)",
          background: status === "unfinished" ? "var(--warning-muted)" : "var(--accent-2-muted)",
          padding:"4px 8px", borderRadius:"var(--radius-pill)"
        }}>{label}</span>}
      </header>
      <p className="t-lead" style={{margin:0, color:"var(--text-primary)", textWrap:"pretty"}}>{question}</p>
      <footer style={{display:"flex", alignItems:"center", gap:"var(--space-3)", flexWrap:"wrap"}}>
        {cards.map(c => (
          <span key={c} className="t-caption" style={{
            fontFamily:"var(--font-accent)", fontSize:"15px", color:"var(--text-secondary)",
            border:"var(--border-width) solid var(--border)", borderRadius:"var(--radius-xs)",
            padding:"4px 10px", background:"var(--surface-inset)"
          }}>{c}</span>
        ))}
      </footer>
    </article>
  );
}
