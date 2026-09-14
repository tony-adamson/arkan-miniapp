/* @ds-bundle: {"format":4,"namespace":"DesignSystem_8c38cb","components":[{"name":"Message","sourcePath":"components/chat/Message.jsx"},{"name":"QuickReplies","sourcePath":"components/chat/QuickReplies.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Chip","sourcePath":"components/core/Chip.jsx"},{"name":"EmptyState","sourcePath":"components/feedback/EmptyState.jsx"},{"name":"ErrorState","sourcePath":"components/feedback/ErrorState.jsx"},{"name":"QuestionInput","sourcePath":"components/forms/QuestionInput.jsx"},{"name":"BottomSheet","sourcePath":"components/surfaces/BottomSheet.jsx"},{"name":"Modal","sourcePath":"components/surfaces/Modal.jsx"},{"name":"SpreadCard","sourcePath":"components/surfaces/SpreadCard.jsx"},{"name":"RitualLoader","sourcePath":"components/tarot/RitualLoader.jsx"},{"name":"TarotCard","sourcePath":"components/tarot/TarotCard.jsx"}],"sourceHashes":{"components/chat/Message.jsx":"0980bea7aec4","components/chat/QuickReplies.jsx":"cf19052a1bda","components/core/Button.jsx":"122941b74591","components/core/Chip.jsx":"ee7ce523213d","components/feedback/EmptyState.jsx":"c61ea0ee7997","components/feedback/ErrorState.jsx":"90d038b4a751","components/forms/QuestionInput.jsx":"f59ad474fbdc","components/surfaces/BottomSheet.jsx":"5193544320f0","components/surfaces/Modal.jsx":"d8a9b0bfe84b","components/surfaces/SpreadCard.jsx":"8da4bd32b41b","components/tarot/RitualLoader.jsx":"f7c829d34403","components/tarot/TarotCard.jsx":"dcdf924dd556","ui_kits/arkan-miniapp/App.jsx":"a0d19448a557","ui_kits/arkan-miniapp/AskQuestion.jsx":"04639cced7e3","ui_kits/arkan-miniapp/CardOfDay.jsx":"54f40d912787","ui_kits/arkan-miniapp/History.jsx":"90edbd6557be","ui_kits/arkan-miniapp/Icon.jsx":"182308e71302","ui_kits/arkan-miniapp/Onboarding.jsx":"107fe3c846a2","ui_kits/arkan-miniapp/Profile.jsx":"eaf8c6c81344","ui_kits/arkan-miniapp/Reading.jsx":"f407dca3e725","ui_kits/arkan-miniapp/Shell.jsx":"d31de96dcffe","ui_kits/arkan-miniapp/Summary.jsx":"fbea50b6f2b9","ui_kits/arkan-miniapp/data.js":"38625573179a"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.DesignSystem_8c38cb = window.DesignSystem_8c38cb || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/chat/Message.jsx
try { (() => {
/** Реплика в диалоге. from="arkan" — толкование продукта, from="user" — реплика пользователя. */
function Message({
  from = "arkan",
  children,
  time,
  longform = false,
  appear = false,
  style
}) {
  const user = from === "user";
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: user ? "flex-end" : "flex-start",
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: user ? "84%" : "100%",
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-2)",
      alignItems: user ? "flex-end" : "stretch",
      animation: appear ? "arkan-rise var(--dur-slow) var(--ease-enter) both" : undefined
    }
  }, /*#__PURE__*/React.createElement("style", null, "@keyframes arkan-rise{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}"), /*#__PURE__*/React.createElement("div", {
    className: longform ? "t-read" : "t-body",
    style: user ? {
      background: "var(--accent-muted)",
      border: "var(--border-width) solid var(--accent-border)",
      color: "var(--text-primary)",
      padding: "var(--space-4) var(--space-5)",
      borderRadius: "var(--radius-lg)",
      borderBottomRightRadius: "var(--radius-xs)"
    } : {
      background: "transparent",
      color: longform ? "var(--text-primary)" : "var(--text-primary)",
      padding: 0,
      maxWidth: longform ? "var(--read-measure)" : undefined
    }
  }, children), time && /*#__PURE__*/React.createElement("span", {
    className: "t-caption",
    style: {
      color: "var(--text-tertiary)"
    }
  }, time)));
}
Object.assign(__ds_scope, { Message });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/chat/Message.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const base = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "var(--space-3)",
  fontFamily: "var(--font-core)",
  fontWeight: 600,
  letterSpacing: "-.01em",
  border: "var(--border-width) solid transparent",
  cursor: "pointer",
  transition: "background var(--dur-fast) var(--ease-standard), color var(--dur-fast) var(--ease-standard), border-color var(--dur-fast) var(--ease-standard), transform var(--dur-instant) var(--ease-standard), opacity var(--dur-fast) var(--ease-standard)",
  WebkitTapHighlightColor: "transparent",
  position: "relative",
  whiteSpace: "nowrap"
};
const sizes = {
  lg: {
    minHeight: "56px",
    padding: "0 var(--space-7)",
    fontSize: "17px",
    borderRadius: "var(--radius-lg)"
  },
  md: {
    minHeight: "48px",
    padding: "0 var(--space-6)",
    fontSize: "16px",
    borderRadius: "var(--radius-md)"
  },
  sm: {
    minHeight: "var(--hit-min)",
    padding: "0 var(--space-5)",
    fontSize: "15px",
    borderRadius: "var(--radius-sm)"
  }
};
const variants = {
  primary: {
    background: "var(--accent)",
    color: "var(--text-on-accent)"
  },
  secondary: {
    background: "transparent",
    color: "var(--text-primary)",
    borderColor: "var(--border-strong)"
  },
  text: {
    background: "transparent",
    color: "var(--accent)",
    borderColor: "transparent",
    padding: "0 var(--space-3)"
  },
  danger: {
    background: "var(--danger-muted)",
    color: "var(--danger)",
    borderColor: "var(--danger)"
  }
};
function Button({
  children,
  variant = "primary",
  size = "md",
  block = false,
  loading = false,
  disabled = false,
  iconLeft,
  iconRight,
  onClick,
  style,
  ...rest
}) {
  const [press, setPress] = React.useState(false);
  const off = disabled || loading;
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    disabled: off,
    onClick: off ? undefined : onClick,
    onPointerDown: () => setPress(true),
    onPointerUp: () => setPress(false),
    onPointerLeave: () => setPress(false),
    "aria-busy": loading || undefined,
    style: {
      ...base,
      ...sizes[size],
      ...variants[variant],
      width: block ? "100%" : undefined,
      opacity: disabled ? .38 : 1,
      transform: press && !off ? "scale(.978)" : "scale(1)",
      cursor: off ? "not-allowed" : "pointer",
      ...style
    }
  }, rest), loading && /*#__PURE__*/React.createElement(Spinner, {
    tone: variant === "primary" ? "var(--text-on-accent)" : "var(--accent)"
  }), !loading && iconLeft, /*#__PURE__*/React.createElement("span", {
    style: {
      opacity: loading ? .7 : 1
    }
  }, children), !loading && iconRight);
}
function Spinner({
  tone
}) {
  return /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      width: 16,
      height: 16,
      borderRadius: "50%",
      border: "2px solid " + tone,
      borderTopColor: "transparent",
      animation: "arkan-spin 760ms linear infinite",
      flex: "none"
    }
  }, /*#__PURE__*/React.createElement("style", null, "@keyframes arkan-spin{to{transform:rotate(360deg)}}"));
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/Chip.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Chip({
  children,
  selected = false,
  disabled = false,
  tone = "neutral",
  onClick,
  style,
  ...rest
}) {
  const [press, setPress] = React.useState(false);
  const accent = tone === "accent";
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    disabled: disabled,
    onClick: disabled ? undefined : onClick,
    "aria-pressed": onClick ? selected : undefined,
    onPointerDown: () => setPress(true),
    onPointerUp: () => setPress(false),
    onPointerLeave: () => setPress(false),
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: "var(--space-2)",
      minHeight: "var(--hit-min)",
      padding: "0 var(--space-5)",
      borderRadius: "var(--radius-pill)",
      cursor: disabled ? "not-allowed" : "pointer",
      fontFamily: "var(--font-core)",
      fontSize: "15px",
      fontWeight: 500,
      lineHeight: 1.2,
      textAlign: "left",
      opacity: disabled ? .38 : 1,
      color: selected ? "var(--accent)" : "var(--text-primary)",
      background: selected ? "var(--accent-muted)" : accent ? "var(--accent-2-muted)" : "transparent",
      border: "var(--border-width) solid " + (selected ? "var(--accent-border)" : "var(--border)"),
      transform: press && !disabled ? "scale(.97)" : "scale(1)",
      transition: "background var(--dur-fast) var(--ease-standard), border-color var(--dur-fast) var(--ease-standard), color var(--dur-fast) var(--ease-standard), transform var(--dur-instant) var(--ease-standard)",
      WebkitTapHighlightColor: "transparent",
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { Chip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Chip.jsx", error: String((e && e.message) || e) }); }

// components/chat/QuickReplies.jsx
try { (() => {
/** Набор чипов быстрых ответов под уточняющим вопросом продукта. */
function QuickReplies({
  options = [],
  value,
  onSelect,
  disabled = false,
  label,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-4)",
      ...style
    }
  }, label && /*#__PURE__*/React.createElement("span", {
    className: "t-label",
    style: {
      color: "var(--text-tertiary)"
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      gap: "var(--space-3)"
    }
  }, options.map(o => /*#__PURE__*/React.createElement(__ds_scope.Chip, {
    key: o,
    selected: value === o,
    disabled: disabled,
    onClick: onSelect ? () => onSelect(o) : undefined
  }, o))));
}
Object.assign(__ds_scope, { QuickReplies });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/chat/QuickReplies.jsx", error: String((e && e.message) || e) }); }

// components/feedback/EmptyState.jsx
try { (() => {
/** Пустое состояние: история без раскладов, карта дня до вытягивания, пустой поиск. */
function EmptyState({
  title,
  description,
  action,
  glyph = "circle",
  compact = false,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      textAlign: "center",
      gap: "var(--space-5)",
      padding: compact ? "var(--space-8) var(--space-6)" : "var(--space-11) var(--space-6)",
      ...style
    }
  }, /*#__PURE__*/React.createElement(Glyph, {
    kind: glyph
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-3)",
      maxWidth: 300
    }
  }, title && /*#__PURE__*/React.createElement("h3", {
    className: "t-heading",
    style: {
      margin: 0
    }
  }, title), description && /*#__PURE__*/React.createElement("p", {
    className: "t-body",
    style: {
      margin: 0,
      color: "var(--text-secondary)",
      textWrap: "pretty"
    }
  }, description)), action);
}
function Glyph({
  kind
}) {
  const common = {
    width: 56,
    height: 56,
    borderRadius: kind === "card" ? "var(--radius-sm)" : "50%",
    border: "1px solid var(--border-strong)",
    display: "grid",
    placeItems: "center",
    flex: "none"
  };
  return /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: common
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 8,
      height: 8,
      borderRadius: "50%",
      background: "var(--accent-muted)",
      border: "1px solid var(--accent-border)"
    }
  }));
}
Object.assign(__ds_scope, { EmptyState });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/EmptyState.jsx", error: String((e && e.message) || e) }); }

