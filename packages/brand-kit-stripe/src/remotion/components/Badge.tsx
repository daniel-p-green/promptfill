import React from "react";
import { useBrand } from "../BrandProvider";

export const Badge: React.FC<{ label: string }> = ({ label }) => {
  const { tokens } = useBrand();
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: tokens.spacing.xs,
        borderRadius: tokens.radius.pill,
        padding: `${tokens.spacing.xs}px ${tokens.spacing.sm}px`,
        background: "rgba(255,255,255,0.08)",
        border: `1px solid ${tokens.colors.surfaceAlt}`,
        fontSize: tokens.typography.scale.small,
      }}
    >
      <span
        style={{
          width: 10,
          height: 10,
          borderRadius: tokens.radius.pill,
          background: tokens.colors.accentAlt,
        }}
      />
      {label}
    </div>
  );
};
