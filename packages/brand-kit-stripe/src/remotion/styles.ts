import type { CSSProperties } from "react";
import type { BrandTokens } from "../brand/tokens";

export const createBaseStyles = (tokens: BrandTokens) => {
  const frame: CSSProperties = {
    color: tokens.colors.text,
    fontFamily: tokens.typography.body,
    background: tokens.gradients.hero,
    padding: tokens.spacing.xl,
  };

  const panel: CSSProperties = {
    background: "rgba(17, 26, 45, 0.78)",
    border: `1px solid ${tokens.colors.surfaceAlt}`,
    borderRadius: tokens.radius.lg,
    boxShadow: tokens.shadows.soft,
    backdropFilter: "blur(10px)",
  };

  const card: CSSProperties = {
    background: tokens.colors.surface,
    border: `1px solid ${tokens.colors.surfaceAlt}`,
    borderRadius: tokens.radius.md,
    boxShadow: tokens.shadows.soft,
  };

  return {
    frame,
    panel,
    card,
  };
};

export const safeZoneStyle = (width: number, height: number): CSSProperties => ({
  position: "absolute",
  left: Math.round(width * 0.06),
  top: Math.round(height * 0.06),
  width: Math.round(width * 0.88),
  height: Math.round(height * 0.88),
  border: "1px dashed rgba(255,255,255,0.18)",
  borderRadius: 20,
  pointerEvents: "none",
});
