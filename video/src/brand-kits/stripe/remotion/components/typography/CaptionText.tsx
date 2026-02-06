import React from "react";
import { useBrand } from "../../BrandProvider";
import { clipWords } from "./utils";

export const CaptionText: React.FC<{ text: string }> = ({ text }) => {
  const { tokens } = useBrand();
  const content = clipWords(text, 14);
  return (
    <p
      style={{
        margin: 0,
        color: tokens.colors.muted,
        fontSize: 18,
        lineHeight: 1.25,
      }}
    >
      {content}
    </p>
  );
};
