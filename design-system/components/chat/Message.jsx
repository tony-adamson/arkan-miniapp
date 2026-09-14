import React from "react";

/** Реплика в диалоге. from="arkan" — толкование продукта, from="user" — реплика пользователя. */
export function Message({from = "arkan", children, time, longform = false, appear = false, style}) {
  const user = from === "user";
  return (
    <div style={{display:"flex", justifyContent: user ? "flex-end" : "flex-start", ...style}}>
      <div style={{
        maxWidth: user ? "84%" : "100%",
        display:"flex", flexDirection:"column", gap:"var(--space-2)", alignItems: user ? "flex-end" : "stretch",
        animation: appear ? "arkan-rise var(--dur-slow) var(--ease-enter) both" : undefined
      }}>
        <style>{"@keyframes arkan-rise{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}"}</style>
        <div
          className={longform ? "t-read" : "t-body"}
          style={user ? {
            background:"var(--accent-muted)", border:"var(--border-width) solid var(--accent-border)",
            color:"var(--text-primary)", padding:"var(--space-4) var(--space-5)",
            borderRadius:"var(--radius-lg)", borderBottomRightRadius:"var(--radius-xs)"
          } : {
            background:"transparent", color: longform ? "var(--text-primary)" : "var(--text-primary)",
            padding:0, maxWidth: longform ? "var(--read-measure)" : undefined
          }}>
          {children}
        </div>
        {time && <span className="t-caption" style={{color:"var(--text-tertiary)"}}>{time}</span>}
      </div>
    </div>
  );
}
