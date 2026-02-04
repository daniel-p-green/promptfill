import React from "react";
import {
  AbsoluteFill,
  Sequence,
  interpolate,
  useCurrentFrame,
  random,
} from "remotion";
import { ClassicTitleCard } from "./scenes/animation-classic/ClassicTitleCard";
import { ClassicPrinciplesOverview } from "./scenes/animation-classic/ClassicPrinciplesOverview";
import { ClassicPrincipleShowcase } from "./scenes/animation-classic/ClassicPrincipleShowcase";
import { ClassicClosingCard } from "./scenes/animation-classic/ClassicClosingCard";

export type AnimationPrinciplesClassicProps = {
  accentWarm: string;
  accentCool: string;
};

const PRINCIPLES = [
  {
    number: 1,
    name: "Squash & Stretch",
    description: "The most important principle—gives a sense of weight and flexibility",
  },
  {
    number: 2,
    name: "Anticipation",
    description: "Prepares the audience for an action before it occurs",
  },
  {
    number: 3,
    name: "Staging",
    description: "Presenting an idea so it is unmistakably clear",
  },
  {
    number: 4,
    name: "Straight Ahead & Pose to Pose",
    description: "Two different approaches to the drawing process",
  },
  {
    number: 5,
    name: "Follow Through & Overlapping Action",
    description: "Nothing stops all at once—parts continue to move",
  },
  {
    number: 6,
    name: "Slow In & Slow Out",
    description: "The spacing of in-betweens to achieve subtlety of timing",
  },
  {
    number: 7,
    name: "Arcs",
    description: "Natural actions follow an arched trajectory",
  },
  {
    number: 8,
    name: "Secondary Action",
    description: "Actions that support and enrich the main action",
  },
  {
    number: 9,
    name: "Timing",
    description: "The number of drawings for an action determines speed",
  },
  {
    number: 10,
    name: "Exaggeration",
    description: "Pushing the essence of an idea to make it more convincing",
  },
  {
    number: 11,
    name: "Solid Drawing",
    description: "Taking into account form, weight, volume, and anatomy",
  },
  {
    number: 12,
    name: "Appeal",
    description: "The charisma that makes a character pleasing to watch",
  },
];

// Film flicker effect component
const FilmFlicker: React.FC = () => {
  const frame = useCurrentFrame();
  const flicker = random(`flicker-${frame}`) * 0.08;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: `rgba(0,0,0,${flicker})`,
        pointerEvents: "none",
      }}
    />
  );
};

