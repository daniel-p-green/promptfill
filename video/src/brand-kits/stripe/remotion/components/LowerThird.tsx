import React from "react";
import { useBrand } from "../BrandProvider";

export const LowerThird: React.FC<{
  heading: string;
  subheading: string;
}> = ({ heading, subheading }) => {
  const { tokens } = useBrand();
  return (
    <div
      style={{
        position: "absolute",
        left: tokens.spacing.xl,
        right: tokens.spacing.xl,
        bottom: tokens.spacing.xl,
        borderRadius: tokens.radius.md,
        padding: tokens.spacing.md,
        background: "rgba(10, 15, 28, 0.82)",
        border: `1px solid ${tokens.colors.surfaceAlt}`,
      }}
    >
      <div style={{ fontSize: tokens.typography.scale.small, fontWeight: 700 }}>{heading}</div>
      <div style={{ marginTop: 8, color: tokens.colors.muted, fontSize: 22 }}>{subheading}</div>
    </div>
  );
};
