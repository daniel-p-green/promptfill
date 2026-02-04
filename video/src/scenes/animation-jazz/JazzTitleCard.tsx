import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from "remotion";

type JazzTitleCardProps = {
  amber: string;
  cream: string;
  brown: string;
  warmBlack: string;
};

// Animated treble clef that draws itself
const TrebleClef: React.FC<{ amber: string; progress: number }> = ({
  amber,
  progress,
}) => (
  <svg width="80" height="120" viewBox="0 0 80 120" style={{ opacity: progress }}>
    <text
      x="40"
      y="90"
      fontSize="100"
      fill={amber}
      textAnchor="middle"
      fontFamily="serif"
      style={{
        transform: `scale(${0.8 + progress * 0.2})`,
        transformOrigin: "center",
      }}
    >
      𝄞
    </text>
  </svg>
);

// Musical notes that appear in sequence
const NoteSequence: React.FC<{ amber: string; cream: string; frame: number }> = ({
  amber,
  cream,
  frame,
}) => {
  const notes = ["♩", "♪", "♫", "♬"];
  return (
    <div style={{ display: "flex", gap: 20, justifyContent: "center" }}>
      {notes.map((note, i) => {
        const delay = 180 + i * 15;
        const opacity = interpolate(frame, [delay, delay + 20], [0, 1], {
          extrapolateRight: "clamp",
        });
        const y = interpolate(frame, [delay, delay + 20], [15, 0], {
          extrapolateRight: "clamp",
          easing: Easing.out(Easing.back(1.5)),
        });
        return (
          <span
            key={i}
            style={{
              fontSize: 28,
              color: i % 2 === 0 ? amber : cream,
              opacity,
              transform: `translateY(${y}px)`,
            }}
          >
            {note}
          </span>
        );
      })}
    </div>
  );
};

export const JazzTitleCard: React.FC<JazzTitleCardProps> = ({
  amber,
  cream,
  brown,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Staggered animations
  const clefProgress = interpolate(frame, [30, 80], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const titleSpring = spring({
    fps,
    frame: frame - 60,
    config: { damping: 18, mass: 1 },
  });

  const subtitleOpacity = interpolate(frame, [100, 130], [0, 1], {
    extrapolateRight: "clamp",
  });

  const attributionOpacity = interpolate(frame, [160, 200], [0, 1], {
    extrapolateRight: "clamp",
  });

  const dividerWidth = interpolate(frame, [130, 170], [0, 300], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const quoteOpacity = interpolate(frame, [220, 270], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Exit
  const exitOpacity = interpolate(frame, [320, 360], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        opacity: exitOpacity,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          maxWidth: 900,
        }}
      >
        {/* Treble clef */}
        <TrebleClef amber={amber} progress={clefProgress} />

        {/* Main title */}
        <div
          style={{
            transform: `translateY(${(1 - titleSpring) * 30}px)`,
            opacity: titleSpring,
            marginTop: -10,
          }}
        >
          <div
            style={{
              fontSize: 18,
              letterSpacing: 8,
              color: amber,
              textTransform: "uppercase",
              marginBottom: 15,
            }}
          >
            The
          </div>
          <h1
            style={{
              fontSize: 72,
              fontWeight: 400,
              color: cream,
              margin: 0,
              lineHeight: 1.1,
              letterSpacing: 2,
            }}
          >
            12 Principles
          </h1>
          <div
            style={{
              fontSize: 18,
              letterSpacing: 8,
              color: amber,
              textTransform: "uppercase",
              marginTop: 15,
            }}
          >
            of Animation
          </div>
        </div>

        {/* Animated divider line */}
        <div
          style={{
            width: dividerWidth,
            height: 2,
            background: `linear-gradient(90deg, transparent, ${amber}, transparent)`,
            margin: "35px 0",
          }}
        />

        {/* Note sequence */}
        <div style={{ opacity: subtitleOpacity, marginBottom: 30 }}>
          <NoteSequence amber={amber} cream={cream} frame={frame} />
        </div>

        {/* Attribution */}
        <div
          style={{
            opacity: attributionOpacity,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
          }}
        >
          <p
            style={{
              fontSize: 14,
              letterSpacing: 3,
              color: `${cream}99`,
              textTransform: "uppercase",
              margin: 0,
            }}
          >
            As defined by
          </p>
          <p
            style={{
              fontSize: 24,
              color: cream,
              fontStyle: "italic",
              margin: 0,
            }}
          >
            Frank Thomas & Ollie Johnston
          </p>
          <p
            style={{
              fontSize: 14,
              color: `${cream}77`,
              margin: 0,
            }}
          >
            Disney's Nine Old Men · 1981
          </p>
        </div>

        {/* Opening quote */}
        <div
          style={{
            marginTop: 45,
            opacity: quoteOpacity,
            maxWidth: 600,
          }}
        >
          <p
            style={{
              fontSize: 18,
              color: `${cream}bb`,
              fontStyle: "italic",
              lineHeight: 1.7,
              margin: 0,
            }}
          >
            "Animation is not the art of drawings that move,
            <br />
            but the art of movements that are drawn."
          </p>
          <p
            style={{
              fontSize: 13,
              color: amber,
              marginTop: 15,
              letterSpacing: 2,
            }}
          >
            — NORMAN MCLAREN
          </p>
        </div>
      </div>
    </AbsoluteFill>
  );
};
