import React from "react";
import { useBrand } from "../../BrandProvider";
import { clipWords } from "./utils";

export const HookText: React.FC<{ text: string }> = ({ text }) => {
  const { tokens, fonts } = useBrand();
  const content = clipWords(text, 8);
  return (
    <h1
      style={{
        margin: 0,
        maxWidth: 760,
        fontFamily: fonts.display,
        fontSize: tokens.typography.scale.h1,
        lineHeight: 1.02,
        letterSpacing: -1,
        fontWeight: 780,
      }}
    >
      {content}
    </h1>
  );
};
