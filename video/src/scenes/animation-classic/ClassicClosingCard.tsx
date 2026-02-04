import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export const ClassicClosingCard: React.FC<{ accentWarm: string }> = ({
  accentWarm,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const mainSpring = spring({
    fps,
    frame,
    config: { damping: 22, mass: 1 },
  });

  const quoteOpacity = interpolate(frame, [30, 50], [0, 1], {
    extrapolateRight: "clamp",
  });

  const bookOpacity = interpolate(frame, [60, 80], [0, 1], {
    extrapolateRight: "clamp",
  });

  const finalOpacity = interpolate(frame, [100, 120], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Decorative flourish
  const Flourish: React.FC = () => (
    <svg width="200" height="40" viewBox="0 0 200 40">
      <path
        d="M20 20 Q50 5 80 20 Q100 30 100 20 Q100 10 120 20 Q150 35 180 20"
        fill="none"
        stroke={accentWarm}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="100" cy="20" r="4" fill={accentWarm} />
      <circle cx="20" cy="20" r="2" fill={accentWarm} />
      <circle cx="180" cy="20" r="2" fill={accentWarm} />
    </svg>
  );

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        padding: 60,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          transform: `scale(${0.9 + mainSpring * 0.1})`,
          opacity: mainSpring,
        }}
      >
        {/* Top flourish */}
        <div style={{ marginBottom: 25 }}>
          <Flourish />
        </div>

        {/* Main title */}
        <div
          style={{
            fontSize: 52,
            fontFamily: "Georgia, 'Times New Roman', serif",
            color: "#2c1810",
            fontWeight: 400,
            lineHeight: 1.2,
          }}
        >
          The Twelve Principles
        </div>
        <div
          style={{
            fontSize: 36,
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontStyle: "italic",
            color: "#3d2817",
            marginTop: 8,
          }}
        >
          of Animation
        </div>

        {/* Quote */}
        <div
          style={{
            marginTop: 35,
            maxWidth: 600,
            opacity: quoteOpacity,
          }}
        >
          <div
            style={{
              fontSize: 20,
              fontStyle: "italic",
              color: "#5c4a32",
              fontFamily: "Georgia, 'Times New Roman', serif",
              lineHeight: 1.6,
            }}
          >
            "Animation offers a medium of storytelling
            <br />
            and visual entertainment which can bring
            <br />
            pleasure and information to people of all ages."
          </div>
          <div
            style={{
              marginTop: 15,
              fontSize: 14,
              color: "#7a6952",
            }}
          >
            — Walt Disney
          </div>
        </div>

        {/* Book reference */}
        <div
          style={{
            marginTop: 40,
            opacity: bookOpacity,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              width: 100,
              height: 1,
              background: `linear-gradient(90deg, transparent, ${accentWarm}, transparent)`,
            }}
          />
          <div
            style={{
              fontSize: 13,
              color: "#6b5a42",
              letterSpacing: 2,
              textTransform: "uppercase",
            }}
          >
            From the Book
          </div>
          <div
            style={{
              fontSize: 22,
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontStyle: "italic",
              color: "#2c1810",
            }}
          >
            "The Illusion of Life"
          </div>
          <div
            style={{
              fontSize: 15,
              color: "#5c4a32",
            }}
          >
            by Frank Thomas & Ollie Johnston
          </div>
          <div
            style={{
              fontSize: 13,
              color: "#8a7a62",
              fontStyle: "italic",
            }}
          >
            First published 1981
          </div>
        </div>

        {/* Closing message */}
        <div
          style={{
            marginTop: 35,
            opacity: finalOpacity,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div
            style={{
              background: accentWarm,
              color: "#fff8f0",
              fontFamily: "Georgia, 'Times New Roman', serif",
              padding: "12px 28px",
              borderRadius: 4,
              fontSize: 16,
              fontWeight: 500,
              boxShadow: `0 4px 15px ${accentWarm}40`,
            }}
          >
            Now Go Create Magic
          </div>
        </div>

        {/* Bottom flourish */}
        <div style={{ marginTop: 30 }}>
          <Flourish />
        </div>

        {/* The End */}
        <div
          style={{
            marginTop: 20,
            fontSize: 18,
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontStyle: "italic",
            color: "#7a6952",
            opacity: finalOpacity,
          }}
        >
          — The End —
        </div>
      </div>
    </AbsoluteFill>
  );
};
