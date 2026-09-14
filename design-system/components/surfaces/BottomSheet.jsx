import React from "react";

/** Нижний шит — основной способ показать дополнительное поверх экрана в Mini App. */
export function BottomSheet({open = true, title, children, footer, onClose, style}) {
  if (!open) return null;
  return (
    <div style={{position:"absolute", inset:0, display:"flex", alignItems:"flex-end", zIndex:40,
      background:"var(--scrim)", backdropFilter:"var(--blur-overlay)", WebkitBackdropFilter:"var(--blur-overlay)",
      animation:"arkan-fade var(--dur-base) var(--ease-enter) both"}} onClick={onClose}>
      <style>{"@keyframes arkan-fade{from{opacity:0}to{opacity:1}}@keyframes arkan-slide{from{transform:translateY(100%)}to{transform:none}}"}</style>
      <section role="dialog" aria-modal="true" aria-label={title} onClick={e => e.stopPropagation()} style={{
        width:"100%", maxHeight:"88%", overflowY:"auto",
        background:"var(--surface-elevated)", borderTopLeftRadius:"var(--radius-sheet)", borderTopRightRadius:"var(--radius-sheet)",
        borderTop:"var(--border-width) solid var(--border)", boxShadow:"var(--shadow-sheet)",
        padding:"var(--space-4) var(--screen-pad-x) calc(var(--space-8) + var(--safe-bottom))",
        display:"flex", flexDirection:"column", gap:"var(--space-5)",
        animation:"arkan-slide var(--dur-slow) var(--ease-enter) both", ...style
      }}>
        <span aria-hidden="true" style={{width:36, height:4, borderRadius:"var(--radius-pill)", background:"var(--border-strong)", alignSelf:"center", marginBottom:"var(--space-2)"}} />
        {title && <h2 className="t-heading" style={{margin:0}}>{title}</h2>}
        {children}
        {footer && <div style={{marginTop:"var(--space-2)"}}>{footer}</div>}
      </section>
    </div>
  );
}
