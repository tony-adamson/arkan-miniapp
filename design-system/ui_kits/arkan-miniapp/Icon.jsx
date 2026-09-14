const LUCIDE = "https://unpkg.com/lucide-static@0.451.0/icons/";
function Icon({name, size = 20, style}) {
  const url = "url(" + LUCIDE + name + ".svg)";
  return <span aria-hidden="true" style={{
    display:"inline-block", width:size, height:size, flex:"none", background:"currentColor",
    WebkitMaskImage:url, maskImage:url, WebkitMaskSize:"contain", maskSize:"contain",
    WebkitMaskRepeat:"no-repeat", maskRepeat:"no-repeat", WebkitMaskPosition:"center", maskPosition:"center",
    ...style}} />;
}
Object.assign(window, {Icon});
