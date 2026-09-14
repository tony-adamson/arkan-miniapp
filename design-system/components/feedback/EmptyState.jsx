import React from "react";

/** Пустое состояние: история без раскладов, карта дня до вытягивания, пустой поиск. */
export function EmptyState({title, description, action, glyph = "circle", compact = false, style}) {
  return (
    <div style={{
      display:"flex", flexDirection:"column", alignItems:"center", textAlign:"center",
      gap:"var(--space-5)", padding: compact ? "var(--space-8) var(--space-6)" : "var(--space-11) var(--space-6)", ...style
    }}>
      <Glyph kind={glyph} />
      <div style={{display:"flex", flexDirection:"column", gap:"var(--space-3)", maxWidth:300}}>
        {title && <h3 className="t-heading" style={{margin:0}}>{title}</h3>}
        {description && <p className="t-body" style={{margin:0, color:"var(--text-secondary)", textWrap:"pretty"}}>{description}</p>}
      </div>
      {action}
    </div>
  );
}

function Glyph({kind}) {
  const common = {width:56, height:56, borderRadius: kind === "card" ? "var(--radius-sm)" : "50%",
    border:"1px solid var(--border-strong)", display:"grid", placeItems:"center", flex:"none"};
  return (
    <span aria-hidden="true" style={common}>
      <span style={{width:8, height:8, borderRadius:"50%", background:"var(--accent-muted)", border:"1px solid var(--accent-border)"}} />
    </span>
  );
}
