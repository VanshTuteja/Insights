const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const normalizeHex = (hex: string) => {
  const value = hex.replace('#', '').trim();
  if (value.length === 3) {
    return value.split('').map((char) => `${char}${char}`).join('');
  }
  return value.slice(0, 6);
};

const hexToRgb = (hex: string) => {
  const normalized = normalizeHex(hex);
  const parsed = Number.parseInt(normalized, 16);

  return {
    r: (parsed >> 16) & 255,
    g: (parsed >> 8) & 255,
    b: parsed & 255,
  };
};

const rgbToHex = (r: number, g: number, b: number) =>
  `#${[r, g, b]
    .map((channel) => clamp(Math.round(channel), 0, 255).toString(16).padStart(2, '0'))
    .join('')}`;

const mix = (base: string, accent: string, weight: number) => {
  const ratio = clamp(weight, 0, 1);
  const first = hexToRgb(base);
  const second = hexToRgb(accent);

  return rgbToHex(
    first.r + (second.r - first.r) * ratio,
    first.g + (second.g - first.g) * ratio,
    first.b + (second.b - first.b) * ratio,
  );
};

const tint = (hex: string, amount: number) => mix(hex, '#ffffff', amount);
const shade = (hex: string, amount: number) => mix(hex, '#0f172a', amount);

export const createPremiumChartPalette = (primary: string, secondary: string, darkTheme: boolean) => {
  const anchor = darkTheme ? tint(primary, 0.12) : shade(primary, 0.08);
  const support = darkTheme ? tint(secondary, 0.24) : shade(secondary, 0.2);
  const success = darkTheme ? tint(mix(primary, '#14b8a6', 0.5), 0.18) : shade(mix(primary, '#14b8a6', 0.34), 0.18);
  const warning = darkTheme ? tint(mix(primary, '#f59e0b', 0.62), 0.14) : shade(mix(primary, '#f59e0b', 0.56), 0.12);
  const danger = darkTheme ? tint(mix(primary, '#ef4444', 0.7), 0.1) : shade(mix(primary, '#ef4444', 0.62), 0.1);
  const neutral = darkTheme ? tint(mix(primary, '#94a3b8', 0.72), 0.16) : shade(mix(primary, '#cbd5e1', 0.7), 0.24);

  return {
    primary: anchor,
    secondary: support,
    success,
    warning,
    danger,
    neutral,
  };
};
