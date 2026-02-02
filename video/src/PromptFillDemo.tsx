import React from "react";
import { AbsoluteFill, Sequence, interpolate, useCurrentFrame } from "remotion";
import { TitleCard } from "./scenes/TitleCard";
import { ProblemCard } from "./scenes/ProblemCard";
import { FeatureTriptych } from "./scenes/FeatureTriptych";
import { FlowDemo } from "./scenes/FlowDemo";
import { ClosingCard } from "./scenes/ClosingCard";

export type PromptFillDemoProps = {
  productName: string;
  accent: string;
};

export const PromptFillDemo: React.FC<PromptFillDemoProps> = ({
  productName,
  accent,
}) => {
  const frame = useCurrentFrame();
  const fade = (start: number, end: number) =>
    interpolate(frame, [start, end], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

  return (
    <AbsoluteFill style={{ backgroundColor: "#0b0d10" }}>
      {/* subtle vignette */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(1200px 700px at 50% 30%, rgba(255,255,255,0.06), rgba(0,0,0,0) 60%)",
          opacity: 0.9,
        }}
      />

      {/* 0–6s */}
      <Sequence from={0} durationInFrames={6 * 30}>
        <TitleCard productName={productName} accent={accent} />
      </Sequence>

      {/* 6–16s */}
      <Sequence from={6 * 30} durationInFrames={10 * 30}>
        <ProblemCard accent={accent} />
      </Sequence>

      {/* 16–28s */}
      <Sequence from={16 * 30} durationInFrames={12 * 30}>
        <FeatureTriptych accent={accent} />
      </Sequence>

      {/* 28–52s */}
      <Sequence from={28 * 30} durationInFrames={24 * 30}>
        <FlowDemo accent={accent} productName={productName} />
      </Sequence>

      {/* 52–60s */}
      <Sequence from={52 * 30} durationInFrames={8 * 30}>
        <ClosingCard accent={accent} productName={productName} />
      </Sequence>

      {/* film grain */}
      <AbsoluteFill
        style={{
          backgroundImage:
            "url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22%3E%3Cfilter id=%22n%22 x=%220%22 y=%220%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%222%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22200%22 height=%22200%22 filter=%22url(%23n)%22 opacity=%220.25%22/%3E%3C/svg%3E')",
          mixBlendMode: "overlay",
          opacity: 0.12,
        }}
      />

      {/* global fade-in */}
      <AbsoluteFill style={{ opacity: fade(0, 12) }} />
    </AbsoluteFill>
  );
};
