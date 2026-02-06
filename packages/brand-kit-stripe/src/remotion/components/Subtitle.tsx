import React from "react";
import { useBrand } from "../BrandProvider";

export const Subtitle: React.FC<{
  children: React.ReactNode;
  maxWidth?: number;
}> = ({ children, maxWidth = 860 }) => {
  const { tokens } = useBrand();
  return (
    <p
      style={{
        margin: 0,
        maxWidth,
        color: tokens.colors.muted,
        fontSize: tokens.typography.scale.body,
        lineHeight: 1.3,
      }}
    >
      {children}
    </p>
  );
};
