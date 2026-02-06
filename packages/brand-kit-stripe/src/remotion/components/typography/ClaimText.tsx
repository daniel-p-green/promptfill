import React from "react";
import { useBrand } from "../../BrandProvider";
import { clipWords } from "./utils";

export const ClaimText: React.FC<{ text: string }> = ({ text }) => {
  const { tokens, fonts } = useBrand();
  const content = clipWords(text, 12);
  return (
    <h2
      style={{
        margin: 0,
        maxWidth: 780,
        fontFamily: fonts.display,
        fontSize: tokens.typography.scale.h2,
        lineHeight: 1.08,
        letterSpacing: -0.7,
        fontWeight: 740,
      }}
    >
      {content}
    </h2>
  );
};
