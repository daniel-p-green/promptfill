import React from "react";
import { useBrand } from "../../BrandProvider";
import { clipWords } from "./utils";

export const BodyText: React.FC<{ text: string }> = ({ text }) => {
  const { tokens } = useBrand();
  const content = clipWords(text, 26);
  return (
    <p
      style={{
        margin: 0,
        maxWidth: 840,
        color: tokens.colors.muted,
        fontSize: tokens.typography.scale.body,
        lineHeight: 1.3,
      }}
    >
      {content}
    </p>
  );
};
