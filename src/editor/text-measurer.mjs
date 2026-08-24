export const FONT_STACK = '"PingFang SC", "Microsoft YaHei", sans-serif';

export function createTextMeasurer(measureFn, { pad = 16 } = {}) {
  return {
    pad,
    width: (text, fontSize, weight = 400) => measureFn(text, fontSize, weight),
    fitWidth(text, { fontSize, weight = 400 }) {
      return this.width(text, fontSize, weight) + pad * 2;
    },
  };
}

export function bindCanvasMeasure() {
  if (typeof document === 'undefined') throw new Error('canvas unavailable in node');
  const ctx = document.createElement('canvas').getContext('2d');
  return (text, fontSize, weight = 400) => {
    ctx.font = `${weight} ${fontSize}px ${FONT_STACK}`;
    return ctx.measureText(text).width;
  };
}
