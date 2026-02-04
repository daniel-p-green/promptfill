import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export const AnimationClosingCard: React.FC<{ accent: string }> = ({
  accent,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const mainSpring = spring({
    fps,
    frame,
    config: { damping: 18, mass: 0.9 },
  });

  const opacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });

  const subtitleSpring = spring({
    fps,
    frame: frame - 15,
    config: { damping: 16, mass: 0.8 },
  });

  const ctaOpacity = interpolate(frame, [30, 45], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Animated dots
  const dots = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        padding: 80,
      }}
    >
      {/* Animated circular dots */}
      <div
        style={{
          position: "absolute",
          width: 400,
          height: 400,
          opacity: opacity * 0.6,
        }}
      >
        {dots.map((i) => {
          const angle = (i / 12) * Math.PI * 2 + frame * 0.01;
          const radius = 180;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          const dotOpacity = interpolate(
            frame - i * 3,
            [0, 20],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );

          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: accent,
                opacity: dotOpacity * 0.7,
                transform: `translate(${x - 4}px, ${y - 4}px)`,
                boxShadow: `0 0 15px ${accent}`,
              }}
            />
          );
        })}
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          transform: `translateY(${(1 - mainSpring) * 30}px)`,
          opacity,
          zIndex: 1,
        }}
      >
        {/* Large number */}
        <div
          style={{
            fontSize: 120,
            fontWeight: 800,
            lineHeight: 1,
            background: `linear-gradient(180deg, ${accent}, ${accent}88)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            marginBottom: 16,
          }}
        >
          12
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 48,
            fontWeight: 700,
            color: "white",
            letterSpacing: -1,
            marginBottom: 16,
          }}
        >
          Principles
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 22,
            color: "rgba(255,255,255,0.6)",
            maxWidth: 500,
            lineHeight: 1.5,
            transform: `translateY(${(1 - subtitleSpring) * 15}px)`,
            opacity: subtitleSpring,
          }}
        >
          Master these fundamentals to create
          <br />
          animations that feel alive
        </div>

        {/* CTA Pill */}
        <div
          style={{
            marginTop: 40,
            display: "flex",
            alignItems: "center",
            gap: 12,
            opacity: ctaOpacity,
          }}
        >
          <div
            style={{
              background: accent,
              color: "#0a0a0f",
              fontWeight: 600,
              padding: "14px 24px",
              borderRadius: 999,
              fontSize: 16,
              boxShadow: `0 8px 30px ${accent}40`,
            }}
          >
            Start Animating
          </div>
          <div
            style={{
              color: "rgba(255,255,255,0.5)",
              fontSize: 14,
            }}
          >
            Practice makes perfect
          </div>
        </div>

        {/* Source attribution */}
        <div
          style={{
            marginTop: 40,
            fontSize: 13,
            color: "rgba(255,255,255,0.35)",
            opacity: ctaOpacity,
          }}
        >
          Based on "The Illusion of Life" by Frank Thomas & Ollie Johnston
        </div>
      </div>
    </AbsoluteFill>
  );
};