// components/feedback/ErrorState.jsx
try { (() => {
/** Состояние ошибки: inline (в потоке диалога) или screen (весь экран). */
function ErrorState({
  title = "Не получилось получить ответ",
  description = "Связь прервалась. Расклад сохранён — можно продолжить с той же карты.",
  action,
  variant = "inline",
  style
}) {
  const inline = variant === "inline";
  return /*#__PURE__*/React.createElement("div", {
    role: "alert",
    style: {
      display: "flex",
      flexDirection: inline ? "row" : "column",
      alignItems: inline ? "flex-start" : "center",
      textAlign: inline ? "left" : "center",
      gap: "var(--space-4)",
      padding: inline ? "var(--space-5)" : "var(--space-10) var(--space-6)",
      background: inline ? "var(--danger-muted)" : "transparent",
      border: inline ? "var(--border-width) solid var(--danger)" : "none",
      borderRadius: "var(--radius-md)",
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      width: 20,
      height: 20,
      borderRadius: "50%",
      border: "1.5px solid var(--danger)",
      color: "var(--danger)",
      display: "grid",
      placeItems: "center",
      fontSize: 13,
      fontWeight: 700,
      flex: "none",
      marginTop: inline ? 2 : 0
    }
  }, "!"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-3)",
      maxWidth: 320
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "t-lead",
    style: {
      color: "var(--text-primary)"
    }
  }, title), description && /*#__PURE__*/React.createElement("span", {
    className: "t-body",
    style: {
      color: "var(--text-secondary)",
      textWrap: "pretty"
    }
  }, description), action && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: "var(--space-2)"
    }
  }, action)));
}
Object.assign(__ds_scope, { ErrorState });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/ErrorState.jsx", error: String((e && e.message) || e) }); }

// components/forms/QuestionInput.jsx
try { (() => {
function QuestionInput({
  value = "",
  onChange,
  onSubmit,
  placeholder = "О чём вы хотите спросить?",
  state = "idle",
  error,
  maxLength = 280,
  hint,
  style
}) {
  const [focus, setFocus] = React.useState(false);
  const sending = state === "sending";
  const invalid = state === "error";
  const ref = React.useRef(null);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 160) + "px";
  }, [value]);
  const border = invalid ? "var(--danger)" : focus ? "var(--accent-border)" : "var(--border)";
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-3)",
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "flex-end",
      gap: "var(--space-4)",
      padding: "var(--space-4) var(--space-4) var(--space-4) var(--space-5)",
      background: "var(--surface-elevated)",
      borderRadius: "var(--radius-lg)",
      border: "var(--border-width) solid " + border,
      boxShadow: focus && !invalid ? "0 0 0 3px var(--accent-muted)" : "var(--shadow-1)",
      opacity: sending ? .6 : 1,
      transition: "border-color var(--dur-fast) var(--ease-standard), box-shadow var(--dur-fast) var(--ease-standard), opacity var(--dur-fast) var(--ease-standard)"
    }
  }, /*#__PURE__*/React.createElement("textarea", {
    ref: ref,
    rows: 1,
    value: value,
    maxLength: maxLength,
    disabled: sending,
    placeholder: placeholder,
    "aria-invalid": invalid || undefined,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    onChange: e => onChange && onChange(e.target.value),
    onKeyDown: e => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        onSubmit && onSubmit();
      }
    },
    style: {
      flex: 1,
      resize: "none",
      border: "none",
      outline: "none",
      background: "transparent",
      color: "var(--text-primary)",
      fontFamily: "var(--font-core)",
      fontSize: "var(--type-lead-size)",
      lineHeight: "var(--type-lead-lh)",
      padding: "var(--space-2) 0",
      maxHeight: 160
    }
  }), /*#__PURE__*/React.createElement(SendButton, {
    disabled: !value.trim() || sending,
    loading: sending,
    onClick: onSubmit
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      gap: "var(--space-4)",
      padding: "0 var(--space-2)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "t-caption",
    style: {
      color: invalid ? "var(--danger)" : "var(--text-tertiary)"
    }
  }, invalid ? error || "Слишком коротко — опишите ситуацию в паре фраз" : hint || "Enter — отправить, Shift+Enter — новая строка"), /*#__PURE__*/React.createElement("span", {
    className: "t-caption",
    style: {
      color: "var(--text-tertiary)",
      fontVariantNumeric: "tabular-nums"
    }
  }, value.length, "/", maxLength)));
}
function SendButton({
  disabled,
  loading,
  onClick
}) {
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: disabled ? undefined : onClick,
    disabled: disabled,
    "aria-label": "\u041E\u0442\u043F\u0440\u0430\u0432\u0438\u0442\u044C \u0432\u043E\u043F\u0440\u043E\u0441",
    style: {
      flex: "none",
      width: 44,
      height: 44,
      borderRadius: "var(--radius-pill)",
      border: "none",
      background: disabled ? "var(--surface-inset)" : "var(--accent)",
      color: disabled ? "var(--text-tertiary)" : "var(--text-on-accent)",
      cursor: disabled ? "default" : "pointer",
      display: "grid",
      placeItems: "center",
      transition: "background var(--dur-fast) var(--ease-standard)"
    }
  }, loading ? /*#__PURE__*/React.createElement("span", {
    style: {
      width: 16,
      height: 16,
      borderRadius: "50%",
      border: "2px solid currentColor",
      borderTopColor: "transparent",
      animation: "arkan-spin 760ms linear infinite"
    }
  }) : /*#__PURE__*/React.createElement("svg", {
    width: "18",
    height: "18",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M5 12h14M13 6l6 6-6 6"
  })));
}
Object.assign(__ds_scope, { QuestionInput });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/QuestionInput.jsx", error: String((e && e.message) || e) }); }

// components/surfaces/BottomSheet.jsx
try { (() => {
/** Нижний шит — основной способ показать дополнительное поверх экрана в Mini App. */
function BottomSheet({
  open = true,
  title,
  children,
  footer,
  onClose,
  style
}) {
  if (!open) return null;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      inset: 0,
      display: "flex",
      alignItems: "flex-end",
      zIndex: 40,
      background: "var(--scrim)",
      backdropFilter: "var(--blur-overlay)",
      WebkitBackdropFilter: "var(--blur-overlay)",
      animation: "arkan-fade var(--dur-base) var(--ease-enter) both"
    },
    onClick: onClose
  }, /*#__PURE__*/React.createElement("style", null, "@keyframes arkan-fade{from{opacity:0}to{opacity:1}}@keyframes arkan-slide{from{transform:translateY(100%)}to{transform:none}}"), /*#__PURE__*/React.createElement("section", {
    role: "dialog",
    "aria-modal": "true",
    "aria-label": title,
    onClick: e => e.stopPropagation(),
    style: {
      width: "100%",
      maxHeight: "88%",
      overflowY: "auto",
      background: "var(--surface-elevated)",
      borderTopLeftRadius: "var(--radius-sheet)",
      borderTopRightRadius: "var(--radius-sheet)",
      borderTop: "var(--border-width) solid var(--border)",
      boxShadow: "var(--shadow-sheet)",
      padding: "var(--space-4) var(--screen-pad-x) calc(var(--space-8) + var(--safe-bottom))",
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-5)",
      animation: "arkan-slide var(--dur-slow) var(--ease-enter) both",
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      width: 36,
      height: 4,
      borderRadius: "var(--radius-pill)",
      background: "var(--border-strong)",
      alignSelf: "center",
      marginBottom: "var(--space-2)"
    }
  }), title && /*#__PURE__*/React.createElement("h2", {
    className: "t-heading",
    style: {
      margin: 0
    }
  }, title), children, footer && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: "var(--space-2)"
    }
  }, footer)));
}
Object.assign(__ds_scope, { BottomSheet });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/surfaces/BottomSheet.jsx", error: String((e && e.message) || e) }); }

