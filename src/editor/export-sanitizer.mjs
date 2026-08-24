export function sanitizeSvg(svgString) {
  let s = svgString.replace(/<g id="svgo-overlay">[\s\S]*?<\/g>/, '');
  s = s.replace(/<svg\b(?![^>]*\sxmlns=)/, '<svg xmlns="http://www.w3.org/2000/svg"');
  s = s.replace(/(\s[a-zA-Z-]+)="(-?\d+\.\d{2,})"/g,
    (_, attr, num) => ` ${attr}="${String(Math.round(parseFloat(num) * 10) / 10)}"`);
  return s;
}
