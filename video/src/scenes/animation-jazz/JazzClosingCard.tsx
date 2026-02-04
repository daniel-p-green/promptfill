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
  amber: string;
  cream: string;
  brown: string;
  warmBlack: string;
};

export const JazzClosingCard: React.FC<JazzClosingCardProps> = ({
  amber,
  cream,
  brown,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const mainSpring = spring({
    fps,
    frame,
    config: { damping: 22, mass: 1 },
  });

  const quoteOpacity = interpolate(frame, [60, 100], [0, 1], {
    extrapolateRight: "clamp",
  });

  const bookOpacity = interpolate(frame, [130, 170], [0, 1], {
    extrapolateRight: "clamp",
  });

  const ctaOpacity = interpolate(frame, [200, 250], [0, 1], {
    extrapolateRight: "clamp",
  });

  const fadeOut = interpolate(frame, [320, 360], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Musical notes animation
  const notes = ["♩", "♪", "♫", "♬", "♪"];

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        opacity: fadeOut,
      }}
    >
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
        {/* Large 12 with musical notes */}
        <div style={{ position: "relative" }}>
          <div
            style={{
              fontSize: 140,
              fontWeight: 200,
              color: amber,
              lineHeight: 1,
            }}
          >
            12
          </div>
          {/* Floating notes around the number */}
          {notes.map((note, i) => {
            const delay = 30 + i * 20;
            const noteOpacity = interpolate(frame, [delay, delay + 30], [0, 0.6], {
              extrapolateRight: "clamp",
            });
            const noteY = Math.sin((frame - delay) * 0.04 + i) * 10;
            const positions = [
              { x: -80, y: -20 },
              { x: 80, y: -30 },
              { x: -60, y: 60 },
              { x: 70, y: 50 },
              { x: 0, y: -50 },
            ];
            return (
              <span
                key={i}
                style={{
                  position: "absolute",
                  left: `calc(50% + ${positions[i].x}px)`,
                  top: `calc(50% + ${positions[i].y + noteY}px)`,
                  fontSize: 24,
                  color: i % 2 === 0 ? amber : cream,
                  opacity: noteOpacity,
                }}
              >
                {note}
              </span>
            );
          })}
        </div>

        <div
          style={{
            fontSize: 36,
            letterSpacing: 8,
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
            width: interpolate(frame, [40, 80], [0, 280], {
              extrapolateRight: "clamp",
              easing: Easing.out(Easing.cubic),
            }),
            height: 2,
            background: `linear-gradient(90deg, transparent, ${amber}, transparent)`,
            margin: "35px 0",
          }}
        />

        {/* Quote */}
        <div style={{ opacity: quoteOpacity, maxWidth: 600, marginBottom: 40 }}>
          <p
            style={{
              fontSize: 22,
              color: cream,
              fontStyle: "italic",
              lineHeight: 1.7,
              margin: 0,
            }}
          >
            "You're not supposed to animate drawings.
            <br />
            You're supposed to animate feelings."
          </p>
          <p
            style={{
              marginTop: 20,
              fontSize: 14,
              color: amber,
              letterSpacing: 3,
              textTransform: "uppercase",
            }}
          >
            — Ollie Johnston
          </p>
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
          <p
            style={{
              fontSize: 12,
              letterSpacing: 4,
              color: `${cream}77`,
              textTransform: "uppercase",
              margin: 0,
            }}
          >
            From the masterwork
          </p>
          <p
            style={{
              fontSize: 28,
              color: cream,
              fontStyle: "italic",
              margin: 0,
            }}
          >
            "The Illusion of Life"
          </p>
          <p
            style={{
              fontSize: 16,
              color: `${cream}99`,
              margin: 0,
            }}
          >
            Frank Thomas & Ollie Johnston · 1981
          </p>
        </div>

        {/* CTA */}
        <div
          style={{
            opacity: ctaOpacity,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 18,
          }}
        >
          <div
            style={{
              background: amber,
              color: brown,
              padding: "18px 45px",
              borderRadius: 8,
              fontSize: 16,
              letterSpacing: 4,
              textTransform: "uppercase",
              fontWeight: 600,
            }}
          >
            Now Bring Life to Your Work
          </div>
          <p
            style={{
              fontSize: 14,
              color: `${cream}77`,
              fontStyle: "italic",
              margin: 0,
            }}
          >
            Practice each principle. Master the fundamentals.
          </p>
        </div>
      </div>

      {/* Fin */}
      <div
        style={{
          position: "absolute",
          bottom: 50,
          display: "flex",
          alignItems: "center",
          gap: 25,
          opacity: ctaOpacity,
        }}
      >
        <div
          style={{
            width: 60,
            height: 1,
            background: `linear-gradient(90deg, transparent, ${amber})`,
          }}
        />
        <span
          style={{
            fontSize: 14,
            letterSpacing: 6,
            color: `${cream}55`,
            textTransform: "uppercase",
          }}
        >
          Fin
        </span>
        <div
          style={{
            width: 60,
            height: 1,
            background: `linear-gradient(90deg, ${amber}, transparent)`,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