// components/surfaces/Modal.jsx
try { (() => {
/** Модальное окно — только для решений, которые нельзя отложить (согласие, удаление). */
function Modal({
  open = true,
  title,
  description,
  children,
  actions,
  onClose,
  style
}) {
  if (!open) return null;
  return /*#__PURE__*/React.createElement("div", {
    role: "dialog",
    "aria-modal": "true",
    "aria-label": title,
    style: {
      position: "absolute",
      inset: 0,
      display: "grid",
      placeItems: "center",
      padding: "var(--space-6)",
      background: "var(--scrim)",
      backdropFilter: "var(--blur-overlay)",
      WebkitBackdropFilter: "var(--blur-overlay)",
      animation: "arkan-fade var(--dur-base) var(--ease-enter) both",
      zIndex: 40
    },
    onClick: onClose
  }, /*#__PURE__*/React.createElement("style", null, "@keyframes arkan-fade{from{opacity:0}to{opacity:1}}@keyframes arkan-pop{from{opacity:0;transform:translateY(10px) scale(.98)}to{opacity:1;transform:none}}"), /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      width: "100%",
      maxWidth: 340,
      background: "var(--surface-elevated)",
      border: "var(--border-width) solid var(--border)",
      borderRadius: "var(--radius-xl)",
      boxShadow: "var(--shadow-3)",
      padding: "var(--space-7)",
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-5)",
      animation: "arkan-pop var(--dur-slow) var(--ease-enter) both",
      ...style
    }
  }, title && /*#__PURE__*/React.createElement("h2", {
    className: "t-heading",
    style: {
      margin: 0
    }
  }, title), description && /*#__PURE__*/React.createElement("p", {
    className: "t-body",
    style: {
      margin: 0,
      color: "var(--text-secondary)",
      textWrap: "pretty"
    }
  }, description), children, actions && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-3)",
      marginTop: "var(--space-2)"
    }
  }, actions)));
}
Object.assign(__ds_scope, { Modal });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/surfaces/Modal.jsx", error: String((e && e.message) || e) }); }

// components/surfaces/SpreadCard.jsx
try { (() => {
/** Карточка расклада в истории: вопрос, дата, мини-карты, статус. */
function SpreadCard({
  question,
  date,
  cards = [],
  status = "done",
  onOpen,
  style
}) {
  const [press, setPress] = React.useState(false);
  const label = status === "unfinished" ? "Не завершён" : status === "today" ? "Сегодня" : null;
  return /*#__PURE__*/React.createElement("article", {
    role: onOpen ? "button" : undefined,
    tabIndex: onOpen ? 0 : undefined,
    onClick: onOpen,
    onKeyDown: onOpen ? e => e.key === "Enter" && onOpen() : undefined,
    onPointerDown: () => setPress(true),
    onPointerUp: () => setPress(false),
    onPointerLeave: () => setPress(false),
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-5)",
      padding: "var(--space-5)",
      background: "var(--surface-elevated)",
      border: "var(--border-width) solid var(--border)",
      borderRadius: "var(--radius-lg)",
      boxShadow: "var(--shadow-1)",
      cursor: onOpen ? "pointer" : "default",
      transform: press && onOpen ? "scale(.99)" : "scale(1)",
      transition: "transform var(--dur-instant) var(--ease-standard), border-color var(--dur-fast) var(--ease-standard)",
      WebkitTapHighlightColor: "transparent",
      ...style
    }
  }, /*#__PURE__*/React.createElement("header", {
    style: {
      display: "flex",
      alignItems: "baseline",
      justifyContent: "space-between",
      gap: "var(--space-4)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "t-caption",
    style: {
      color: "var(--text-tertiary)"
    }
  }, date), label && /*#__PURE__*/React.createElement("span", {
    className: "t-label",
    style: {
      color: status === "unfinished" ? "var(--warning)" : "var(--accent-2)",
      background: status === "unfinished" ? "var(--warning-muted)" : "var(--accent-2-muted)",
      padding: "4px 8px",
      borderRadius: "var(--radius-pill)"
    }
  }, label)), /*#__PURE__*/React.createElement("p", {
    className: "t-lead",
    style: {
      margin: 0,
      color: "var(--text-primary)",
      textWrap: "pretty"
    }
  }, question), /*#__PURE__*/React.createElement("footer", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "var(--space-3)",
      flexWrap: "wrap"
    }
  }, cards.map(c => /*#__PURE__*/React.createElement("span", {
    key: c,
    className: "t-caption",
    style: {
      fontFamily: "var(--font-accent)",
      fontSize: "15px",
      color: "var(--text-secondary)",
      border: "var(--border-width) solid var(--border)",
      borderRadius: "var(--radius-xs)",
      padding: "4px 10px",
      background: "var(--surface-inset)"
    }
  }, c))));
}
Object.assign(__ds_scope, { SpreadCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/surfaces/SpreadCard.jsx", error: String((e && e.message) || e) }); }

// components/tarot/RitualLoader.jsx
try { (() => {
const DEFAULT_STEPS = ["Слушаю вопрос", "Подбираю расклад", "Раскладываю карты"];

/** Экран ожидания генерации: дышащий круг, шаги без процентов, отсчёт вместо спиннера. */
function RitualLoader({
  steps = DEFAULT_STEPS,
  activeStep = 0,
  caption = "Это займёт несколько секунд",
  compact = false,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    role: "status",
    "aria-live": "polite",
    style: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "var(--space-7)",
      padding: compact ? "var(--space-7) 0" : "var(--space-11) 0",
      ...style
    }
  }, /*#__PURE__*/React.createElement("style", null, "@keyframes arkan-breath{0%,100%{transform:scale(1);opacity:.55}50%{transform:scale(1.12);opacity:1}}@keyframes arkan-halo{0%,100%{transform:scale(.92);opacity:.18}50%{transform:scale(1.18);opacity:.42}}"), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      width: compact ? 72 : 108,
      height: compact ? 72 : 108,
      display: "grid",
      placeItems: "center"
    }
  }, /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      position: "absolute",
      inset: 0,
      borderRadius: "50%",
      background: "var(--accent-muted)",
      animation: "arkan-halo var(--dur-breath) var(--ease-breath) infinite"
    }
  }), /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      position: "absolute",
      inset: "22%",
      borderRadius: "50%",
      border: "1px solid var(--accent-border)",
      animation: "arkan-breath var(--dur-breath) var(--ease-breath) infinite"
    }
  }), /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      width: 6,
      height: 6,
      borderRadius: "50%",
      background: "var(--accent)"
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-4)",
      alignItems: "center"
    }
  }, steps.map((s, i) => /*#__PURE__*/React.createElement("span", {
    key: s,
    className: i === activeStep ? "t-lead" : "t-body",
    style: {
      color: i === activeStep ? "var(--text-primary)" : "var(--text-tertiary)",
      opacity: i > activeStep ? .5 : 1,
      transition: "color var(--dur-slow) var(--ease-standard), opacity var(--dur-slow) var(--ease-standard)"
    }
  }, s))), caption && /*#__PURE__*/React.createElement("span", {
    className: "t-caption",
    style: {
      color: "var(--text-tertiary)"
    }
  }, caption));
}
Object.assign(__ds_scope, { RitualLoader });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/tarot/RitualLoader.jsx", error: String((e && e.message) || e) }); }

