import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export const TitleCard: React.FC<{ productName: string; accent: string }> = ({
  productName,
  accent,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const y = spring({ fps, frame, config: { damping: 18, mass: 0.9 } });
  const opacity = interpolate(frame, [0, 12], [0, 1], {
    extrapolateRight: "clamp",
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
          width: "100%",
          maxWidth: 980,
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            border: "1px solid rgba(255,255,255,0.12)",
            padding: "10px 14px",
            borderRadius: 999,
            color: "rgba(255,255,255,0.78)",
            fontSize: 16,
            letterSpacing: 0.2,
            opacity,
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: 999,
              background: accent,
              boxShadow: `0 0 18px ${accent}55`,
            }}
          />
          Local-first prompt library
        </div>

        <div
          style={{
            marginTop: 22,
            transform: `translateY(${(1 - y) * 18}px)`,
            opacity,
          }}
        >
          <div
            style={{
              fontSize: 74,
              fontWeight: 650,
              lineHeight: 1.02,
              letterSpacing: -1.2,
              color: "white",
            }}
          >
            {productName}
          </div>
          <div
            style={{
              marginTop: 16,
              fontSize: 26,
              lineHeight: 1.25,
              color: "rgba(255,255,255,0.78)",
              maxWidth: 760,
            }}
          >
            Fill variables. Pick dropdowns. Copy perfect prompts.
          </div>

          <div
            style={{
              marginTop: 32,
              display: "flex",
              gap: 14,
              alignItems: "center",
            }}
          >
            <div
              style={{
                background: accent,
                color: "#07110a",
                fontWeight: 650,
                padding: "12px 16px",
                borderRadius: 12,
                boxShadow: `0 18px 60px ${accent}33`,
              }}
            >
              Build once → reuse forever
            </div>
            <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 16 }}>
              60-second demo
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
