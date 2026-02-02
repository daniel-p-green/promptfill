import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const Card: React.FC<{
  title: string;
  body: string;
  accent: string;
  idx: number;
}> = ({ title, body, accent, idx }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const start = idx * 10;
  const s = spring({ fps, frame: frame - start, config: { damping: 16 } });
  const o = interpolate(frame, [start, start + 12], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        flex: 1,
        borderRadius: 18,
        border: "1px solid rgba(255,255,255,0.10)",
        background: "rgba(255,255,255,0.04)",
        padding: 22,
        transform: `translateY(${(1 - s) * 14}px)`,
        opacity: o,
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 12,
          background: `${accent}22`,
          border: `1px solid ${accent}44`,
          display: "grid",
          placeItems: "center",
          marginBottom: 14,
        }}
      >
        <div style={{ width: 10, height: 10, borderRadius: 999, background: accent }} />
      </div>
      <div style={{ color: "white", fontWeight: 650, fontSize: 22 }}>{title}</div>
      <div
        style={{
          marginTop: 10,
          color: "rgba(255,255,255,0.72)",
          fontSize: 18,
          lineHeight: 1.35,
        }}
      >
        {body}
      </div>
    </div>
  );
};

export const FeatureTriptych: React.FC<{ accent: string }> = ({ accent }) => {
  const frame = useCurrentFrame();
  const titleO = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ padding: 80, justifyContent: "center" }}>
      <div style={{ maxWidth: 1100 }}>
        <div
          style={{
            fontSize: 44,
            fontWeight: 650,
            letterSpacing: -0.6,
            color: "white",
            opacity: titleO,
          }}
        >
          The fix: prompts with structure.
        </div>
        <div
          style={{
            marginTop: 26,
            display: "flex",
            gap: 18,
          }}
        >
          <Card
            idx={0}
            accent={accent}
            title="Typed variables"
            body="Text, numbers, required fields, and safe defaults — all validated."
          />
          <Card
            idx={1}
            accent={accent}
            title="Dropdown selectors"
            body="Pick tone, audience, and format from reusable option sets."
          />
          <Card
            idx={2}
            accent={accent}
            title="Instant render"
            body="Preview the final prompt, then copy/export in one click."
          />
        </div>
      </div>
    </AbsoluteFill>
  );
};
