import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export const ClassicTitleCard: React.FC<{ accentWarm: string }> = ({
  accentWarm,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleSpring = spring({
    fps,
    frame,
    config: { damping: 25, mass: 1.2, stiffness: 80 },
  });

  const subtitleOpacity = interpolate(frame, [20, 40], [0, 1], {
    extrapolateRight: "clamp",
  });

  const subtitleY = interpolate(frame, [20, 45], [15, 0], {
    extrapolateRight: "clamp",
  });

  const ornamentOpacity = interpolate(frame, [35, 50], [0, 1], {
    extrapolateRight: "clamp",
  });

  const yearOpacity = interpolate(frame, [50, 65], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Decorative ornament
  const Ornament: React.FC<{ flip?: boolean }> = ({ flip }) => (
    <svg
      width="120"
      height="30"
      viewBox="0 0 120 30"
      style={{ transform: flip ? "scaleX(-1)" : undefined }}
    >
      <path
        d="M10 15 Q30 5 50 15 Q70 25 90 15 Q100 10 110 15"
        fill="none"
        stroke={accentWarm}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="10" cy="15" r="4" fill={accentWarm} />
      <circle cx="50" cy="15" r="3" fill={accentWarm} opacity="0.6" />
      <circle cx="90" cy="15" r="3" fill={accentWarm} opacity="0.6" />
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
        }}
      >
        {/* Decorative top border */}
        <div
          style={{
            opacity: ornamentOpacity,
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            gap: 20,
          }}
        >
          <Ornament flip />
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: accentWarm,
              boxShadow: `0 0 10px ${accentWarm}40`,
            }}
          />
          <Ornament />
        </div>

        {/* "Walt Disney Presents" style header */}
        <div
          style={{
            fontSize: 18,
            fontStyle: "italic",
            color: "#5c4a32",
            letterSpacing: 4,
            textTransform: "uppercase",
            opacity: subtitleOpacity,
            marginBottom: 12,
          }}
        >
          A Study in Motion
        </div>

        {/* Main Title */}
        <div
          style={{
            transform: `scale(${0.8 + titleSpring * 0.2})`,
            opacity: titleSpring,
          }}
        >
          <div
            style={{
              fontSize: 72,
              fontWeight: 400,
              fontFamily: "Georgia, 'Times New Roman', serif",
              lineHeight: 1.1,
              color: "#2c1810",
              textShadow: "2px 2px 0 rgba(255,250,240,0.8)",
            }}
          >
            The Twelve Principles
          </div>
          <div
            style={{
              fontSize: 52,
              fontWeight: 400,
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontStyle: "italic",
              color: "#3d2817",
              marginTop: 8,
            }}
          >
            of Animation
          </div>
        </div>

        {/* Subtitle */}
        <div
          style={{
            marginTop: 30,
            opacity: subtitleOpacity,
            transform: `translateY(${subtitleY}px)`,
          }}
        >
          <div
            style={{
              fontSize: 20,
              color: "#5c4a32",
              fontStyle: "italic",
              fontFamily: "Georgia, 'Times New Roman', serif",
              lineHeight: 1.6,
            }}
          >
            "The fundamental techniques that give animation
            <br />
            the illusion of life"
          </div>
        </div>

        {/* Authors attribution */}
        <div
          style={{
            marginTop: 40,
            opacity: yearOpacity,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
          }}
        >
          <div
            style={{
              width: 60,
              height: 1,
              background: `linear-gradient(90deg, transparent, ${accentWarm}, transparent)`,
            }}
          />
          <div
            style={{
              fontSize: 14,
              color: "#6b5a42",
              letterSpacing: 2,
              textTransform: "uppercase",
            }}
          >
            As taught by
          </div>
          <div
            style={{
              fontSize: 22,
              fontFamily: "Georgia, 'Times New Roman', serif",
              color: "#3d2817",
              fontWeight: 500,
            }}
          >
            Frank Thomas & Ollie Johnston
          </div>
          <div
            style={{
              fontSize: 15,
              color: "#7a6952",
              fontStyle: "italic",
            }}
          >
            Disney's Nine Old Men
          </div>
        </div>

        {/* Decorative bottom border */}
        <div
          style={{
            opacity: ornamentOpacity,
            marginTop: 30,
            display: "flex",
            alignItems: "center",
            gap: 20,
          }}
        >
          <Ornament flip />
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: accentWarm,
              boxShadow: `0 0 10px ${accentWarm}40`,
            }}
          />
          <Ornament />
        </div>
      </div>
    </AbsoluteFill>
  );
};
