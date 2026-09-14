import React from "react";

const base = {
  display:"inline-flex", alignItems:"center", justifyContent:"center", gap:"var(--space-3)",
  fontFamily:"var(--font-core)", fontWeight:600, letterSpacing:"-.01em",
  border:"var(--border-width) solid transparent", cursor:"pointer",
  transition:"background var(--dur-fast) var(--ease-standard), color var(--dur-fast) var(--ease-standard), border-color var(--dur-fast) var(--ease-standard), transform var(--dur-instant) var(--ease-standard), opacity var(--dur-fast) var(--ease-standard)",
  WebkitTapHighlightColor:"transparent", position:"relative", whiteSpace:"nowrap"
};
const sizes = {
  lg:{minHeight:"56px", padding:"0 var(--space-7)", fontSize:"17px", borderRadius:"var(--radius-lg)"},
  md:{minHeight:"48px", padding:"0 var(--space-6)", fontSize:"16px", borderRadius:"var(--radius-md)"},
  sm:{minHeight:"var(--hit-min)", padding:"0 var(--space-5)", fontSize:"15px", borderRadius:"var(--radius-sm)"}
};
const variants = {
  primary:{background:"var(--accent)", color:"var(--text-on-accent)"},
  secondary:{background:"transparent", color:"var(--text-primary)", borderColor:"var(--border-strong)"},
  text:{background:"transparent", color:"var(--accent)", borderColor:"transparent", padding:"0 var(--space-3)"},
  danger:{background:"var(--danger-muted)", color:"var(--danger)", borderColor:"var(--danger)"}
};

export function Button({
  children, variant = "primary", size = "md", block = false,
  loading = false, disabled = false, iconLeft, iconRight, onClick, style, ...rest
}) {
  const [press, setPress] = React.useState(false);
  const off = disabled || loading;
  return (
    <button
      type="button" disabled={off} onClick={off ? undefined : onClick}
      onPointerDown={() => setPress(true)} onPointerUp={() => setPress(false)} onPointerLeave={() => setPress(false)}
      aria-busy={loading || undefined}
      style={{
        ...base, ...sizes[size], ...variants[variant],
        width: block ? "100%" : undefined,
        opacity: disabled ? .38 : 1,
        transform: press && !off ? "scale(.978)" : "scale(1)",
        cursor: off ? "not-allowed" : "pointer",
        ...style
      }}
      {...rest}
    >
      {loading && <Spinner tone={variant === "primary" ? "var(--text-on-accent)" : "var(--accent)"} />}
      {!loading && iconLeft}
      <span style={{opacity: loading ? .7 : 1}}>{children}</span>
      {!loading && iconRight}
    </button>
  );
}

function Spinner({tone}) {
  return (
    <span aria-hidden="true" style={{
      width:16, height:16, borderRadius:"50%",
      border:"2px solid " + tone, borderTopColor:"transparent",
      animation:"arkan-spin 760ms linear infinite", flex:"none"
    }}>
      <style>{"@keyframes arkan-spin{to{transform:rotate(360deg)}}"}</style>
    </span>
  );
}
