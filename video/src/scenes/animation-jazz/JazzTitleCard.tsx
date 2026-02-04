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
  gold: string;
  cream: string;
  burgundy: string;
};

// Art Deco sunburst
const Sunburst: React.FC<{ gold: string; opacity: number }> = ({ gold, opacity }) => {
  const rays = 20;
  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        width: 900,
        height: 900,
        transform: "translate(-50%, -50%)",
        opacity: opacity * 0.12,
      }}
    >
      {[...Array(rays)].map((_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: 2,
            height: 450,
            background: `linear-gradient(180deg, ${gold}, transparent 80%)`,
            transformOrigin: "top center",
            transform: `rotate(${(i / rays) * 360}deg)`,
          }}
        />
      ))}
    </div>
  );
};

// Diamond divider
const DiamondDivider: React.FC<{ gold: string; width?: number }> = ({ gold, width = 350 }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 18, width }}>
    <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, transparent, ${gold})` }} />
    <div style={{ width: 10, height: 10, background: gold, transform: "rotate(45deg)" }} />
    <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${gold}, transparent)` }} />
  </div>
);

export const JazzTitleCard: React.FC<JazzTitleCardProps> = ({ gold, cream, burgundy }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const sunburstOpacity = interpolate(frame, [0, 60], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const mainSpring = spring({
    fps,
    frame: frame - 15,
    config: { damping: 22, mass: 1.1 },
  });

  const subtitleOpacity = interpolate(frame, [50, 80], [0, 1], {
    extrapolateRight: "clamp",
  });

  const dividerOpacity = interpolate(frame, [80, 110], [0, 1], {
    extrapolateRight: "clamp",
  });

  const attributionOpacity = interpolate(frame, [120, 160], [0, 1], {
    extrapolateRight: "clamp",
  });

  const quoteOpacity = interpolate(frame, [180, 220], [0, 1], {
    extrapolateRight: "clamp",
  });

  const exitOpacity = interpolate(frame, [270, 300], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: exitOpacity }}>
      <Sunburst gold={gold} opacity={sunburstOpacity} />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          transform: `scale(${0.92 + mainSpring * 0.08})`,
          opacity: mainSpring,
          zIndex: 1,
        }}
      >
        {/* Eyebrow */}
        <div
          style={{
            fontSize: 13,
            letterSpacing: 6,
            color: gold,
            textTransform: "uppercase",
            marginBottom: 25,
            opacity: subtitleOpacity,
          }}
        >
          A Study in Motion
        </div>

        {/* The */}
        <div
          style={{
            fontSize: 24,
            letterSpacing: 10,
            color: gold,
            textTransform: "uppercase",
            marginBottom: 12,
          }}
        >
          The
        </div>

        {/* 12 Principles */}
        <div
          style={{
            fontSize: 68,
            fontWeight: 300,
            letterSpacing: 3,
            color: cream,
            lineHeight: 1,
            textShadow: `0 0 80px ${gold}30`,
          }}
        >
          12 Principles
        </div>

        {/* of Animation */}
        <div
          style={{
            fontSize: 24,
            letterSpacing: 10,
            color: gold,
            textTransform: "uppercase",
            marginTop: 12,
          }}
        >
          of Animation
        </div>

        {/* Divider */}
        <div style={{ marginTop: 40, marginBottom: 40, opacity: dividerOpacity }}>
          <DiamondDivider gold={gold} width={400} />
        </div>

        {/* Attribution */}
        <div style={{ opacity: attributionOpacity, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
          <div style={{ fontSize: 13, letterSpacing: 4, color: `${cream}70`, textTransform: "uppercase" }}>
            As Defined By
          </div>
          <div style={{ fontSize: 22, color: cream, fontStyle: "italic" }}>
            Frank Thomas & Ollie Johnston
          </div>
          <div style={{ fontSize: 13, color: `${cream}50`, marginTop: 5 }}>
            Disney's Nine Old Men
          </div>
        </div>

        {/* Quote */}
        <div
          style={{
            marginTop: 45,
            opacity: quoteOpacity,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
          }}
        >
          <div style={{ fontSize: 14, color: `${cream}60`, fontStyle: "italic", letterSpacing: 0.5 }}>
            "Animation is not the art of drawings that move,
          </div>
          <div style={{ fontSize: 14, color: `${cream}60`, fontStyle: "italic", letterSpacing: 0.5 }}>
            but the art of movements that are drawn."
          </div>
          <div style={{ fontSize: 11, color: gold, marginTop: 10, letterSpacing: 4, textTransform: "uppercase" }}>
            — Norman McLaren
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
