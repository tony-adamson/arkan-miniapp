import React from "react";

const DEFAULT_STEPS = ["Слушаю вопрос", "Подбираю расклад", "Раскладываю карты"];

/** Экран ожидания генерации: дышащий круг, шаги без процентов, отсчёт вместо спиннера. */
export function RitualLoader({
  steps = DEFAULT_STEPS, activeStep = 0, caption = "Это займёт несколько секунд", compact = false, style
}) {
  return (
    <div role="status" aria-live="polite" style={{
      display:"flex", flexDirection:"column", alignItems:"center", gap:"var(--space-7)",
      padding: compact ? "var(--space-7) 0" : "var(--space-11) 0", ...style
    }}>
      <style>{"@keyframes arkan-breath{0%,100%{transform:scale(1);opacity:.55}50%{transform:scale(1.12);opacity:1}}@keyframes arkan-halo{0%,100%{transform:scale(.92);opacity:.18}50%{transform:scale(1.18);opacity:.42}}"}</style>
      <div style={{position:"relative", width: compact ? 72 : 108, height: compact ? 72 : 108, display:"grid", placeItems:"center"}}>
        <span aria-hidden="true" style={{
          position:"absolute", inset:0, borderRadius:"50%", background:"var(--accent-muted)",
          animation:"arkan-halo var(--dur-breath) var(--ease-breath) infinite"
        }} />
        <span aria-hidden="true" style={{
          position:"absolute", inset:"22%", borderRadius:"50%", border:"1px solid var(--accent-border)",
          animation:"arkan-breath var(--dur-breath) var(--ease-breath) infinite"
        }} />
        <span aria-hidden="true" style={{width:6, height:6, borderRadius:"50%", background:"var(--accent)"}} />
      </div>
      <div style={{display:"flex", flexDirection:"column", gap:"var(--space-4)", alignItems:"center"}}>
        {steps.map((s, i) => (
          <span key={s} className={i === activeStep ? "t-lead" : "t-body"} style={{
            color: i === activeStep ? "var(--text-primary)" : "var(--text-tertiary)",
            opacity: i > activeStep ? .5 : 1,
            transition:"color var(--dur-slow) var(--ease-standard), opacity var(--dur-slow) var(--ease-standard)"
          }}>{s}</span>
        ))}
      </div>
      {caption && <span className="t-caption" style={{color:"var(--text-tertiary)"}}>{caption}</span>}
    </div>
  );
}
