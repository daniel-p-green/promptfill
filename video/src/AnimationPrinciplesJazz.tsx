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
  amber: string;
  cream: string;
  brown: string;
  warmBlack: string;
};

// The 12 principles with clear, concise explanations
const PRINCIPLES = [
  {
    number: 1,
    name: "Squash & Stretch",
    explanation: "Objects deform when they move. A ball flattens on impact and stretches in the air. This creates the illusion of weight and flexibility—the most important principle of all.",
    keyPoint: "Volume stays constant: wider = shorter, taller = thinner",
  },
  {
    number: 2,
    name: "Anticipation",
    explanation: "Every action has a wind-up. Before jumping, we crouch. Before throwing, we pull back. This tells the audience something is about to happen and makes the action feel powerful.",
    keyPoint: "The bigger the action, the bigger the wind-up",
  },
  {
    number: 3,
    name: "Staging",
    explanation: "Present one idea at a time, clearly. Use composition to direct the eye. If the audience doesn't instantly understand what's happening, the staging has failed.",
    keyPoint: "If it reads in silhouette, your staging works",
  },
  {
    number: 4,
    name: "Straight Ahead & Pose to Pose",
    explanation: "Two ways to animate. Straight Ahead: draw frame-by-frame for fluid, spontaneous motion. Pose to Pose: plan key frames first for control. Most animators blend both.",
    keyPoint: "Pose to Pose for acting, Straight Ahead for action",
  },
  {
    number: 5,
    name: "Follow Through",
    explanation: "Nothing stops all at once. When a character stops, their hair keeps swinging, clothes keep settling, arms trail behind. Different parts move at different rates.",
    keyPoint: "Loose parts drag behind, overshoot, then settle",
  },
  {
    number: 6,
    name: "Slow In & Slow Out",
    explanation: "Objects accelerate and decelerate—they don't move at constant speed. More drawings at the start and end of a movement, fewer in the middle where speed peaks.",
    keyPoint: "This is why 'easing' exists in all animation software",
  },
  {
    number: 7,
    name: "Arcs",
    explanation: "Living things move in curves, not straight lines. Arms swing in arcs. Heads turn in arcs. Straight movement looks robotic—arcs feel natural and alive.",
    keyPoint: "Track the path of action. Find the hidden curve.",
  },
  {
    number: 8,
    name: "Secondary Action",
    explanation: "Supporting movements that enrich without distracting. A character walks (primary) while whistling and swinging arms (secondary). These add personality and depth.",
    keyPoint: "Secondary actions support, never compete",
  },
  {
    number: 9,
    name: "Timing",
    explanation: "The number of frames determines how an action feels. Fast movement = light. Slow movement = heavy. Timing conveys weight, mood, and personality. Change the timing, change everything.",
    keyPoint: "Timing is the soul of animation",
  },
  {
    number: 10,
    name: "Exaggeration",
    explanation: "Animation isn't copying reality—it's amplifying truth. Push poses and expressions further than life. Subtlety often reads as nothing on screen. Find the essence, then push it.",
    keyPoint: "If it feels too much, it's probably just right",
  },
  {
    number: 11,
    name: "Solid Drawing",
    explanation: "Understand three-dimensional form, weight, and balance. Characters must feel like they exist in real space with actual mass. Avoid symmetrical poses—they feel lifeless.",
    keyPoint: "Draw through forms. Know where the far side is.",
  },
  {
    number: 12,
    name: "Appeal",
    explanation: "Characters must be compelling to watch—heroes, villains, everyone. This isn't about beauty; it's about clear design, dynamic shapes, and personality that draws us in.",
    keyPoint: "Vary shapes: curves vs straights, big vs small",
  },
];

// Continuous music staff that runs through the entire video
const MusicStaff: React.FC<{
  amber: string;
  opacity?: number;
  yOffset?: number;
}> = ({ amber, opacity = 0.4, yOffset = 0 }) => {
  const frame = useCurrentFrame();
  // Gentle wave animation
  const wave = Math.sin(frame * 0.015) * 3;

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: 320 + yOffset + wave,
        display: "flex",
        flexDirection: "column",
        gap: 14,
        opacity,
        pointerEvents: "none",
      }}
    >
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          style={{
            height: 2,
            background: `linear-gradient(90deg, transparent 0%, ${amber} 10%, ${amber} 90%, transparent 100%)`,
            transform: `translateY(${Math.sin(frame * 0.02 + i * 0.5) * 2}px)`,
          }}
        />
      ))}
    </div>
  );
};

