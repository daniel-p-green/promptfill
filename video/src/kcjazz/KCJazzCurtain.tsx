import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { KCJazzTheme } from "./theme";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const KCJazzCurtain: React.FC<{
  theme: KCJazzTheme;
  durationInFrames: number;
}> = ({ theme, durationInFrames }) => {
  const frame = useCurrentFrame();

  const wipeFrames = 14;
  const inP = interpolate(frame, [0, wipeFrames], [1, 0], clamp);
  const outP = interpolate(frame, [durationInFrames - wipeFrames, durationInFrames], [0, 1], clamp);
  const cover = Math.max(inP, outP);

  if (cover <= 0.0001) return null;

  const bg =
    theme.style === "sheet"
      ? `linear-gradient(180deg, ${theme.colors.bg0}, ${theme.colors.bg1})`
      : `linear-gradient(180deg, ${theme.colors.bg0}, ${theme.colors.bg1})`;

  const x = interpolate(cover, [0, 1], [1280, -80]);

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          inset: -120,
          backgroundImage: bg,
          transform: `translateX(${x}px)`,
          boxShadow:
            theme.style === "sheet"
              ? "0 20px 60px rgba(0,0,0,0.12)"
              : "0 30px 120px rgba(0,0,0,0.65)",
        }}
      />
    </AbsoluteFill>
  );
};

