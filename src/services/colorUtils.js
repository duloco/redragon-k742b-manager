/**
 * Color conversions between QMK HSV (0-255) and Web HEX (#RRGGBB)
 */

export function hsvToHex(h, s, v = 180) {
  const H = (h / 255) * 360;
  const S = s / 255;
  const V = Math.min(1, Math.max(0.2, v / 180));

  const C = V * S;
  const X = C * (1 - Math.abs(((H / 60) % 2) - 1));
  const m = V - C;

  let r = 0, g = 0, b = 0;
  if (H >= 0 && H < 60) { r = C; g = X; b = 0; }
  else if (H >= 60 && H < 120) { r = X; g = C; b = 0; }
  else if (H >= 120 && H < 180) { r = 0; g = C; b = X; }
  else if (H >= 180 && H < 240) { r = 0; g = X; b = C; }
  else if (H >= 240 && H < 300) { r = X; g = 0; b = C; }
  else { r = C; g = 0; b = X; }

  const toHex = (n) => {
    const val = Math.round((n + m) * 255);
    return Math.max(0, Math.min(255, val)).toString(16).padStart(2, '0');
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function hexToHsv(hex) {
  let clean = hex.replace('#', '');
  if (clean.length === 3) {
    clean = clean.split('').map(c => c + c).join('');
  }

  const r = parseInt(clean.substring(0, 2), 16) / 255;
  const g = parseInt(clean.substring(2, 4), 16) / 255;
  const b = parseInt(clean.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;

  let h = 0;
  const s = max === 0 ? 0 : d / max;
  const v = max;

  if (d !== 0) {
    if (max === r) {
      h = ((g - b) / d) + (g < b ? 6 : 0);
    } else if (max === g) {
      h = ((b - r) / d) + 2;
    } else {
      h = ((r - g) / d) + 4;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 255),
    s: Math.round(s * 255),
    v: Math.round(v * 180)
  };
}