// components/tarot/TarotCard.jsx
try { (() => {
const SIZES = {
  sm: {
    w: 96,
    r: "var(--radius-md)"
  },
  md: {
    w: 150,
    r: "var(--radius-card)"
  },
  lg: {
    w: 212,
    r: "var(--radius-card)"
  }
};
const RATIO = 1.62;

/** Карта таро: рубашка → раскрытие → лицевая сторона, с подписью позиции в раскладе. */
function TarotCard({
  name = "",
  numeral = "",
  position,
  state = "back",
  size = "md",
  reversed = false,
  onReveal,
  style
}) {
  const s = SIZES[size] || SIZES.md;
  const h = Math.round(s.w * RATIO);
  const open = state === "face" || state === "revealing";
  const clickable = state === "back" && typeof onReveal === "function";
  return /*#__PURE__*/React.createElement("figure", {
    style: {
      margin: 0,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "var(--space-4)",
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    role: clickable ? "button" : undefined,
    tabIndex: clickable ? 0 : undefined,
    onClick: clickable ? onReveal : undefined,
    onKeyDown: clickable ? e => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onReveal()) : undefined,
    "aria-label": open ? name : "Карта рубашкой вверх — нажмите, чтобы раскрыть",
    style: {
      width: s.w,
      height: h,
      perspective: 1200,
      cursor: clickable ? "pointer" : "default",
      WebkitTapHighlightColor: "transparent",
      flex: "none"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      width: "100%",
      height: "100%",
      transformStyle: "preserve-3d",
      transform: "rotateY(" + (open ? 180 : 0) + "deg) translateZ(0)",
      transition: "transform var(--dur-reveal) var(--ease-ritual), filter var(--dur-reveal) var(--ease-ritual)",
      filter: state === "revealing" ? "brightness(1.06)" : "none"
    }
  }, /*#__PURE__*/React.createElement(Face, {
    side: "back",
    radius: s.r
  }), /*#__PURE__*/React.createElement(Face, {
    side: "face",
    radius: s.r,
    name: name,
    numeral: numeral,
    reversed: reversed,
    size: size
  }))), name && open || position ? /*#__PURE__*/React.createElement("figcaption", {
    style: {
      textAlign: "center",
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-2)",
      maxWidth: Math.max(s.w + 60, 160)
    }
  }, position && /*#__PURE__*/React.createElement("span", {
    className: "t-label",
    style: {
      color: "var(--text-tertiary)"
    }
  }, position), open && name && /*#__PURE__*/React.createElement("span", {
    className: "t-display",
    style: {
      color: "var(--text-primary)",
      fontSize: size === "sm" ? "20px" : size === "md" ? "26px" : "var(--type-display-size)",
      lineHeight: 1.15
    }
  }, name, reversed && /*#__PURE__*/React.createElement("span", {
    className: "t-caption",
    style: {
      color: "var(--text-tertiary)",
      display: "block",
      fontFamily: "var(--font-core)"
    }
  }, "\u043F\u0435\u0440\u0435\u0432\u0451\u0440\u043D\u0443\u0442\u0430\u044F"))) : null);
}
function Face({
  side,
  radius,
  name,
  numeral,
  reversed,
  size
}) {
  const back = side === "back";
  const common = {
    position: "absolute",
    inset: 0,
    borderRadius: radius,
    backfaceVisibility: "hidden",
    WebkitBackfaceVisibility: "hidden",
    overflow: "hidden",
    boxShadow: "var(--shadow-card-rest)",
    border: "var(--border-width) solid " + (back ? "rgba(255,255,255,.10)" : "rgba(33,30,41,.12)")
  };
  if (back) return /*#__PURE__*/React.createElement("div", {
    style: {
      ...common,
      background: "var(--card-back)",
      display: "grid",
      placeItems: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: "58%",
      aspectRatio: "1",
      borderRadius: "50%",
      border: "1px solid var(--accent-border)",
      opacity: .7,
      display: "grid",
      placeItems: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: "46%",
      aspectRatio: "1",
      borderRadius: "50%",
      background: "var(--accent-muted)",
      border: "1px solid var(--accent-border)"
    }
  })));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      ...common,
      background: "var(--card-face)",
      color: "var(--card-face-ink)",
      transform: "rotateY(180deg)",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      padding: size === "sm" ? "10px" : "16px",
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "t-label",
    style: {
      color: "rgba(33,30,41,.5)"
    }
  }, numeral), /*#__PURE__*/React.createElement("span", {
    style: {
      transform: reversed ? "rotate(180deg)" : "none",
      fontFamily: "var(--font-accent)",
      fontWeight: 300,
      letterSpacing: ".01em",
      fontSize: size === "sm" ? "17px" : size === "md" ? "24px" : "30px",
      lineHeight: 1.1
    }
  }, name), /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      height: 1,
      background: "rgba(33,30,41,.16)",
      width: "38%",
      margin: "0 auto"
    }
  }));
}
Object.assign(__ds_scope, { TarotCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/tarot/TarotCard.jsx", error: String((e && e.message) || e) }); }

// ui_kits/arkan-miniapp/App.jsx
try { (() => {
function App() {
  const [theme, setTheme] = React.useState("dark");
  const [screen, setScreen] = React.useState("onboarding");
  const [tab, setTab] = React.useState("ask");
  const [question, setQuestion] = React.useState("");
  const go = s => setScreen(s);
  const onTab = t => {
    setTab(t);
    setScreen(t);
  };
  const titles = {
    ask: "Новый расклад",
    reading: "Расклад",
    summary: "Итог",
    history: "История",
    day: "Карта дня",
    profile: "Профиль"
  };
  const showChrome = screen !== "onboarding";
  return /*#__PURE__*/React.createElement(Phone, {
    theme: theme
  }, showChrome && /*#__PURE__*/React.createElement(TgHeader, {
    title: titles[screen],
    onBack: screen === "reading" || screen === "summary" ? () => go("ask") : undefined,
    right: /*#__PURE__*/React.createElement(Icon, {
      name: "ellipsis",
      size: 18
    })
  }), screen === "onboarding" && /*#__PURE__*/React.createElement(Onboarding, {
    onDone: () => {
      go("ask");
      setTab("ask");
    }
  }), screen === "ask" && /*#__PURE__*/React.createElement(AskQuestion, {
    onSubmit: q => {
      setQuestion(q);
      go("reading");
    }
  }), screen === "reading" && /*#__PURE__*/React.createElement(Reading, {
    question: question,
    onFinish: () => go("summary")
  }), screen === "summary" && /*#__PURE__*/React.createElement(Summary, {
    question: question,
    onHistory: () => {
      setTab("history");
      go("history");
    }
  }), screen === "history" && /*#__PURE__*/React.createElement(History, {
    onOpen: () => go("summary")
  }), screen === "day" && /*#__PURE__*/React.createElement(CardOfDay, null), screen === "profile" && /*#__PURE__*/React.createElement(Profile, {
    theme: theme,
    onTheme: setTheme
  }), showChrome && screen !== "reading" && screen !== "summary" && /*#__PURE__*/React.createElement(TabBar, {
    active: tab,
    onChange: onTab
  }));
}
Object.assign(window, {
  App
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/arkan-miniapp/App.jsx", error: String((e && e.message) || e) }); }

// ui_kits/arkan-miniapp/AskQuestion.jsx
try { (() => {
const SUGGESTIONS = ["Что мне мешает принять это решение", "Как развиваются наши отношения", "Стоит ли соглашаться на новую роль", "Что я не вижу в этой ситуации"];
function AskQuestion({
  onSubmit
}) {
  const {
    QuestionInput,
    Chip,
    Button
  } = window.DesignSystem_8c38cb;
  const [q, setQ] = React.useState("");
  const [state, setState] = React.useState("idle");
  const send = () => {
    if (q.trim().length < 8) return setState("error");
    setState("sending");
    setTimeout(() => {
      setState("idle");
      onSubmit(q.trim());
    }, 700);
  };
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Scroll, {
    style: {
      gap: "var(--space-8)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-4)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "t-label",
    style: {
      color: "var(--text-tertiary)"
    }
  }, "\u041D\u043E\u0432\u044B\u0439 \u0440\u0430\u0441\u043A\u043B\u0430\u0434"), /*#__PURE__*/React.createElement("h1", {
    className: "t-title",
    style: {
      margin: 0,
      textWrap: "pretty"
    }
  }, "\u041E \u0447\u0451\u043C \u0432\u044B \u0434\u0443\u043C\u0430\u0435\u0442\u0435 \u0441\u0435\u0433\u043E\u0434\u043D\u044F?"), /*#__PURE__*/React.createElement("p", {
    className: "t-body",
    style: {
      margin: 0,
      color: "var(--text-secondary)",
      textWrap: "pretty"
    }
  }, "\u041E\u043F\u0438\u0448\u0438\u0442\u0435 \u0441\u0438\u0442\u0443\u0430\u0446\u0438\u044E \u0441\u0432\u043E\u0438\u043C\u0438 \u0441\u043B\u043E\u0432\u0430\u043C\u0438 \u2014 \u043D\u0430 \u043F\u0430\u0440\u0443 \u0444\u0440\u0430\u0437. \u0427\u0435\u043C \u043A\u043E\u043D\u043A\u0440\u0435\u0442\u043D\u0435\u0435 \u0432\u043E\u043F\u0440\u043E\u0441, \u0442\u0435\u043C \u0442\u043E\u0447\u043D\u0435\u0435 \u0440\u0430\u0441\u043A\u043B\u0430\u0434.")), /*#__PURE__*/React.createElement(QuestionInput, {
    value: q,
    onChange: v => {
      setQ(v);
      if (state === "error") setState("idle");
    },
    onSubmit: send,
    state: state
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-4)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "t-label",
    style: {
      color: "var(--text-tertiary)"
    }
  }, "\u0415\u0441\u043B\u0438 \u0441\u043B\u043E\u0436\u043D\u043E \u043D\u0430\u0447\u0430\u0442\u044C"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      gap: "var(--space-3)"
    }
  }, SUGGESTIONS.map(s => /*#__PURE__*/React.createElement(Chip, {
    key: s,
    onClick: () => setQ(s),
    selected: q === s
  }, s))))), /*#__PURE__*/React.createElement(Dock, null, /*#__PURE__*/React.createElement(Button, {
    size: "lg",
    block: true,
    loading: state === "sending",
    disabled: !q.trim(),
    onClick: send
  }, "\u0421\u043E\u0431\u0440\u0430\u0442\u044C \u0440\u0430\u0441\u043A\u043B\u0430\u0434")));
}
Object.assign(window, {
  AskQuestion
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/arkan-miniapp/AskQuestion.jsx", error: String((e && e.message) || e) }); }

// ui_kits/arkan-miniapp/CardOfDay.jsx
try { (() => {
function CardOfDay() {
  const {
    TarotCard,
    Button,
    Message
  } = window.DesignSystem_8c38cb;
  const [open, setOpen] = React.useState(false);
  const [phase, setPhase] = React.useState("back");
  const reveal = () => {
    setPhase("revealing");
    setTimeout(() => {
      setPhase("face");
      setOpen(true);
    }, 900);
  };
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Scroll, {
    style: {
      gap: "var(--space-7)",
      alignItems: "center",
      textAlign: "center",
      justifyContent: open ? "flex-start" : "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-2)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "t-label",
    style: {
      color: "var(--accent-2)"
    }
  }, "30 \u0430\u0432\u0433\u0443\u0441\u0442\u0430"), /*#__PURE__*/React.createElement("h1", {
    className: "t-heading",
    style: {
      margin: 0
    }
  }, "\u041A\u0430\u0440\u0442\u0430 \u0434\u043D\u044F")), /*#__PURE__*/React.createElement(TarotCard, {
    size: "lg",
    state: phase,
    numeral: "IX",
    name: "\u041E\u0442\u0448\u0435\u043B\u044C\u043D\u0438\u043A",
    onReveal: phase === "back" ? reveal : undefined
  }), !open && /*#__PURE__*/React.createElement("p", {
    className: "t-body",
    style: {
      margin: 0,
      color: "var(--text-tertiary)"
    }
  }, "\u041E\u0434\u043D\u0430 \u043A\u0430\u0440\u0442\u0430 \u0432 \u0434\u0435\u043D\u044C, \u0431\u0435\u0437 \u0432\u043E\u043F\u0440\u043E\u0441\u0430"), open && /*#__PURE__*/React.createElement(Message, {
    from: "arkan",
    longform: true,
    appear: true
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0
    }
  }, "\u041E\u0442\u0448\u0435\u043B\u044C\u043D\u0438\u043A \u2014 \u043D\u0435 \u043F\u0440\u043E \u043E\u0434\u0438\u043D\u043E\u0447\u0435\u0441\u0442\u0432\u043E, \u0430 \u043F\u0440\u043E \u043F\u0440\u0430\u0432\u043E \u043D\u0435 \u0431\u044B\u0442\u044C \u043D\u0430 \u0441\u0432\u044F\u0437\u0438. \u0421\u0435\u0433\u043E\u0434\u043D\u044F \u0445\u043E\u0440\u043E\u0448\u043E \u043F\u043E\u043B\u0443\u0447\u0430\u0435\u0442\u0441\u044F \u0442\u043E, \u0447\u0442\u043E \u0432\u044B \u0434\u0435\u043B\u0430\u0435\u0442\u0435 \u0431\u0435\u0437 \u0441\u0432\u0438\u0434\u0435\u0442\u0435\u043B\u0435\u0439."), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "var(--read-para-gap) 0 0"
    }
  }, "\u0415\u0441\u043B\u0438 \u0434\u0435\u043D\u044C \u043F\u0440\u0435\u0434\u043B\u0430\u0433\u0430\u0435\u0442 \u0432\u044B\u0431\u0438\u0440\u0430\u0442\u044C \u043C\u0435\u0436\u0434\u0443 \u0432\u043D\u0438\u043C\u0430\u043D\u0438\u0435\u043C \u043A \u0441\u0435\u0431\u0435 \u0438 \u0447\u0443\u0436\u043E\u0439 \u0441\u0440\u043E\u0447\u043D\u043E\u0441\u0442\u044C\u044E \u2014 \u0432\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u043F\u0435\u0440\u0432\u043E\u0435."))), open && /*#__PURE__*/React.createElement(Dock, null, /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    size: "lg",
    block: true
  }, "\u0417\u0430\u0434\u0430\u0442\u044C \u0432\u043E\u043F\u0440\u043E\u0441 \u043F\u043E \u044D\u0442\u043E\u0439 \u043A\u0430\u0440\u0442\u0435")));
}
Object.assign(window, {
  CardOfDay
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/arkan-miniapp/CardOfDay.jsx", error: String((e && e.message) || e) }); }

// ui_kits/arkan-miniapp/History.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function History({
  onOpen,
  empty = false
}) {
  const {
    SpreadCard,
    EmptyState,
    Button
  } = window.DesignSystem_8c38cb;
  const items = window.ARKAN_HISTORY;
  if (empty) return /*#__PURE__*/React.createElement(Scroll, {
    style: {
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement(EmptyState, {
    title: "\u0417\u0434\u0435\u0441\u044C \u043F\u043E\u044F\u0432\u044F\u0442\u0441\u044F \u0432\u0430\u0448\u0438 \u0440\u0430\u0441\u043A\u043B\u0430\u0434\u044B",
    description: "\u041A\u0430\u0436\u0434\u044B\u0439 \u0440\u0430\u0437\u0433\u043E\u0432\u043E\u0440 \u0441\u043E\u0445\u0440\u0430\u043D\u044F\u0435\u0442\u0441\u044F \u2014 \u043A \u043D\u0435\u043C\u0443 \u043C\u043E\u0436\u043D\u043E \u0432\u0435\u0440\u043D\u0443\u0442\u044C\u0441\u044F \u0447\u0435\u0440\u0435\u0437 \u043D\u0435\u0434\u0435\u043B\u044E \u0438\u043B\u0438 \u0447\u0435\u0440\u0435\u0437 \u0433\u043E\u0434.",
    action: /*#__PURE__*/React.createElement(Button, {
      variant: "secondary"
    }, "\u0417\u0430\u0434\u0430\u0442\u044C \u0432\u043E\u043F\u0440\u043E\u0441")
  }));
  return /*#__PURE__*/React.createElement(Scroll, {
    style: {
      gap: "var(--space-6)"
    }
  }, /*#__PURE__*/React.createElement("h1", {
    className: "t-title",
    style: {
      margin: 0
    }
  }, "\u0418\u0441\u0442\u043E\u0440\u0438\u044F"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-4)"
    }
  }, items.map(it => /*#__PURE__*/React.createElement(SpreadCard, _extends({
    key: it.date
  }, it, {
    onOpen: onOpen
  })))), /*#__PURE__*/React.createElement("p", {
    className: "t-caption",
    style: {
      margin: "var(--space-4) 0 0",
      color: "var(--text-tertiary)",
      textAlign: "center"
    }
  }, "\u0420\u0430\u0441\u043A\u043B\u0430\u0434\u044B \u0441\u0442\u0430\u0440\u0448\u0435 \u0433\u043E\u0434\u0430 \u0443\u0434\u0430\u043B\u044F\u044E\u0442\u0441\u044F \u0430\u0432\u0442\u043E\u043C\u0430\u0442\u0438\u0447\u0435\u0441\u043A\u0438"));
}
Object.assign(window, {
  History
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/arkan-miniapp/History.jsx", error: String((e && e.message) || e) }); }

// ui_kits/arkan-miniapp/Icon.jsx
try { (() => {
const LUCIDE = "https://unpkg.com/lucide-static@0.451.0/icons/";
function Icon({
  name,
  size = 20,
  style
}) {
  const url = "url(" + LUCIDE + name + ".svg)";
  return /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      display: "inline-block",
      width: size,
      height: size,
      flex: "none",
      background: "currentColor",
      WebkitMaskImage: url,
      maskImage: url,
      WebkitMaskSize: "contain",
      maskSize: "contain",
      WebkitMaskRepeat: "no-repeat",
      maskRepeat: "no-repeat",
      WebkitMaskPosition: "center",
      maskPosition: "center",
      ...style
    }
  });
}
Object.assign(window, {
  Icon
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/arkan-miniapp/Icon.jsx", error: String((e && e.message) || e) }); }

// ui_kits/arkan-miniapp/Onboarding.jsx
try { (() => {
const STEPS = [{
  title: "Это разговор, а не предсказание",
  body: "Вы формулируете ситуацию. Аркан подбирает расклад и раскрывает его по одной карте, задавая уточняющие вопросы между ними."
}, {
  title: "Одна карта за ход",
  body: "Между картами Аркан спрашивает, что откликается, а что нет. Толкование собирается из ваших ответов, а не выдаётся готовым текстом."
}, {
  title: "Расклады сохраняются",
  body: "К любому разговору можно вернуться — через неделю или через год. Аркан помнит, о чём вы спрашивали раньше."
}];
function Onboarding({
  onDone
}) {
  const {
    Button,
    TarotCard
  } = window.DesignSystem_8c38cb;
  const [i, setI] = React.useState(0);
  const [consent, setConsent] = React.useState(false);
  const last = i === STEPS.length;
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Scroll, {
    style: {
      justifyContent: "center",
      gap: "var(--space-9)",
      textAlign: "center",
      alignItems: "center"
    }
  }, !last ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(TarotCard, {
    size: "md",
    state: i === 0 ? "back" : "face",
    numeral: ["", "II", "XVII"][i],
    name: ["", "Жрица", "Звезда"][i]
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-5)",
      maxWidth: 300
    }
  }, /*#__PURE__*/React.createElement("h1", {
    className: "t-title",
    style: {
      margin: 0
    }
  }, STEPS[i].title), /*#__PURE__*/React.createElement("p", {
    className: "t-body",
    style: {
      margin: 0,
      color: "var(--text-secondary)",
      textWrap: "pretty"
    }
  }, STEPS[i].body))) : /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-6)",
      maxWidth: 320,
      textAlign: "left"
    }
  }, /*#__PURE__*/React.createElement("h1", {
    className: "t-title",
    style: {
      margin: 0
    }
  }, "\u041F\u0440\u0435\u0436\u0434\u0435 \u0447\u0435\u043C \u043D\u0430\u0447\u0430\u0442\u044C"), /*#__PURE__*/React.createElement("p", {
    className: "t-read",
    style: {
      margin: 0,
      color: "var(--text-secondary)"
    }
  }, "\u0410\u0440\u043A\u0430\u043D \u0445\u0440\u0430\u043D\u0438\u0442 \u0432\u0430\u0448\u0438 \u0432\u043E\u043F\u0440\u043E\u0441\u044B \u0438 \u0442\u043E\u043B\u043A\u043E\u0432\u0430\u043D\u0438\u044F, \u0447\u0442\u043E\u0431\u044B \u0432\u043E\u0437\u0432\u0440\u0430\u0449\u0430\u0442\u044C\u0441\u044F \u043A \u043D\u0438\u043C \u0432 \u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0438\u0445 \u0440\u0430\u0441\u043A\u043B\u0430\u0434\u0430\u0445. \u0414\u0430\u043D\u043D\u044B\u0435 \u043D\u0435 \u043F\u0435\u0440\u0435\u0434\u0430\u044E\u0442\u0441\u044F \u0442\u0440\u0435\u0442\u044C\u0438\u043C \u043B\u0438\u0446\u0430\u043C \u0438 \u0443\u0434\u0430\u043B\u044F\u044E\u0442\u0441\u044F \u0432\u043C\u0435\u0441\u0442\u0435 \u0441 \u0430\u043A\u043A\u0430\u0443\u043D\u0442\u043E\u043C."), /*#__PURE__*/React.createElement("label", {
    style: {
      display: "flex",
      gap: "var(--space-4)",
      alignItems: "flex-start",
      cursor: "pointer",
      padding: "var(--space-4)",
      border: "1px solid " + (consent ? "var(--accent-border)" : "var(--border)"),
      background: consent ? "var(--accent-muted)" : "transparent",
      borderRadius: "var(--radius-md)",
      transition: "all var(--dur-fast) var(--ease-standard)"
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: consent,
    onChange: e => setConsent(e.target.checked),
    style: {
      width: 20,
      height: 20,
      accentColor: "var(--accent)",
      marginTop: 2,
      flex: "none"
    }
  }), /*#__PURE__*/React.createElement("span", {
    className: "t-body",
    style: {
      color: "var(--text-primary)"
    }
  }, "\u0421\u043E\u0433\u043B\u0430\u0441\u0435\u043D \u043D\u0430 \u043E\u0431\u0440\u0430\u0431\u043E\u0442\u043A\u0443 \u043F\u0435\u0440\u0441\u043E\u043D\u0430\u043B\u044C\u043D\u044B\u0445 \u0434\u0430\u043D\u043D\u044B\u0445")), /*#__PURE__*/React.createElement("a", {
    href: "#",
    className: "t-caption"
  }, "\u041F\u043E\u043B\u0438\u0442\u0438\u043A\u0430 \u043A\u043E\u043D\u0444\u0438\u0434\u0435\u043D\u0446\u0438\u0430\u043B\u044C\u043D\u043E\u0441\u0442\u0438"))), /*#__PURE__*/React.createElement(Dock, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 6,
      justifyContent: "center",
      padding: "0 0 var(--space-3)"
    }
  }, STEPS.concat([0]).map((_, n) => /*#__PURE__*/React.createElement("span", {
    key: n,
    style: {
      width: n === i ? 18 : 6,
      height: 6,
      borderRadius: 3,
      background: n === i ? "var(--accent)" : "var(--border-strong)",
      transition: "all var(--dur-base) var(--ease-standard)"
    }
  }))), /*#__PURE__*/React.createElement(Button, {
    size: "lg",
    block: true,
    disabled: last && !consent,
    onClick: () => last ? onDone() : setI(i + 1)
  }, last ? "Начать" : "Дальше"), !last && /*#__PURE__*/React.createElement(Button, {
    variant: "text",
    block: true,
    onClick: () => setI(STEPS.length)
  }, "\u041F\u0440\u043E\u043F\u0443\u0441\u0442\u0438\u0442\u044C")));
}
Object.assign(window, {
  Onboarding
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/arkan-miniapp/Onboarding.jsx", error: String((e && e.message) || e) }); }

// ui_kits/arkan-miniapp/Profile.jsx
try { (() => {
function Row({
  icon,
  title,
  hint,
  right,
  onClick,
  danger
}) {
  return /*#__PURE__*/React.createElement("button", {
    onClick: onClick,
    style: {
      all: "unset",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: "var(--space-4)",
      minHeight: "var(--hit-min)",
      padding: "var(--space-4) var(--space-5)",
      background: "var(--surface-elevated)",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius-md)",
      color: danger ? "var(--danger)" : "var(--text-primary)"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    size: 18,
    style: {
      color: danger ? "var(--danger)" : "var(--text-tertiary)"
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      gap: 2
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "t-body"
  }, title), hint && /*#__PURE__*/React.createElement("span", {
    className: "t-caption",
    style: {
      color: "var(--text-tertiary)"
    }
  }, hint)), right);
}
function Switch({
  on,
  onToggle
}) {
  return /*#__PURE__*/React.createElement("span", {
    onClick: e => {
      e.stopPropagation();
      onToggle();
    },
    role: "switch",
    "aria-checked": on,
    style: {
      width: 44,
      height: 26,
      borderRadius: "var(--radius-pill)",
      flex: "none",
      cursor: "pointer",
      background: on ? "var(--accent)" : "var(--surface-inset)",
      border: "1px solid " + (on ? "var(--accent-border)" : "var(--border-strong)"),
      display: "flex",
      alignItems: "center",
      padding: 2,
      transition: "background var(--dur-fast) var(--ease-standard)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 20,
      height: 20,
      borderRadius: "50%",
      background: on ? "var(--text-on-accent)" : "var(--text-tertiary)",
      transform: "translateX(" + (on ? 18 : 0) + "px)",
      transition: "transform var(--dur-fast) var(--ease-standard)"
    }
  }));
}
function Profile({
  theme,
  onTheme
}) {
  const {
    Modal,
    Button
  } = window.DesignSystem_8c38cb;
  const [evening, setEvening] = React.useState(true);
  const [confirm, setConfirm] = React.useState(false);
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Scroll, {
    style: {
      gap: "var(--space-7)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "var(--space-5)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 56,
      height: 56,
      borderRadius: "50%",
      background: "var(--surface-inset)",
      border: "1px solid var(--border)",
      display: "grid",
      placeItems: "center",
      fontFamily: "var(--font-accent)",
      fontSize: 22,
      color: "var(--text-secondary)"
    }
  }, "\u0410"), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 2
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "t-lead"
  }, "\u0410\u043D\u043D\u0430"), /*#__PURE__*/React.createElement("span", {
    className: "t-caption",
    style: {
      color: "var(--text-tertiary)"
    }
  }, "17 \u0440\u0430\u0441\u043A\u043B\u0430\u0434\u043E\u0432 \xB7 \u0441 \u0444\u0435\u0432\u0440\u0430\u043B\u044F 2026"))), /*#__PURE__*/React.createElement("section", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-3)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "t-label",
    style: {
      color: "var(--text-tertiary)"
    }
  }, "\u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438"), /*#__PURE__*/React.createElement(Row, {
    icon: "moon",
    title: "\u0422\u0451\u043C\u043D\u0430\u044F \u0442\u0435\u043C\u0430",
    hint: theme === "dark" ? "Включена" : "Выключена",
    right: /*#__PURE__*/React.createElement(Switch, {
      on: theme === "dark",
      onToggle: () => onTheme(theme === "dark" ? "light" : "dark")
    })
  }), /*#__PURE__*/React.createElement(Row, {
    icon: "bell",
    title: "\u041D\u0430\u043F\u043E\u043C\u0438\u043D\u0430\u043D\u0438\u0435 \u0432\u0435\u0447\u0435\u0440\u043E\u043C",
    hint: "21:00, \u043A\u0430\u0436\u0434\u044B\u0439 \u0434\u0435\u043D\u044C",
    right: /*#__PURE__*/React.createElement(Switch, {
      on: evening,
      onToggle: () => setEvening(v => !v)
    })
  }), /*#__PURE__*/React.createElement(Row, {
    icon: "languages",
    title: "\u042F\u0437\u044B\u043A",
    hint: "\u0420\u0443\u0441\u0441\u043A\u0438\u0439",
    right: /*#__PURE__*/React.createElement(Icon, {
      name: "chevron-right",
      size: 16,
      style: {
        color: "var(--text-tertiary)"
      }
    })
  })), /*#__PURE__*/React.createElement("section", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-3)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "t-label",
    style: {
      color: "var(--text-tertiary)"
    }
  }, "\u0414\u0430\u043D\u043D\u044B\u0435"), /*#__PURE__*/React.createElement(Row, {
    icon: "download",
    title: "\u0412\u044B\u0433\u0440\u0443\u0437\u0438\u0442\u044C \u0438\u0441\u0442\u043E\u0440\u0438\u044E",
    hint: "\u0424\u0430\u0439\u043B \u043F\u0440\u0438\u0434\u0451\u0442 \u0432 \u0447\u0430\u0442",
    right: /*#__PURE__*/React.createElement(Icon, {
      name: "chevron-right",
      size: 16,
      style: {
        color: "var(--text-tertiary)"
      }
    })
  }), /*#__PURE__*/React.createElement(Row, {
    icon: "trash-2",
    title: "\u0423\u0434\u0430\u043B\u0438\u0442\u044C \u0432\u0441\u0435 \u0440\u0430\u0441\u043A\u043B\u0430\u0434\u044B",
    danger: true,
    onClick: () => setConfirm(true)
  })), /*#__PURE__*/React.createElement("p", {
    className: "t-caption",
    style: {
      margin: 0,
      color: "var(--text-tertiary)",
      textAlign: "center"
    }
  }, "\u0410\u0440\u043A\u0430\u043D \u043D\u0435 \u0434\u0430\u0451\u0442 \u043C\u0435\u0434\u0438\u0446\u0438\u043D\u0441\u043A\u0438\u0445, \u044E\u0440\u0438\u0434\u0438\u0447\u0435\u0441\u043A\u0438\u0445 \u0438 \u0444\u0438\u043D\u0430\u043D\u0441\u043E\u0432\u044B\u0445 \u0441\u043E\u0432\u0435\u0442\u043E\u0432.")), /*#__PURE__*/React.createElement(Modal, {
    open: confirm,
    onClose: () => setConfirm(false),
    title: "\u0423\u0434\u0430\u043B\u0438\u0442\u044C \u0432\u0441\u0435 \u0440\u0430\u0441\u043A\u043B\u0430\u0434\u044B?",
    description: "\u0418\u0441\u0442\u043E\u0440\u0438\u044F \u0438 \u0442\u043E\u043B\u043A\u043E\u0432\u0430\u043D\u0438\u044F \u0438\u0441\u0447\u0435\u0437\u043D\u0443\u0442 \u043D\u0430\u0432\u0441\u0435\u0433\u0434\u0430. \u041E\u0442\u043C\u0435\u043D\u0438\u0442\u044C \u044D\u0442\u043E \u0431\u0443\u0434\u0435\u0442 \u043D\u0435\u043B\u044C\u0437\u044F.",
    actions: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
      variant: "danger",
      block: true,
      onClick: () => setConfirm(false)
    }, "\u0423\u0434\u0430\u043B\u0438\u0442\u044C"), /*#__PURE__*/React.createElement(Button, {
      variant: "text",
      block: true,
      onClick: () => setConfirm(false)
    }, "\u041E\u0442\u043C\u0435\u043D\u0430"))
  }));
}
Object.assign(window, {
  Profile
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/arkan-miniapp/Profile.jsx", error: String((e && e.message) || e) }); }

// ui_kits/arkan-miniapp/Reading.jsx
try { (() => {
function Reading({
  question,
  onFinish
}) {
  const {
    TarotCard,
    Message,
    QuickReplies,
    RitualLoader,
    Button
  } = window.DesignSystem_8c38cb;
  const spread = window.ARKAN_SPREAD;
  const [i, setI] = React.useState(0);
  const [phase, setPhase] = React.useState("loading"); // loading | back | dim | flip | text | reply
  const [answers, setAnswers] = React.useState({});
  const [loadStep, setLoadStep] = React.useState(0);
  const scrollRef = React.useRef(null);
  const card = spread[i];
  React.useEffect(() => {
    if (phase !== "loading") return;
    const a = setTimeout(() => setLoadStep(1), 900);
    const b = setTimeout(() => setLoadStep(2), 1800);
    const c = setTimeout(() => setPhase("back"), 2600);
    return () => [a, b, c].forEach(clearTimeout);
  }, [phase]);
  const reveal = () => {
    setPhase("dim");
    setTimeout(() => setPhase("flip"), 760); // пауза-подъём
    setTimeout(() => setPhase("text"), 1760); // после переворота
    setTimeout(() => setPhase("reply"), 2600);
  };
  const answer = opt => {
    setAnswers(a => ({
      ...a,
      [i]: opt
    }));
    setTimeout(() => {
      if (i === spread.length - 1) return onFinish(answers);
      setI(i + 1);
      setPhase("back");
      if (scrollRef.current) scrollRef.current.scrollTop = 0;
    }, 500);
  };
  if (phase === "loading") return /*#__PURE__*/React.createElement(Scroll, {
    style: {
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement(RitualLoader, {
    activeStep: loadStep,
    caption: "\u0422\u0440\u0438 \u043A\u0430\u0440\u0442\u044B \u2014 \u043F\u0440\u043E\u0448\u043B\u043E\u0435 \u043D\u0435 \u0441\u043F\u0440\u0430\u0448\u0438\u0432\u0430\u0435\u043C"
  }));
  const dim = phase === "dim" || phase === "flip";
  const open = phase === "flip" || phase === "text" || phase === "reply";
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    ref: scrollRef,
    style: {
      flex: 1,
      overflowY: "auto",
      padding: "var(--space-5) var(--screen-pad-x) var(--space-9)",
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-7)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-5)",
      opacity: dim ? .35 : 1,
      filter: dim ? "blur(3px)" : "none",
      transition: "opacity var(--dur-base) var(--ease-standard), filter var(--dur-base) var(--ease-standard)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 6
    }
  }, spread.map((s, n) => /*#__PURE__*/React.createElement("span", {
    key: n,
    style: {
      flex: 1,
      height: 2,
      borderRadius: 1,
      background: n <= i ? "var(--accent)" : "var(--border-strong)",
      transition: "background var(--dur-slow) var(--ease-standard)"
    }
  }))), /*#__PURE__*/React.createElement("p", {
    className: "t-caption",
    style: {
      margin: 0,
      color: "var(--text-tertiary)"
    }
  }, "\xAB", question, "\xBB")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "center",
      padding: "var(--space-4) 0",
      transform: dim ? "translateY(-8px)" : "none",
      transition: "transform var(--dur-slow) var(--ease-ritual)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      filter: dim ? "drop-shadow(0 0 34px rgba(142,140,216,.30))" : "none",
      transition: "filter var(--dur-reveal) var(--ease-ritual)"
    }
  }, /*#__PURE__*/React.createElement(TarotCard, {
    size: "lg",
    numeral: card.numeral,
    name: card.name,
    position: card.position,
    state: open ? phase === "flip" ? "revealing" : "face" : "back",
    onReveal: phase === "back" ? reveal : undefined
  }))), phase === "back" && /*#__PURE__*/React.createElement("p", {
    className: "t-body",
    style: {
      margin: 0,
      textAlign: "center",
      color: "var(--text-tertiary)"
    }
  }, "\u041A\u043E\u0441\u043D\u0438\u0442\u0435\u0441\u044C \u043A\u0430\u0440\u0442\u044B, \u043A\u043E\u0433\u0434\u0430 \u0431\u0443\u0434\u0435\u0442\u0435 \u0433\u043E\u0442\u043E\u0432\u044B"), (phase === "text" || phase === "reply") && /*#__PURE__*/React.createElement(Message, {
    from: "arkan",
    longform: true,
    appear: true
  }, card.text.map((p, n) => /*#__PURE__*/React.createElement("p", {
    key: n,
    style: {
      margin: n ? "var(--read-para-gap) 0 0" : 0,
      animation: "arkan-rise var(--dur-slow) var(--ease-enter) both",
      animationDelay: n * 70 + "ms"
    }
  }, p))), phase === "reply" && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-5)",
      animation: "arkan-rise var(--dur-base) var(--ease-enter) both"
    }
  }, /*#__PURE__*/React.createElement("p", {
    className: "t-lead",
    style: {
      margin: 0
    }
  }, card.ask), /*#__PURE__*/React.createElement(QuickReplies, {
    options: card.options,
    value: answers[i],
    onSelect: answer
  })), answers[i] && /*#__PURE__*/React.createElement(Message, {
    from: "user",
    time: "21:0" + (4 + i)
  }, answers[i])), /*#__PURE__*/React.createElement(Dock, null, /*#__PURE__*/React.createElement(Button, {
    variant: "text",
    block: true,
    onClick: () => onFinish(answers)
  }, "\u0421\u0432\u0435\u0440\u043D\u0443\u0442\u044C \u0440\u0430\u0441\u043A\u043B\u0430\u0434")));
}
Object.assign(window, {
  Reading
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/arkan-miniapp/Reading.jsx", error: String((e && e.message) || e) }); }

// ui_kits/arkan-miniapp/Shell.jsx
try { (() => {
const {
  useState
} = React;
function Phone({
  children,
  theme = "dark"
}) {
  return /*#__PURE__*/React.createElement("div", {
    "data-theme": theme,
    style: {
      width: 390,
      height: 844,
      position: "relative",
      overflow: "hidden",
      borderRadius: 44,
      background: "var(--surface)",
      color: "var(--text-primary)",
      border: "1px solid var(--border-strong)",
      boxShadow: "var(--shadow-3)",
      display: "flex",
      flexDirection: "column",
      fontFamily: "var(--font-core)"
    }
  }, children);
}
function TgHeader({
  title,
  onBack,
  right
}) {
  return /*#__PURE__*/React.createElement("header", {
    style: {
      flex: "none",
      height: 56,
      display: "flex",
      alignItems: "center",
      gap: "var(--space-4)",
      padding: "0 var(--screen-pad-x)",
      background: "var(--surface)",
      borderBottom: "1px solid var(--border)",
      marginTop: 18
    }
  }, onBack ? /*#__PURE__*/React.createElement("button", {
    onClick: onBack,
    "aria-label": "\u041D\u0430\u0437\u0430\u0434",
    style: {
      all: "unset",
      cursor: "pointer",
      color: "var(--accent)",
      display: "grid",
      placeItems: "center",
      width: 32,
      height: 32,
      marginLeft: -6
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "chevron-left",
    size: 22
  })) : /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-accent)",
      fontWeight: 300,
      letterSpacing: ".14em",
      fontSize: 15,
      color: "var(--text-secondary)"
    }
  }, "\u0410\u0420\u041A\u0410\u041D"), /*#__PURE__*/React.createElement("span", {
    className: "t-body",
    style: {
      fontWeight: 600,
      flex: 1,
      textAlign: "center",
      marginLeft: onBack ? 0 : -40
    }
  }, title), /*#__PURE__*/React.createElement("span", {
    style: {
      width: 32,
      display: "grid",
      placeItems: "center",
      color: "var(--text-tertiary)"
    }
  }, right));
}
function Scroll({
  children,
  pad = true,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: "auto",
      overflowX: "hidden",
      padding: pad ? "var(--space-6) var(--screen-pad-x) var(--space-9)" : 0,
      display: "flex",
      flexDirection: "column",
      ...style
    }
  }, children);
}
function Dock({
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      flex: "none",
      padding: "var(--space-4) var(--screen-pad-x) calc(var(--space-5) + var(--safe-bottom))",
      borderTop: "1px solid var(--border)",
      background: "var(--surface)",
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-3)"
    }
  }, children);
}
const TABS = [{
  id: "ask",
  label: "Расклад",
  icon: "sparkle"
}, {
  id: "day",
  label: "Карта дня",
  icon: "sun"
}, {
  id: "history",
  label: "История",
  icon: "clock"
}, {
  id: "profile",
  label: "Профиль",
  icon: "user"
}];
function TabBar({
  active,
  onChange
}) {
  return /*#__PURE__*/React.createElement("nav", {
    style: {
      flex: "none",
      display: "grid",
      gridTemplateColumns: "repeat(4,1fr)",
      borderTop: "1px solid var(--border)",
      background: "var(--surface)",
      padding: "var(--space-3) var(--space-2) calc(var(--space-3) + var(--safe-bottom))"
    }
  }, TABS.map(t => {
    const on = active === t.id;
    return /*#__PURE__*/React.createElement("button", {
      key: t.id,
      onClick: () => onChange(t.id),
      style: {
        all: "unset",
        cursor: "pointer",
        minHeight: "var(--hit-min)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
        color: on ? "var(--accent)" : "var(--text-tertiary)",
        transition: "color var(--dur-fast) var(--ease-standard)"
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: t.icon,
      size: 20
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        font: "600 10px/1 var(--font-core)",
        letterSpacing: ".02em"
      }
    }, t.label));
  }));
}
Object.assign(window, {
  Phone,
  TgHeader,
  Scroll,
  Dock,
  TabBar
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/arkan-miniapp/Shell.jsx", error: String((e && e.message) || e) }); }

// ui_kits/arkan-miniapp/Summary.jsx
try { (() => {
function Summary({
  question,
  onHistory
}) {
  const {
    TarotCard,
    Button,
    BottomSheet
  } = window.DesignSystem_8c38cb;
  const spread = window.ARKAN_SPREAD;
  const [sheet, setSheet] = React.useState(false);
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Scroll, {
    style: {
      gap: "var(--space-8)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-3)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "t-label",
    style: {
      color: "var(--text-tertiary)"
    }
  }, "\u0420\u0430\u0441\u043A\u043B\u0430\u0434 \u0446\u0435\u043B\u0438\u043A\u043E\u043C \xB7 \u0441\u0435\u0433\u043E\u0434\u043D\u044F, 21:04"), /*#__PURE__*/React.createElement("h1", {
    className: "t-heading",
    style: {
      margin: 0,
      textWrap: "pretty"
    }
  }, "\xAB", question, "\xBB")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "var(--space-4)",
      justifyContent: "space-between"
    }
  }, spread.map(c => /*#__PURE__*/React.createElement(TarotCard, {
    key: c.name,
    size: "sm",
    state: "face",
    numeral: c.numeral,
    name: c.name,
    position: c.position
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-7)"
    }
  }, spread.map(c => /*#__PURE__*/React.createElement("section", {
    key: c.name,
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-3)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "t-label",
    style: {
      color: "var(--accent)"
    }
  }, c.position), /*#__PURE__*/React.createElement("h2", {
    className: "t-display",
    style: {
      margin: 0,
      fontSize: 26,
      lineHeight: 1.15
    }
  }, c.name), /*#__PURE__*/React.createElement("div", {
    className: "t-read",
    style: {
      color: "var(--text-secondary)"
    }
  }, c.text.map((t, n) => /*#__PURE__*/React.createElement("p", {
    key: n,
    style: {
      margin: n ? "var(--read-para-gap) 0 0" : 0
    }
  }, t)))))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "var(--space-5)",
      background: "var(--accent-muted)",
      border: "1px solid var(--accent-border)",
      borderRadius: "var(--radius-lg)",
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-3)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "t-label",
    style: {
      color: "var(--accent)"
    }
  }, "\u0428\u0430\u0433 \u043D\u0430 \u043D\u0435\u0434\u0435\u043B\u044E"), /*#__PURE__*/React.createElement("p", {
    className: "t-body",
    style: {
      margin: 0
    }
  }, "\u041D\u0435 \u043F\u0440\u0438\u043D\u0438\u043C\u0430\u0442\u044C \u0440\u0435\u0448\u0435\u043D\u0438\u0435 \u0434\u043E \u043F\u044F\u0442\u043D\u0438\u0446\u044B. \u0417\u0430\u043F\u0438\u0441\u0430\u0442\u044C, \u0447\u0442\u043E \u0438\u0437\u043C\u0435\u043D\u0438\u0442\u0441\u044F, \u0435\u0441\u043B\u0438 \u0432\u044B \u0441\u043E\u0433\u043B\u0430\u0441\u0438\u0442\u0435\u0441\u044C."))), /*#__PURE__*/React.createElement(Dock, null, /*#__PURE__*/React.createElement(Button, {
    size: "lg",
    block: true,
    onClick: onHistory
  }, "\u0421\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C \u0438 \u0437\u0430\u043A\u0440\u044B\u0442\u044C"), /*#__PURE__*/React.createElement(Button, {
    variant: "text",
    block: true,
    onClick: () => setSheet(true)
  }, "\u041F\u043E\u0434\u0435\u043B\u0438\u0442\u044C\u0441\u044F")), /*#__PURE__*/React.createElement(BottomSheet, {
    open: sheet,
    onClose: () => setSheet(false),
    title: "\u041F\u043E\u0434\u0435\u043B\u0438\u0442\u044C\u0441\u044F \u0440\u0430\u0441\u043A\u043B\u0430\u0434\u043E\u043C",
    footer: /*#__PURE__*/React.createElement(Button, {
      block: true,
      onClick: () => setSheet(false)
    }, "\u041E\u0442\u043F\u0440\u0430\u0432\u0438\u0442\u044C \u0432 \u0447\u0430\u0442")
  }, /*#__PURE__*/React.createElement("p", {
    className: "t-body",
    style: {
      margin: 0,
      color: "var(--text-secondary)"
    }
  }, "\u0412 \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u0435 \u043F\u043E\u043F\u0430\u0434\u0443\u0442 \u043D\u0430\u0437\u0432\u0430\u043D\u0438\u044F \u043A\u0430\u0440\u0442 \u0438 \u0438\u0442\u043E\u0433\u043E\u0432\u044B\u0439 \u0448\u0430\u0433. \u0412\u0430\u0448 \u0432\u043E\u043F\u0440\u043E\u0441 \u0438 \u0442\u043E\u043B\u043A\u043E\u0432\u0430\u043D\u0438\u044F \u043E\u0441\u0442\u0430\u044E\u0442\u0441\u044F \u0437\u0434\u0435\u0441\u044C.")));
}
Object.assign(window, {
  Summary
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/arkan-miniapp/Summary.jsx", error: String((e && e.message) || e) }); }

// ui_kits/arkan-miniapp/data.js
try { (() => {
window.ARKAN_SPREAD = [{
  position: "Что уже происходит",
  numeral: "XVI",
  name: "Башня",
  text: ["Башня говорит не о катастрофе, а о конструкции, которая держалась дольше, чем следовало.", "Вы уже знаете, где именно она трещит, — иначе не задали бы этот вопрос."],
  ask: "Это похоже на то, что вы чувствуете?",
  options: ["Да, узнаю", "Скорее нет", "Пока не понимаю"]
}, {
  position: "Что вы не видите",
  numeral: "II",
  name: "Жрица",
  text: ["Жрица рядом с Башней — про знание, которое у вас уже есть, но которое вы себе не разрешаете назвать вслух.", "Она не советует действовать. Она советует признать, что решение принято раньше, чем вы начали его обсуждать."],
  ask: "Что из этого вы знали до карты?",
  options: ["Почти всё", "Половину", "Ничего"]
}, {
  position: "Куда это ведёт",
  numeral: "XVII",
  name: "Звезда",
  text: ["Звезда — самая тихая карта расклада. Она не обещает лёгкости, но показывает, что после обрушения остаётся место, а не пустота.", "Ближайший шаг — не строить заново, а побыть в этом месте без плана."],
  ask: "Хотите зафиксировать один шаг на неделю?",
  options: ["Да, давайте", "Не сейчас"]
}];
window.ARKAN_HISTORY = [{
  date: "сегодня, 21:04",
  question: "Стоит ли соглашаться на новую роль",
  cards: ["Башня", "Жрица", "Звезда"],
  status: "today"
}, {
  date: "вчера, 23:12",
  question: "Что мне мешает отпустить эту историю",
  cards: ["Луна", "Восьмёрка кубков"],
  status: "unfinished"
}, {
  date: "12 марта",
  question: "Как развиваются наши отношения",
  cards: ["Двойка кубков", "Семёрка мечей", "Умеренность"],
  status: "done"
}, {
  date: "28 февраля",
  question: "На чём стоит сосредоточиться этой весной",
  cards: ["Маг", "Девятка пентаклей"],
  status: "done"
}];
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/arkan-miniapp/data.js", error: String((e && e.message) || e) }); }

__ds_ns.Message = __ds_scope.Message;

__ds_ns.QuickReplies = __ds_scope.QuickReplies;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Chip = __ds_scope.Chip;

__ds_ns.EmptyState = __ds_scope.EmptyState;

__ds_ns.ErrorState = __ds_scope.ErrorState;

__ds_ns.QuestionInput = __ds_scope.QuestionInput;

__ds_ns.BottomSheet = __ds_scope.BottomSheet;

__ds_ns.Modal = __ds_scope.Modal;

__ds_ns.SpreadCard = __ds_scope.SpreadCard;

__ds_ns.RitualLoader = __ds_scope.RitualLoader;

__ds_ns.TarotCard = __ds_scope.TarotCard;

})();
