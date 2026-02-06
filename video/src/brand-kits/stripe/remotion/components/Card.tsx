import React from "react";
import { useBrand } from "../BrandProvider";

export const Card: React.FC<{
  title: string;
  body: string;
  accent?: boolean;
}> = ({ title, body, accent = false }) => {
  const { tokens } = useBrand();
  return (
    <div
      style={{
        flex: 1,
        minWidth: 0,
        borderRadius: tokens.radius.md,
        border: `1px solid ${accent ? tokens.colors.accent : tokens.colors.surfaceAlt}`,
        background: accent ? "rgba(99,91,255,0.12)" : tokens.colors.surface,
        boxShadow: tokens.shadows.soft,
        padding: tokens.spacing.md,
      }}
    >
      <div style={{ fontSize: tokens.typography.scale.small, fontWeight: 700 }}>{title}</div>
      <div
        style={{
          marginTop: tokens.spacing.sm,
          color: tokens.colors.muted,
          fontSize: 24,
          lineHeight: 1.3,
        }}
      >
        {body}
      </div>
    </div>
  );
};
