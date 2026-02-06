import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export const AnimationTitleCard: React.FC<{ accent: string }> = ({
  accent,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleSpring = spring({
    fps,
    frame,
    config: { damping: 20, mass: 0.8, stiffness: 100 },
  });

  const subtitleSpring = spring({
    fps,
    frame: frame - 8,
    config: { damping: 18, mass: 0.9 },
  });

  const badgeOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
  });

  const numberOpacity = interpolate(frame, [20, 35], [0, 1], {
    extrapolateRight: "clamp",
  });

  const numberScale = spring({
    fps,
    frame: frame - 20,
    config: { damping: 12, mass: 0.6 },
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        padding: 80,
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
        {/* Badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            border: `1px solid ${accent}40`,
            background: `${accent}10`,
            padding: "8px 16px",
            borderRadius: 999,
            color: accent,
            fontSize: 14,
            fontWeight: 500,
            letterSpacing: 1.5,
            textTransform: "uppercase",
            opacity: badgeOpacity,
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: 999,
              background: accent,
              boxShadow: `0 0 12px ${accent}`,
            }}
          />
          Animation Fundamentals
        </div>

        {/* Main Title */}
        <div
          style={{
            marginTop: 32,
            transform: `translateY(${(1 - titleSpring) * 30}px)`,
            opacity: titleSpring,
          }}
        >
          <div
            style={{
              fontSize: 82,
              fontWeight: 700,
              lineHeight: 1,
              letterSpacing: -2,
              color: "white",
            }}
          >
            The{" "}
            <span
              style={{
                background: `linear-gradient(135deg, ${accent}, ${accent}cc)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              12 Principles
            </span>
          </div>
          <div
            style={{
              fontSize: 82,
              fontWeight: 700,
              lineHeight: 1,
              letterSpacing: -2,
              color: "white",
              marginTop: 4,
            }}
          >
            of Animation
          </div>
        </div>

        {/* Subtitle */}
        <div
          style={{
            marginTop: 28,
            transform: `translateY(${(1 - subtitleSpring) * 20}px)`,
            opacity: subtitleSpring,
          }}
        >
          <div
            style={{
              fontSize: 22,
              color: "rgba(255,255,255,0.6)",
              maxWidth: 600,
              lineHeight: 1.5,
            }}
          >
            Timeless techniques from Disney animators
            <br />
            that bring motion to life
          </div>
        </div>

        {/* Animated number display */}
        <div
          style={{
            marginTop: 48,
            display: "flex",
            gap: 8,
            opacity: numberOpacity,
            transform: `scale(${0.8 + numberScale * 0.2})`,
          }}
        >
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              style={{
                width: 32,
                height: 4,
                borderRadius: 2,
                background:
                  i < Math.floor((frame - 20) / 3) % 13
                    ? accent
                    : "rgba(255,255,255,0.15)",
                transition: "background 0.1s",
              }}
            />
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};
