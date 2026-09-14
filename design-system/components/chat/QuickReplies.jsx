import React from "react";
import { Chip } from "../core/Chip.jsx";

/** Набор чипов быстрых ответов под уточняющим вопросом продукта. */
export function QuickReplies({options = [], value, onSelect, disabled = false, label, style}) {
  return (
    <div style={{display:"flex", flexDirection:"column", gap:"var(--space-4)", ...style}}>
      {label && <span className="t-label" style={{color:"var(--text-tertiary)"}}>{label}</span>}
      <div style={{display:"flex", flexWrap:"wrap", gap:"var(--space-3)"}}>
        {options.map(o => (
          <Chip key={o} selected={value === o} disabled={disabled}
            onClick={onSelect ? () => onSelect(o) : undefined}>{o}</Chip>
        ))}
      </div>
    </div>
  );
}
