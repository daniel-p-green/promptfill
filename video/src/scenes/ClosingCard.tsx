import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";

export const ClosingCard: React.FC<{ productName: string; accent: string }> = ({
  productName,
  accent,
}) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        padding: 80,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div style={{ textAlign: "center", maxWidth: 920, opacity: o }}>
        <div
          style={{
            fontSize: 60,
            fontWeight: 650,
            letterSpacing: -1,
            color: "white",
          }}
        >
          {productName}
        </div>
        <div
          style={{
            marginTop: 14,
            fontSize: 24,
            color: "rgba(255,255,255,0.74)",
            lineHeight: 1.3,
          }}
        >
          Prompts that feel like a product.
        </div>

        <div
          style={{
            marginTop: 30,
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            border: `1px solid ${accent}55`,
            background: `${accent}14`,
            padding: "10px 14px",
            borderRadius: 999,
            color: "rgba(255,255,255,0.85)",
            fontSize: 16,
          }}
        >
          <span style={{ width: 8, height: 8, borderRadius: 999, background: accent }} />
          Local-first · Minimal · Fast
        </div>

        <div
          style={{
            marginTop: 22,
            color: "rgba(255,255,255,0.55)",
            fontSize: 16,
          }}
        >
          Ready for a beta?
        </div>
      </div>
    </AbsoluteFill>
  );
};
