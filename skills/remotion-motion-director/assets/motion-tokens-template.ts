export type PacingProfile = "calm" | "measured" | "energetic";

export const BRAND_TOKENS = {
  color: {
    bgPrimary: "#000000",
    bgSecondary: "#111111",
    textPrimary: "#ffffff",
    textSecondary: "#b8b8b8",
    accentPrimary: "#4f8cff",
    accentSecondary: "#7be0b8",
  },
  typography: {
    headingFamily: "Inter, system-ui, sans-serif",
    bodyFamily: "Inter, system-ui, sans-serif",
    monoFamily: "ui-monospace, Menlo, monospace",
    scale: {
      hero: 96,
      h1: 64,
      h2: 48,
      body: 32,
      caption: 24,
    },
    lineHeight: {
      heading: 1.05,
      body: 1.25,
    },
  },
  layout: {
    safeMargin: 80,
    radius: 20,
    spacing: [8, 12, 16, 24, 32, 48, 64] as const,
  },
} as const;

export const MOTION_TOKENS = {
  calm: {
    spring: { damping: 24, stiffness: 80, mass: 1 },
    transitionFrames: 10,
    entryDistancePx: 16,
    holdFrames: 36,
  },
  measured: {
    spring: { damping: 18, stiffness: 110, mass: 1 },
    transitionFrames: 8,
    entryDistancePx: 22,
    holdFrames: 28,
  },
  energetic: {
    spring: { damping: 14, stiffness: 140, mass: 0.9 },
    transitionFrames: 6,
    entryDistancePx: 28,
    holdFrames: 20,
  },
} as const;

export const getMotionProfile = (profile: PacingProfile) => MOTION_TOKENS[profile];
