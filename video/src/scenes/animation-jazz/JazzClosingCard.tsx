import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from "remotion";

type JazzClosingCardProps = {
  gold: string;
  cream: string;
  burgundy: string;
};

export const JazzClosingCard: React.FC<JazzClosingCardProps> = ({ gold, cream, burgundy }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const mainSpring = spring({
    fps,
    frame,
    config: { damping: 22, mass: 1 },
  });

  const quoteOpacity = interpolate(frame, [50, 90], [0, 1], {
    extrapolateRight: "clamp",
  });

  const bookOpacity = interpolate(frame, [110, 150], [0, 1], {
    extrapolateRight: "clamp",
  });

  const ctaOpacity = interpolate(frame, [170, 210], [0, 1], {
    extrapolateRight: "clamp",
  });

  const fadeOut = interpolate(frame, [270, 300], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: fadeOut }}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          transform: `scale(${0.92 + mainSpring * 0.08})`,
          opacity: mainSpring,
        }}
      >
        {/* Large 12 */}
        <div
          style={{
            fontSize: 130,
            fontWeight: 200,
            color: gold,
            lineHeight: 1,
            textShadow: `0 0 100px ${gold}35`,
          }}
        >
          12
        </div>

        <div
          style={{
            fontSize: 34,
            letterSpacing: 10,
            color: cream,
            textTransform: "uppercase",
            marginTop: -5,
          }}
        >
          Principles
        </div>

        {/* Divider */}
        <div
          style={{
            width: 250,
            height: 1,
            background: `linear-gradient(90deg, transparent, ${gold}, transparent)`,
            margin: "35px 0",
          }}
        />

        {/* Quote */}
        <div style={{ opacity: quoteOpacity, maxWidth: 550, marginBottom: 40 }}>
          <div style={{ fontSize: 19, color: `${cream}bb`, fontStyle: "italic", lineHeight: 1.7 }}>
            "You're not supposed to animate drawings.
            <br />
            You're supposed to animate feelings."
          </div>
          <div
            style={{
              marginTop: 18,
              fontSize: 12,
              color: gold,
              letterSpacing: 4,
              textTransform: "uppercase",
            }}
          >
            — Ollie Johnston
          </div>
        </div>

        {/* Book reference */}
        <div
          style={{
            opacity: bookOpacity,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
            marginBottom: 35,
          }}
        >
          <div style={{ fontSize: 11, letterSpacing: 5, color: `${cream}50`, textTransform: "uppercase" }}>
            From the Masterwork
          </div>
          <div style={{ fontSize: 26, color: cream, fontStyle: "italic" }}>
            "The Illusion of Life"
          </div>
          <div style={{ fontSize: 14, color: `${cream}70` }}>
            Frank Thomas & Ollie Johnston · 1981
          </div>
        </div>

        {/* CTA */}
        <div style={{ opacity: ctaOpacity, display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
          <div
            style={{
              background: `linear-gradient(135deg, ${gold}, ${burgundy})`,
              color: cream,
              padding: "16px 40px",
              borderRadius: 4,
              fontSize: 14,
              letterSpacing: 5,
              textTransform: "uppercase",
              fontWeight: 500,
              boxShadow: `0 12px 50px ${gold}25`,
            }}
          >
            Now Bring Life to Your Work
          </div>
          <div style={{ fontSize: 13, color: `${cream}50`, fontStyle: "italic" }}>
            Practice each principle. Master the fundamentals.
          </div>
        </div>
      </div>

      {/* Fin */}
      <div
        style={{
          position: "absolute",
          bottom: 45,
          display: "flex",
          alignItems: "center",
          gap: 25,
          opacity: ctaOpacity,
        }}
      >
        <div style={{ width: 50, height: 1, background: `linear-gradient(90deg, transparent, ${gold})` }} />
        <div style={{ fontSize: 12, letterSpacing: 8, color: `${cream}40`, textTransform: "uppercase" }}>
          Fin
        </div>
        <div style={{ width: 50, height: 1, background: `linear-gradient(90deg, ${gold}, transparent)` }} />
      </div>
    </AbsoluteFill>
  );
};
