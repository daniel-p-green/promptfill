export type BrandTokens = {
  brand: string;
  version: string;
  colors: {
    bg: string;
    surface: string;
    surfaceAlt: string;
    text: string;
    muted: string;
    accent: string;
    accentAlt: string;
    success: string;
    warning: string;
    danger: string;
  };
  gradients: {
    hero: string;
    accent: string;
  };
  typography: {
    display: string;
    body: string;
    mono: string;
    scale: {
      hero: number;
      h1: number;
      h2: number;
      h3: number;
      body: number;
      small: number;
    };
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  radius: {
    sm: number;
    md: number;
    lg: number;
    pill: number;
  };
  shadows: {
    soft: string;
    focus: string;
    lift: string;
  };
};

export const stripeTokens: BrandTokens = {
  brand: "stripe",
  version: "1.0.0",
  colors: {
    bg: "#0A0F1C",
    surface: "#111A2D",
    surfaceAlt: "#17233C",
    text: "#F7FAFF",
    muted: "#B7C2DA",
    accent: "#635BFF",
    accentAlt: "#00D4FF",
    success: "#2CB67D",
    warning: "#F4B740",
    danger: "#FF5A5F",
  },
  gradients: {
    hero: "linear-gradient(135deg, #0A0F1C 10%, #1B2B59 55%, #635BFF 100%)",
    accent: "linear-gradient(135deg, #635BFF 0%, #00D4FF 100%)",
  },
  typography: {
    display: "Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif",
    body: "Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif",
    mono: "JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, monospace",
    scale: {
      hero: 86,
      h1: 64,
      h2: 48,
      h3: 36,
      body: 30,
      small: 22,
    },
  },
  spacing: {
    xs: 8,
    sm: 16,
    md: 24,
    lg: 32,
    xl: 48,
    xxl: 64,
  },
  radius: {
    sm: 10,
    md: 16,
    lg: 24,
    pill: 999,
  },
  shadows: {
    soft: "0 12px 30px rgba(8, 12, 24, 0.35)",
    focus: "0 0 0 3px rgba(99, 91, 255, 0.35)",
    lift: "0 24px 70px rgba(6, 10, 20, 0.55)",
  },
};
