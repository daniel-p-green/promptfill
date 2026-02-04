import React from "react";
import {
  AbsoluteFill,
  Sequence,
  interpolate,
  useCurrentFrame,
  Easing,
} from "remotion";
import { JazzTitleCard } from "./scenes/animation-jazz/JazzTitleCard";
import { JazzPrincipleCard } from "./scenes/animation-jazz/JazzPrincipleCard";
import { JazzClosingCard } from "./scenes/animation-jazz/JazzClosingCard";

export type AnimationPrinciplesJazzProps = {
  gold: string;
  cream: string;
  burgundy: string;
};

// Each principle with clear, digestible explanation
const PRINCIPLES = [
  {
    number: 1,
    name: "Squash & Stretch",
    subtitle: "The Illusion of Weight",
    lines: [
      "When objects move, they deform.",
      "A ball flattens on impact, stretches as it rises.",
      "This single principle gives life to everything.",
    ],
    tip: "Keep the volume constant—wider means shorter, taller means thinner.",
  },
  {
    number: 2,
    name: "Anticipation",
    subtitle: "The Wind-Up",
    lines: [
      "Before any action, there's a preparation.",
      "A pitcher winds up. A cat crouches before pouncing.",
      "It tells the audience: something is about to happen.",
    ],
    tip: "Bigger action = bigger wind-up. The anticipation sells the motion.",
  },
  {
    number: 3,
    name: "Staging",
    subtitle: "Clarity Above All",
    lines: [
      "Present your idea so it cannot be missed.",
      "Use composition to direct the eye.",
      "One clear idea at a time. If it's confusing, it's failed.",
    ],
    tip: "The silhouette test—if the pose reads in silhouette, your staging works.",
  },
  {
    number: 4,
    name: "Straight Ahead & Pose to Pose",
    subtitle: "Two Paths to Movement",
    lines: [
      "Straight Ahead: draw frame by frame, start to finish.",
      "Pose to Pose: plan key poses, fill in between.",
      "Most animators blend both methods.",
    ],
    tip: "Pose to Pose for control. Straight Ahead for wild energy.",
  },
  {
    number: 5,
    name: "Follow Through & Overlapping",
    subtitle: "Nothing Stops All at Once",
    lines: [
      "When a character stops, parts keep moving.",
      "Hair swings. Clothes settle. Arms trail behind.",
      "Different parts move at different rates.",
    ],
    tip: "Loose elements drag behind, then overshoot, then settle.",
  },
  {
    number: 6,
    name: "Slow In & Slow Out",
    subtitle: "The Art of Easing",
    lines: [
      "Objects accelerate from rest, decelerate to stop.",
      "More drawings at the start and end of an action.",
      "Fewer in the middle where speed peaks.",
    ],
    tip: "Extreme easing = heavy and deliberate. Subtle easing = light and quick.",
  },
  {
    number: 7,
    name: "Arcs",
    subtitle: "The Natural Path",
    lines: [
      "Living things move in curves, not straight lines.",
      "Arms swing in arcs. Heads turn in arcs.",
      "Straight motion feels mechanical. Arcs feel alive.",
    ],
    tip: "Track every moving element. Find the hidden arc.",
  },
  {
    number: 8,
    name: "Secondary Action",
    subtitle: "The Supporting Details",
    lines: [
      "Actions that enrich without distracting.",
      "A character walks while whistling, swinging their arms.",
      "These details add depth and personality.",
    ],
    tip: "Secondary actions complement—they never compete with the main action.",
  },
  {
    number: 9,
    name: "Timing",
    subtitle: "The Soul of Animation",
    lines: [
      "Speed determines weight, mood, and meaning.",
      "Heavy things move slowly. Light things move quickly.",
      "Change the timing, change everything.",
    ],
    tip: "Timing is personality. A nervous character and a confident one move differently.",
  },
  {
    number: 10,
    name: "Exaggeration",
    subtitle: "Push the Truth",
    lines: [
      "Animation isn't copying reality—it's amplifying it.",
      "Push poses, expressions, timing further.",
      "Subtlety in animation often reads as nothing.",
    ],
    tip: "Find the truth first, then push it until it sings.",
  },
  {
    number: 11,
    name: "Solid Drawing",
    subtitle: "Form, Weight & Volume",
    lines: [
      "Understand three-dimensional space.",
      "Characters must feel like they have real mass.",
      "Avoid 'twins'—symmetrical poses feel lifeless.",
    ],
    tip: "Draw through your forms. Know where the far side is.",
  },
  {
    number: 12,
    name: "Appeal",
    subtitle: "The Magic That Draws Us In",
    lines: [
      "Characters must be compelling to watch.",
      "Clear design. Dynamic shapes. Personality.",
      "This is the animator's charisma on screen.",
    ],
    tip: "Vary your shapes. Curves against straights. Large against small.",
  },
];

