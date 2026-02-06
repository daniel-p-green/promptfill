import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

type Principle = {
  number: number;
  name: string;
  description: string;
  icon: string;
};

export const PrinciplesOverview: React.FC<{
  principles: Principle[];
  accent: string;
}> = ({ principles, accent }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        padding: 60,
      }}
    >
      <div style={{ width: "100%", maxWidth: 1100 }}>
        {/* Section Title */}
        <div
          style={{
            marginBottom: 40,
            opacity: titleOpacity,
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: 16,
              color: accent,
              fontWeight: 600,
              letterSpacing: 2,
              textTransform: "uppercase",
              marginBottom: 12,
            }}
          >
            Overview
          </div>
          <div
            style={{
              fontSize: 38,
              fontWeight: 600,
              color: "white",
              letterSpacing: -0.5,
            }}
          >
            All 12 Principles at a Glance
          </div>
        </div>

        {/* Grid of principles */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 16,
          }}
        >
          {principles.map((principle, index) => {
            const delay = index * 4;
            const itemSpring = spring({
              fps,
              frame: frame - delay - 20,
              config: { damping: 18, mass: 0.7 },
            });

            const itemOpacity = interpolate(
              frame - delay - 20,
              [0, 10],
              [0, 1],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }
            );

            return (
              <div
                key={principle.number}
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 12,
                  padding: 16,
                  transform: `translateY(${(1 - itemSpring) * 20}px)`,
                  opacity: itemOpacity,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 8,
                  }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 6,
                      background: `${accent}20`,
                      color: accent,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    {principle.number}
                  </div>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: "white",
                      lineHeight: 1.2,
                    }}
                  >
                    {principle.name}
                  </div>
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "rgba(255,255,255,0.5)",
                    lineHeight: 1.4,
                  }}
                >
                  {principle.description}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
