import React from "react";

export function Chip({children, selected = false, disabled = false, tone = "neutral", onClick, style, ...rest}) {
  const [press, setPress] = React.useState(false);
  const accent = tone === "accent";
  return (
    <button
      type="button" disabled={disabled} onClick={disabled ? undefined : onClick}
      aria-pressed={onClick ? selected : undefined}
      onPointerDown={() => setPress(true)} onPointerUp={() => setPress(false)} onPointerLeave={() => setPress(false)}
      style={{
        display:"inline-flex", alignItems:"center", gap:"var(--space-2)",
        minHeight:"var(--hit-min)", padding:"0 var(--space-5)",
        borderRadius:"var(--radius-pill)", cursor: disabled ? "not-allowed" : "pointer",
        fontFamily:"var(--font-core)", fontSize:"15px", fontWeight:500, lineHeight:1.2,
        textAlign:"left", opacity: disabled ? .38 : 1,
        color: selected ? "var(--accent)" : "var(--text-primary)",
        background: selected ? "var(--accent-muted)" : (accent ? "var(--accent-2-muted)" : "transparent"),
        border:"var(--border-width) solid " + (selected ? "var(--accent-border)" : "var(--border)"),
        transform: press && !disabled ? "scale(.97)" : "scale(1)",
        transition:"background var(--dur-fast) var(--ease-standard), border-color var(--dur-fast) var(--ease-standard), color var(--dur-fast) var(--ease-standard), transform var(--dur-instant) var(--ease-standard)",
        WebkitTapHighlightColor:"transparent",
        ...style
      }}
      {...rest}
    >{children}</button>
  );
}
