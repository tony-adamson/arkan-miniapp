import React from "react";

const SIZES = { sm:{w:96,  r:"var(--radius-md)"}, md:{w:150, r:"var(--radius-card)"}, lg:{w:212, r:"var(--radius-card)"} };
const RATIO = 1.62;

/** Карта таро: рубашка → раскрытие → лицевая сторона, с подписью позиции в раскладе. */
export function TarotCard({
  name = "", numeral = "", position, state = "back", size = "md",
  reversed = false, onReveal, style
}) {
  const s = SIZES[size] || SIZES.md;
  const h = Math.round(s.w * RATIO);
  const open = state === "face" || state === "revealing";
  const clickable = state === "back" && typeof onReveal === "function";
  return (
    <figure style={{margin:0, display:"flex", flexDirection:"column", alignItems:"center", gap:"var(--space-4)", ...style}}>
      <div
        role={clickable ? "button" : undefined} tabIndex={clickable ? 0 : undefined}
        onClick={clickable ? onReveal : undefined}
        onKeyDown={clickable ? (e => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onReveal())) : undefined}
        aria-label={open ? name : "Карта рубашкой вверх — нажмите, чтобы раскрыть"}
        style={{
          width:s.w, height:h, perspective:1200, cursor: clickable ? "pointer" : "default",
          WebkitTapHighlightColor:"transparent", flex:"none"
        }}>
        <div style={{
          position:"relative", width:"100%", height:"100%", transformStyle:"preserve-3d",
          transform:"rotateY(" + (open ? 180 : 0) + "deg) translateZ(0)",
          transition:"transform var(--dur-reveal) var(--ease-ritual), filter var(--dur-reveal) var(--ease-ritual)",
          filter: state === "revealing" ? "brightness(1.06)" : "none"
        }}>
          <Face side="back" radius={s.r} />
          <Face side="face" radius={s.r} name={name} numeral={numeral} reversed={reversed} size={size} />
        </div>
      </div>

      {(name && open) || position ? (
        <figcaption style={{textAlign:"center", display:"flex", flexDirection:"column", gap:"var(--space-2)", maxWidth:Math.max(s.w + 60, 160)}}>
          {position && <span className="t-label" style={{color:"var(--text-tertiary)"}}>{position}</span>}
          {open && name && (
            <span className="t-display" style={{
              color:"var(--text-primary)",
              fontSize: size === "sm" ? "20px" : size === "md" ? "26px" : "var(--type-display-size)",
              lineHeight:1.15
            }}>{name}{reversed && <span className="t-caption" style={{color:"var(--text-tertiary)", display:"block", fontFamily:"var(--font-core)"}}>перевёрнутая</span>}</span>
          )}
        </figcaption>
      ) : null}
    </figure>
  );
}

function Face({side, radius, name, numeral, reversed, size}) {
  const back = side === "back";
  const common = {
    position:"absolute", inset:0, borderRadius:radius, backfaceVisibility:"hidden",
    WebkitBackfaceVisibility:"hidden", overflow:"hidden", boxShadow:"var(--shadow-card-rest)",
    border:"var(--border-width) solid " + (back ? "rgba(255,255,255,.10)" : "rgba(33,30,41,.12)")
  };
  if (back) return (
    <div style={{...common, background:"var(--card-back)", display:"grid", placeItems:"center"}}>
      <div style={{
        width:"58%", aspectRatio:"1", borderRadius:"50%",
        border:"1px solid var(--accent-border)", opacity:.7,
        display:"grid", placeItems:"center"
      }}>
        <div style={{width:"46%", aspectRatio:"1", borderRadius:"50%", background:"var(--accent-muted)", border:"1px solid var(--accent-border)"}} />
      </div>
    </div>
  );
  return (
    <div style={{
      ...common, background:"var(--card-face)", color:"var(--card-face-ink)",
      transform:"rotateY(180deg)", display:"flex", flexDirection:"column",
      justifyContent:"space-between", padding: size === "sm" ? "10px" : "16px", textAlign:"center"
    }}>
      <span className="t-label" style={{color:"rgba(33,30,41,.5)"}}>{numeral}</span>
      <span style={{
        transform: reversed ? "rotate(180deg)" : "none",
        fontFamily:"var(--font-accent)", fontWeight:300, letterSpacing:".01em",
        fontSize: size === "sm" ? "17px" : size === "md" ? "24px" : "30px", lineHeight:1.1
      }}>{name}</span>
      <span aria-hidden="true" style={{height:1, background:"rgba(33,30,41,.16)", width:"38%", margin:"0 auto"}} />
    </div>
  );
}
