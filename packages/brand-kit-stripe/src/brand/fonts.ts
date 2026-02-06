export const stripeFonts = {
  display: "Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif",
  body: "Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif",
  mono: "JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, monospace",
} as const;

export type StripeFontRole = keyof typeof stripeFonts;

export const fontFor = (role: StripeFontRole): string => stripeFonts[role];
