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
};

export const ClassicPrinciplesOverview: React.FC<{
  principles: Principle[];
  accentWarm: string;
}> = ({ principles, accentWarm }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Roman numerals for classic feel
  const romanNumerals = [
    "I",
    "II",
    "III",
    "IV",
    "V",
    "VI",
    "VII",
    "VIII",
    "IX",
    "X",
    "XI",
    "XII",
  ];

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        padding: 50,
      }}
    >
      <div style={{ width: "100%", maxWidth: 1000 }}>
        {/* Section Title */}
        <div
          style={{
            marginBottom: 35,
            opacity: titleOpacity,
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: 14,
              color: "#6b5a42",
              letterSpacing: 3,
              textTransform: "uppercase",
              marginBottom: 10,
            }}
          >
            The Complete Index
          </div>
          <div
            style={{
              fontSize: 34,
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontWeight: 400,
              color: "#2c1810",
            }}
          >
            Twelve Essential Principles
          </div>
          <div
            style={{
              width: 80,
              height: 2,
              background: accentWarm,
              margin: "15px auto 0",
              borderRadius: 1,
            }}
          />
        </div>

        {/* Two-column list styled like a book index */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "12px 40px",
          }}
        >
          {principles.map((principle, index) => {
            const delay = index * 5;
            const itemSpring = spring({
              fps,
              frame: frame - delay - 25,
              config: { damping: 20, mass: 0.8 },
            });

            const itemOpacity = interpolate(
              frame - delay - 25,
              [0, 12],
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
                  display: "flex",
                  alignItems: "baseline",
                  gap: 12,
                  padding: "10px 0",
                  borderBottom: "1px dotted rgba(92,74,50,0.3)",
                  transform: `translateX(${(1 - itemSpring) * 20}px)`,
                  opacity: itemOpacity,
                }}
              >
                {/* Roman numeral */}
                <div
                  style={{
                    fontSize: 16,
                    fontFamily: "Georgia, 'Times New Roman', serif",
                    color: accentWarm,
                    fontWeight: 600,
                    minWidth: 35,
                  }}
                >
                  {romanNumerals[index]}
                </div>

                {/* Principle name */}
                <div
                  style={{
                    flex: 1,
                    fontSize: 17,
                    fontFamily: "Georgia, 'Times New Roman', serif",
                    color: "#2c1810",
                  }}
                >
                  {principle.name}
                </div>

                {/* Page number style decoration */}
                <div
                  style={{
                    fontSize: 14,
                    color: "#8a7a62",
                    fontFamily: "Georgia, 'Times New Roman', serif",
                    fontStyle: "italic",
                  }}
                >
                  · · ·
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom quote */}
        <div
          style={{
            marginTop: 35,
            textAlign: "center",
            opacity: interpolate(frame, [180, 210], [0, 1], {
              extrapolateRight: "clamp",
            }),
          }}
        >
          <div
            style={{
              fontSize: 16,
              fontStyle: "italic",
              color: "#5c4a32",
              fontFamily: "Georgia, 'Times New Roman', serif",
            }}
          >
            "Animation can explain whatever the mind of man can conceive"
          </div>
          <div
            style={{
              fontSize: 13,
              color: "#7a6952",
              marginTop: 8,
            }}
          >
            — Walt Disney
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