// Vintage film scratches
const FilmScratches: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity: 0.3 }}>
      {[...Array(3)].map((_, i) => {
        const x = random(`scratch-x-${frame}-${i}`) * 100;
        const show = random(`scratch-show-${frame}-${i}`) > 0.92;
        if (!show) return null;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${x}%`,
              top: 0,
              width: 1,
              height: "100%",
              background:
                "linear-gradient(180deg, transparent, rgba(255,250,240,0.6) 20%, rgba(255,250,240,0.6) 80%, transparent)",
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// Sprocket holes on film edge
const SprocketHoles: React.FC = () => {
  const frame = useCurrentFrame();
  const offset = (frame * 2) % 40;

  return (
    <>
      {/* Left sprocket strip */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 35,
          height: "100%",
          background: "#1a1409",
          zIndex: 10,
        }}
      >
        {[...Array(25)].map((_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 10,
              top: i * 40 - offset,
              width: 15,
              height: 22,
              borderRadius: 3,
              background: "#0a0805",
              border: "1px solid #2a2419",
            }}
          />
        ))}
      </div>
      {/* Right sprocket strip */}
      <div
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          width: 35,
          height: "100%",
          background: "#1a1409",
          zIndex: 10,
        }}
      >
        {[...Array(25)].map((_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              right: 10,
              top: i * 40 - offset,
              width: 15,
              height: 22,
              borderRadius: 3,
              background: "#0a0805",
              border: "1px solid #2a2419",
            }}
          />
        ))}
      </div>
    </>
  );
};

export const AnimationPrinciplesClassic: React.FC<
  AnimationPrinciplesClassicProps
> = ({ accentWarm, accentCool }) => {
  const frame = useCurrentFrame();
  const fade = (start: number, end: number) =>
    interpolate(frame, [start, end], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

  return (
    <AbsoluteFill style={{ backgroundColor: "#1a1409" }}>
      {/* Sprocket holes */}
      <SprocketHoles />

      {/* Main content area (between sprockets) */}
      <AbsoluteFill style={{ left: 35, right: 35, width: "auto" }}>
        {/* Warm paper background */}
        <AbsoluteFill
          style={{
            background:
              "linear-gradient(180deg, #f5e6c8 0%, #e8d4a8 50%, #dcc896 100%)",
          }}
        />

        {/* Paper texture overlay */}
        <AbsoluteFill
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Cfilter id='paper'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.04' numOctaves='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23paper)' opacity='0.08'/%3E%3C/svg%3E")`,
            mixBlendMode: "multiply",
            opacity: 0.5,
          }}
        />

        {/* Aged vignette */}
        <AbsoluteFill
          style={{
            background:
              "radial-gradient(ellipse 90% 70% at 50% 50%, transparent 40%, rgba(139,90,43,0.25) 100%)",
          }}
        />

        {/* 0–6s: Title Card */}
        <Sequence from={0} durationInFrames={6 * 30}>
          <ClassicTitleCard accentWarm={accentWarm} />
        </Sequence>

        {/* 6–15s: Overview */}
        <Sequence from={6 * 30} durationInFrames={9 * 30}>
          <ClassicPrinciplesOverview
            principles={PRINCIPLES}
            accentWarm={accentWarm}
          />
        </Sequence>

        {/* 15–27s: First 4 principles */}
        <Sequence from={15 * 30} durationInFrames={12 * 30}>
          <ClassicPrincipleShowcase
            principles={PRINCIPLES.slice(0, 4)}
            accentWarm={accentWarm}
            accentCool={accentCool}
            chapterNum="I"
          />
        </Sequence>

        {/* 27–39s: Middle 4 principles */}
        <Sequence from={27 * 30} durationInFrames={12 * 30}>
          <ClassicPrincipleShowcase
            principles={PRINCIPLES.slice(4, 8)}
            accentWarm={accentWarm}
            accentCool={accentCool}
            chapterNum="II"
          />
        </Sequence>

        {/* 39–51s: Last 4 principles */}
        <Sequence from={39 * 30} durationInFrames={12 * 30}>
          <ClassicPrincipleShowcase
            principles={PRINCIPLES.slice(8, 12)}
            accentWarm={accentWarm}
            accentCool={accentCool}
            chapterNum="III"
          />
        </Sequence>

        {/* 51–60s: Closing */}
        <Sequence from={51 * 30} durationInFrames={9 * 30}>
          <ClassicClosingCard accentWarm={accentWarm} />
        </Sequence>

        {/* Film scratches */}
        <FilmScratches />

        {/* Film flicker */}
        <FilmFlicker />

        {/* Sepia color grade */}
        <AbsoluteFill
          style={{
            background:
              "linear-gradient(180deg, rgba(180,140,80,0.08), rgba(120,80,40,0.12))",
            mixBlendMode: "color",
            pointerEvents: "none",
          }}
        />
      </AbsoluteFill>

      {/* Global fade-in */}
      <AbsoluteFill
        style={{
          backgroundColor: "#1a1409",
          opacity: 1 - fade(0, 20),
          pointerEvents: "none",
        }}
      />

      {/* Global fade-out */}
      <AbsoluteFill
        style={{
          backgroundColor: "#1a1409",
          opacity: fade(60 * 30 - 20, 60 * 30),
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};