// Floating musical notes that drift across the screen
const FloatingNotes: React.FC<{ amber: string; cream: string }> = ({
  amber,
  cream,
}) => {
  const frame = useCurrentFrame();

  const notes = [
    { x: 0.1, y: 0.2, speed: 0.3, size: 24, delay: 0 },
    { x: 0.85, y: 0.7, speed: 0.25, size: 20, delay: 100 },
    { x: 0.15, y: 0.75, speed: 0.35, size: 18, delay: 200 },
    { x: 0.9, y: 0.25, speed: 0.28, size: 22, delay: 150 },
    { x: 0.5, y: 0.15, speed: 0.32, size: 16, delay: 50 },
  ];

  return (
    <AbsoluteFill style={{ pointerEvents: "none", overflow: "hidden" }}>
      {notes.map((note, i) => {
        const activeFrame = frame - note.delay;
        if (activeFrame < 0) return null;

        const drift = (activeFrame * note.speed) % 100;
        const floatY = Math.sin(activeFrame * 0.03) * 20;
        const rotation = Math.sin(activeFrame * 0.02) * 15;
        const opacity = interpolate(
          activeFrame,
          [0, 30, 4000, 4100],
          [0, 0.3, 0.3, 0],
          { extrapolateRight: "clamp" }
        );

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${note.x * 100}%`,
              top: `${note.y * 100 + floatY / 10}%`,
              transform: `translateX(${drift}px) translateY(${floatY}px) rotate(${rotation}deg)`,
              fontSize: note.size,
              color: i % 2 === 0 ? amber : cream,
              opacity,
              fontFamily: "serif",
            }}
          >
            ♪
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// Warm vignette overlay
const WarmVignette: React.FC<{ brown: string }> = ({ brown }) => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(ellipse 80% 70% at 50% 50%, transparent 30%, ${brown}40 100%)`,
      pointerEvents: "none",
    }}
  />
);

export const AnimationPrinciplesJazz: React.FC<AnimationPrinciplesJazzProps> = ({
  amber,
  cream,
  brown,
  warmBlack,
}) => {
  const frame = useCurrentFrame();

  // Timing: ~2:30 (150 seconds) at 30fps = 4500 frames
  // Title: 12 seconds (360 frames)
  // Each principle: 10.5 seconds (315 frames) × 12 = 126 seconds (3780 frames)
  // Closing: 12 seconds (360 frames)
  const TITLE_DURATION = 12 * 30;
  const PRINCIPLE_DURATION = 10.5 * 30;
  const CLOSING_DURATION = 12 * 30;

  // Global fade in
  const fadeIn = interpolate(frame, [0, 45], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Staff fades in and persists
  const staffOpacity = interpolate(
    frame,
    [60, 120, 4400, 4500],
    [0, 0.35, 0.35, 0],
    { extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill style={{ backgroundColor: warmBlack }}>
      {/* Warm gradient background */}
      <AbsoluteFill
        style={{
          background: `
            radial-gradient(ellipse 100% 80% at 50% 100%, ${brown}30 0%, transparent 60%),
            radial-gradient(ellipse 80% 50% at 50% 0%, ${amber}15 0%, transparent 50%),
            linear-gradient(180deg, ${warmBlack} 0%, #1f1810 100%)
          `,
        }}
      />

      {/* Continuous music staff - the unifying visual thread */}
      <MusicStaff amber={amber} opacity={staffOpacity} />

      {/* Floating musical notes */}
      <FloatingNotes amber={amber} cream={cream} />

      {/* Warm vignette */}
      <WarmVignette brown={brown} />

      {/* Title sequence: 0-12s */}
      <Sequence from={0} durationInFrames={TITLE_DURATION}>
        <JazzTitleCard
          amber={amber}
          cream={cream}
          brown={brown}
          warmBlack={warmBlack}
        />
      </Sequence>

      {/* Each Principle */}
      {PRINCIPLES.map((principle, index) => (
        <Sequence
          key={principle.number}
          from={TITLE_DURATION + index * PRINCIPLE_DURATION}
          durationInFrames={PRINCIPLE_DURATION}
        >
          <JazzPrincipleCard
            principle={principle}
            index={index}
            total={PRINCIPLES.length}
            amber={amber}
            cream={cream}
            brown={brown}
            warmBlack={warmBlack}
          />
        </Sequence>
      ))}

      {/* Closing sequence */}
      <Sequence
        from={TITLE_DURATION + PRINCIPLES.length * PRINCIPLE_DURATION}
        durationInFrames={CLOSING_DURATION}
      >
        <JazzClosingCard
          amber={amber}
          cream={cream}
          brown={brown}
          warmBlack={warmBlack}
        />
      </Sequence>

      {/* Global fade in from black */}
      <AbsoluteFill
        style={{
          backgroundColor: warmBlack,
          opacity: 1 - fadeIn,
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};
