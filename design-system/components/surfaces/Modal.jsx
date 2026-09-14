import React from "react";

/** Модальное окно — только для решений, которые нельзя отложить (согласие, удаление). */
export function Modal({open = true, title, description, children, actions, onClose, style}) {
  if (!open) return null;
  return (
    <div role="dialog" aria-modal="true" aria-label={title} style={{
      position:"absolute", inset:0, display:"grid", placeItems:"center", padding:"var(--space-6)",
      background:"var(--scrim)", backdropFilter:"var(--blur-overlay)", WebkitBackdropFilter:"var(--blur-overlay)",
      animation:"arkan-fade var(--dur-base) var(--ease-enter) both", zIndex:40
    }} onClick={onClose}>
      <style>{"@keyframes arkan-fade{from{opacity:0}to{opacity:1}}@keyframes arkan-pop{from{opacity:0;transform:translateY(10px) scale(.98)}to{opacity:1;transform:none}}"}</style>
      <div onClick={e => e.stopPropagation()} style={{
        width:"100%", maxWidth:340, background:"var(--surface-elevated)",
        border:"var(--border-width) solid var(--border)", borderRadius:"var(--radius-xl)",
        boxShadow:"var(--shadow-3)", padding:"var(--space-7)",
        display:"flex", flexDirection:"column", gap:"var(--space-5)",
        animation:"arkan-pop var(--dur-slow) var(--ease-enter) both", ...style
      }}>
        {title && <h2 className="t-heading" style={{margin:0}}>{title}</h2>}
        {description && <p className="t-body" style={{margin:0, color:"var(--text-secondary)", textWrap:"pretty"}}>{description}</p>}
        {children}
        {actions && <div style={{display:"flex", flexDirection:"column", gap:"var(--space-3)", marginTop:"var(--space-2)"}}>{actions}</div>}
      </div>
    </div>
  );
}
