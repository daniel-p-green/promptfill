import React from "react";
import { useBrand } from "../BrandProvider";

export const Title: React.FC<{
  children: React.ReactNode;
  maxWidth?: number;
}> = ({ children, maxWidth = 860 }) => {
  const { tokens, fonts } = useBrand();
  return (
    <h1
      style={{
        margin: 0,
        maxWidth,
        fontFamily: fonts.display,
        fontSize: tokens.typography.scale.h1,
        lineHeight: 1.02,
        letterSpacing: -1,
        fontWeight: 780,
      }}
    >
      {children}
    </h1>
  );
};
