import React from "react";
import { useBrand } from "../../BrandProvider";
import { clipWords } from "./utils";

export const CtaText: React.FC<{ text: string }> = ({ text }) => {
  const { tokens } = useBrand();
  const content = clipWords(text, 4);
  return (
    <span
      style={{
        color: tokens.colors.text,
        fontSize: 24,
        fontWeight: 700,
        letterSpacing: -0.2,
      }}
    >
      {content}
    </span>
  );
};
