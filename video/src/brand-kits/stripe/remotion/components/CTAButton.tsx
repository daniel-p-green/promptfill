import React from "react";
import { useBrand } from "../BrandProvider";

export const CTAButton: React.FC<{ label: string }> = ({ label }) => {
  const { tokens } = useBrand();
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: tokens.radius.pill,
        padding: `${tokens.spacing.sm}px ${tokens.spacing.lg}px`,
        fontSize: 24,
        fontWeight: 700,
        background: tokens.gradients.accent,
        color: tokens.colors.text,
        boxShadow: tokens.shadows.lift,
      }}
    >
      {label}
    </div>
  );
};
