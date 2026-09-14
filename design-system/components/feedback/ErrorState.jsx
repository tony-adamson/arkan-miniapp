import React from "react";

/** Состояние ошибки: inline (в потоке диалога) или screen (весь экран). */
export function ErrorState({
  title = "Не получилось получить ответ", description = "Связь прервалась. Расклад сохранён — можно продолжить с той же карты.",
  action, variant = "inline", style
}) {
  const inline = variant === "inline";
  return (
    <div role="alert" style={{
      display:"flex", flexDirection: inline ? "row" : "column",
      alignItems: inline ? "flex-start" : "center", textAlign: inline ? "left" : "center",
      gap:"var(--space-4)", padding: inline ? "var(--space-5)" : "var(--space-10) var(--space-6)",
      background: inline ? "var(--danger-muted)" : "transparent",
      border: inline ? "var(--border-width) solid var(--danger)" : "none",
      borderRadius:"var(--radius-md)", ...style
    }}>
      <span aria-hidden="true" style={{
        width:20, height:20, borderRadius:"50%", border:"1.5px solid var(--danger)", color:"var(--danger)",
        display:"grid", placeItems:"center", fontSize:13, fontWeight:700, flex:"none", marginTop: inline ? 2 : 0
      }}>!</span>
      <div style={{display:"flex", flexDirection:"column", gap:"var(--space-3)", maxWidth:320}}>
        <span className="t-lead" style={{color:"var(--text-primary)"}}>{title}</span>
        {description && <span className="t-body" style={{color:"var(--text-secondary)", textWrap:"pretty"}}>{description}</span>}
        {action && <div style={{marginTop:"var(--space-2)"}}>{action}</div>}
      </div>
    </div>
  );
}