// Subtle Art Deco corner accents
const ArtDecoCorners: React.FC<{ gold: string; opacity: number }> = ({
  gold,
  opacity,
}) => (
  <AbsoluteFill style={{ pointerEvents: "none", opacity }}>
    {/* Top left */}
    <svg
      width="60"
      height="60"
      style={{ position: "absolute", top: 25, left: 25 }}
    >
      <path
        d="M0 50 L0 0 L50 0"
        fill="none"
        stroke={gold}
        strokeWidth="2"
        opacity="0.6"
      />
      <path
        d="M0 35 L0 15 L15 15 L15 0"
        fill="none"
        stroke={gold}
        strokeWidth="1"
        opacity="0.3"
      />
    </svg>
    {/* Top right */}
    <svg
      width="60"
      height="60"
      style={{ position: "absolute", top: 25, right: 25 }}
    >
      <path
        d="M60 50 L60 0 L10 0"
        fill="none"
        stroke={gold}
        strokeWidth="2"
        opacity="0.6"
      />
      <path
        d="M60 35 L60 15 L45 15 L45 0"
        fill="none"
        stroke={gold}
        strokeWidth="1"
        opacity="0.3"
      />
    </svg>
    {/* Bottom left */}
    <svg
      width="60"
      height="60"
      style={{ position: "absolute", bottom: 25, left: 25 }}
    >
      <path
        d="M0 10 L0 60 L50 60"
        fill="none"
        stroke={gold}
        strokeWidth="2"
        opacity="0.6"
      />
    </svg>
    {/* Bottom right */}
    <svg
      width="60"
      height="60"
      style={{ position: "absolute", bottom: 25, right: 25 }}
    >
      <path
        d="M60 10 L60 60 L10 60"
        fill="none"
        stroke={gold}
        strokeWidth="2"
        opacity="0.6"
      />
    </svg>
  </AbsoluteFill>
);

// Smoky atmosphere - subtle, classy
const SmokyAtmosphere: React.FC = () => {
  const frame = useCurrentFrame();
  const drift1 = Math.sin(frame * 0.006) * 30;
  const drift2 = Math.cos(frame * 0.004) * 20;

  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity: 0.08 }}>
      <div
        style={{
          position: "absolute",
          top: "20%",
          left: `${30 + drift1}%`,
          width: 600,
          height: 300,
          background:
            "radial-gradient(ellipse, rgba(255,255,255,0.5), transparent 70%)",
          filter: "blur(80px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: `${50 + drift2}%`,
          width: 400,
          height: 200,
          background:
            "radial-gradient(ellipse, rgba(255,255,255,0.4), transparent 70%)",
          filter: "blur(60px)",
        }}
      />
    </AbsoluteFill>
  );
};

export const AnimationPrinciplesJazz: React.FC<AnimationPrinciplesJazzProps> = ({
  gold,
  cream,
  burgundy,
}) => {
  const frame = useCurrentFrame();

  // Timing: ~2:20 (140 seconds) at 30fps = 4200 frames
  // Title: 10 seconds (300 frames)
  // Each principle: 10 seconds (300 frames) × 12 = 120 seconds (3600 frames)
  // Closing: 10 seconds (300 frames)
  // Total: 140 seconds (4200 frames)
  const TITLE_DURATION = 10 * 30;
  const PRINCIPLE_DURATION = 10 * 30;
  const CLOSING_DURATION = 10 * 30;

  const globalFadeIn = interpolate(frame, [0, 45], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const cornersOpacity = interpolate(frame, [30, 60], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#080d14" }}>
      {/* Deep KC night sky gradient */}
      <AbsoluteFill
        style={{
          background: `
            radial-gradient(ellipse 120% 80% at 50% 120%, #1a2332 0%, transparent 70%),
            linear-gradient(180deg, #0a1019 0%, #101820 50%, #0d151f 100%)
          `,
        }}
      />

      {/* Warm spotlight glow from above - like stage lighting */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 50% 35% at 50% -5%, ${gold}12, transparent 70%)`,
        }}
      />

      {/* Smoky atmosphere */}
      <SmokyAtmosphere />

      {/* Art Deco corner accents */}
      <ArtDecoCorners gold={gold} opacity={cornersOpacity} />

      {/* Title Card: 0-10s */}
      <Sequence from={0} durationInFrames={TITLE_DURATION}>
        <JazzTitleCard gold={gold} cream={cream} burgundy={burgundy} />
      </Sequence>

      {/* Each Principle: 10s each */}
      {PRINCIPLES.map((principle, index) => (
        <Sequence
          key={principle.number}
          from={TITLE_DURATION + index * PRINCIPLE_DURATION}
          durationInFrames={PRINCIPLE_DURATION}
        >
          <JazzPrincipleCard
            principle={principle}
            gold={gold}
            cream={cream}
            burgundy={burgundy}
            totalPrinciples={PRINCIPLES.length}
          />
        </Sequence>
      ))}

      {/* Closing Card: last 10s */}
      <Sequence
        from={TITLE_DURATION + PRINCIPLES.length * PRINCIPLE_DURATION}
        durationInFrames={CLOSING_DURATION}
      >
        <JazzClosingCard gold={gold} cream={cream} burgundy={burgundy} />
      </Sequence>

      {/* Global fade in from black */}
      <AbsoluteFill
        style={{
          backgroundColor: "#050508",
          opacity: 1 - globalFadeIn,
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};
