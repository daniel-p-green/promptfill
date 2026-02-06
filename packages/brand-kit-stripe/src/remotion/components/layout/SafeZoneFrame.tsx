import React from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { useBrand } from "../../BrandProvider";
import type { SceneFormat } from "../../types";

const insetsFor = (format: SceneFormat) => {
  if (format === "reels-9x16") {
    return {
      top: 0.1,
      bottom: 0.16,
      side: 0.08,
    };
  }
  return {
    top: 0.09,
    bottom: 0.1,
    side: 0.08,
  };
};

export const SafeZoneFrame: React.FC<{
  format: SceneFormat;
  showGuides?: boolean;
  children: React.ReactNode;
}> = ({ format, showGuides = false, children }) => {
  const { width, height } = useVideoConfig();
  const { tokens } = useBrand();
  const insets = insetsFor(format);

  const left = Math.round(width * insets.side);
  const right = left;
  const top = Math.round(height * insets.top);
  const bottom = Math.round(height * insets.bottom);

  return (
    <AbsoluteFill
      style={{
        background: tokens.gradients.hero,
        color: tokens.colors.text,
      }}
    >
      <div
        style={{
          position: "absolute",
          left,
          right,
          top,
          bottom,
          display: "flex",
          flexDirection: "column",
          gap: tokens.spacing.lg,
        }}
      >
        {children}
      </div>
      {showGuides ? (
        <div
          style={{
            position: "absolute",
            left,
            right,
            top,
            bottom,
            border: "1px dashed rgba(255,255,255,0.24)",
            borderRadius: 18,
            pointerEvents: "none",
          }}
        />
      ) : null}
    </AbsoluteFill>
  );
};
