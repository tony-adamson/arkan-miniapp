import React from "react";

export function QuestionInput({
  value = "", onChange, onSubmit, placeholder = "О чём вы хотите спросить?",
  state = "idle", error, maxLength = 280, hint, style
}) {
  const [focus, setFocus] = React.useState(false);
  const sending = state === "sending";
  const invalid = state === "error";
  const ref = React.useRef(null);
  React.useEffect(() => {
    const el = ref.current; if (!el) return;
    el.style.height = "auto"; el.style.height = Math.min(el.scrollHeight, 160) + "px";
  }, [value]);
  const border = invalid ? "var(--danger)" : (focus ? "var(--accent-border)" : "var(--border)");
  return (
    <div style={{display:"flex", flexDirection:"column", gap:"var(--space-3)", ...style}}>
      <div style={{
        display:"flex", alignItems:"flex-end", gap:"var(--space-4)",
        padding:"var(--space-4) var(--space-4) var(--space-4) var(--space-5)",
        background:"var(--surface-elevated)", borderRadius:"var(--radius-lg)",
        border:"var(--border-width) solid " + border,
        boxShadow: focus && !invalid ? "0 0 0 3px var(--accent-muted)" : "var(--shadow-1)",
        opacity: sending ? .6 : 1,
        transition:"border-color var(--dur-fast) var(--ease-standard), box-shadow var(--dur-fast) var(--ease-standard), opacity var(--dur-fast) var(--ease-standard)"
      }}>
        <textarea
          ref={ref} rows={1} value={value} maxLength={maxLength} disabled={sending}
          placeholder={placeholder} aria-invalid={invalid || undefined}
          onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
          onChange={e => onChange && onChange(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSubmit && onSubmit(); } }}
          style={{
            flex:1, resize:"none", border:"none", outline:"none", background:"transparent",
            color:"var(--text-primary)", fontFamily:"var(--font-core)",
            fontSize:"var(--type-lead-size)", lineHeight:"var(--type-lead-lh)", padding:"var(--space-2) 0", maxHeight:160
          }}
        />
        <SendButton disabled={!value.trim() || sending} loading={sending} onClick={onSubmit} />
      </div>
      <div style={{display:"flex", justifyContent:"space-between", gap:"var(--space-4)", padding:"0 var(--space-2)"}}>
        <span className="t-caption" style={{color: invalid ? "var(--danger)" : "var(--text-tertiary)"}}>
          {invalid ? (error || "Слишком коротко — опишите ситуацию в паре фраз") : (hint || "Enter — отправить, Shift+Enter — новая строка")}
        </span>
        <span className="t-caption" style={{color:"var(--text-tertiary)", fontVariantNumeric:"tabular-nums"}}>{value.length}/{maxLength}</span>
      </div>
    </div>
  );
}

function SendButton({disabled, loading, onClick}) {
  return (
    <button type="button" onClick={disabled ? undefined : onClick} disabled={disabled} aria-label="Отправить вопрос"
      style={{
        flex:"none", width:44, height:44, borderRadius:"var(--radius-pill)", border:"none",
        background: disabled ? "var(--surface-inset)" : "var(--accent)",
        color: disabled ? "var(--text-tertiary)" : "var(--text-on-accent)",
        cursor: disabled ? "default" : "pointer", display:"grid", placeItems:"center",
        transition:"background var(--dur-fast) var(--ease-standard)"
      }}>
      {loading
        ? <span style={{width:16,height:16,borderRadius:"50%",border:"2px solid currentColor",borderTopColor:"transparent",animation:"arkan-spin 760ms linear infinite"}} />
        : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>}
    </button>
  );
}
