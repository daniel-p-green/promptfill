import React from "react";
import {
  AbsoluteFill,
  Sequence,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { AnimationTitleCard } from "./scenes/animation/AnimationTitleCard";
import { PrinciplesOverview } from "./scenes/animation/PrinciplesOverview";
import { PrincipleShowcase } from "./scenes/animation/PrincipleShowcase";
import { AnimationClosingCard } from "./scenes/animation/AnimationClosingCard";

export type AnimationPrinciplesProps = {
  accent: string;
};

const PRINCIPLES = [
  {
    number: 1,
    name: "Squash & Stretch",
    description: "Give weight and flexibility to objects",
    icon: "◯",
  },
  {
    number: 2,
    name: "Anticipation",
    description: "Prepare the audience for an action",
    icon: "↺",
  },
  {
    number: 3,
    name: "Staging",
    description: "Direct attention to what's important",
    icon: "◎",
  },
  {
    number: 4,
    name: "Straight Ahead & Pose to Pose",
    description: "Two approaches to creating movement",
    icon: "→",
  },
  {
    number: 5,
    name: "Follow Through & Overlapping",
    description: "Parts move at different rates",
    icon: "≋",
  },
  {
    number: 6,
    name: "Slow In & Slow Out",
    description: "Ease into and out of actions",
    icon: "⋯",
  },
  {
    number: 7,
    name: "Arc",
    description: "Natural movements follow curved paths",
    icon: "⌒",
  },
  {
    number: 8,
    name: "Secondary Action",
    description: "Supporting actions enhance the main one",
    icon: "◈",
  },
  {
    number: 9,
    name: "Timing",
    description: "Speed affects weight and emotion",
    icon: "⏱",
  },
  {
    number: 10,
    name: "Exaggeration",
    description: "Push poses further for impact",
    icon: "⚡",
  },
  {
    number: 11,
    name: "Solid Drawing",
    description: "Understand form, weight, and volume",
    icon: "△",
  },
  {
    number: 12,
    name: "Appeal",
    description: "Create characters people want to watch",
    icon: "★",
  },
];

export const AnimationPrinciples: React.FC<AnimationPrinciplesProps> = ({
  accent,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const fade = (start: number, end: number) =>
    interpolate(frame, [start, end], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0a0f" }}>
      {/* Animated gradient background */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 1400px 800px at 50% 40%, ${accent}15, transparent 70%)`,
        }}
      />

      {/* Subtle grid pattern */}
      <AbsoluteFill style={{ opacity: 0.5, pointerEvents: "none" }}>
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${width} ${height}`}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="grid"
              width="60"
              height="60"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 60 0 L 0 0 0 60"
                fill="none"
                stroke="rgba(255,255,255,0.02)"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </AbsoluteFill>

      {/* 0–5s: Title Card */}
      <Sequence durationInFrames={5 * 30}>
        <AnimationTitleCard accent={accent} />
      </Sequence>

      {/* 5–14s: Overview of all 12 principles */}
      <Sequence from={5 * 30} durationInFrames={9 * 30}>
        <PrinciplesOverview principles={PRINCIPLES} accent={accent} />
      </Sequence>

      {/* 14–26s: First 4 principles showcase */}
      <Sequence from={14 * 30} durationInFrames={12 * 30}>
        <PrincipleShowcase
          principles={PRINCIPLES.slice(0, 4)}
          accent={accent}
          groupLabel="Foundation"
        />
      </Sequence>

      {/* 26–38s: Middle 4 principles showcase */}
      <Sequence from={26 * 30} durationInFrames={12 * 30}>
        <PrincipleShowcase
          principles={PRINCIPLES.slice(4, 8)}
          accent={accent}
          groupLabel="Dynamics"
        />
      </Sequence>

      {/* 38–50s: Last 4 principles showcase */}
      <Sequence from={38 * 30} durationInFrames={12 * 30}>
        <PrincipleShowcase
          principles={PRINCIPLES.slice(8, 12)}
          accent={accent}
          groupLabel="Polish"
        />
      </Sequence>

      {/* 50–60s: Closing */}
      <Sequence from={50 * 30} durationInFrames={10 * 30}>
        <AnimationClosingCard accent={accent} />
      </Sequence>

      {/* Film grain overlay */}
      <AbsoluteFill
        style={{ mixBlendMode: "overlay", opacity: 0.1, pointerEvents: "none" }}
      >
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 200 200"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <filter id="film-grain" x="0" y="0" width="100%" height="100%">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.75"
                numOctaves="2"
                stitchTiles="stitch"
              />
            </filter>
          </defs>
          <rect width="200" height="200" filter="url(#film-grain)" opacity="0.2" />
        </svg>
      </AbsoluteFill>

      {/* Global fade-in */}
      <AbsoluteFill
        style={{
          backgroundColor: "#0a0a0f",
          opacity: 1 - fade(0, 15),
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};
