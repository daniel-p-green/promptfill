import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
} from "remotion";

const Bullet: React.FC<{ children: React.ReactNode; accent: string; idx: number }> = ({
  children,
  accent,
  idx,
}) => {
  const frame = useCurrentFrame();
  const start = idx * 10;
  const o = interpolate(frame, [start, start + 12], [0, 1], {
    extrapolateRight: "clamp",
  });
  const y = interpolate(frame, [start, start + 12], [10, 0], {
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        display: "flex",
        gap: 14,
        alignItems: "flex-start",
        opacity: o,
        transform: `translateY(${y}px)`,
      }}
    >
      <div
        style={{
          width: 10,
          height: 10,
          borderRadius: 999,
          background: accent,
          marginTop: 7,
          boxShadow: `0 0 18px ${accent}55`,
          flex: "0 0 auto",
        }}
      />
      <div style={{ color: "rgba(255,255,255,0.82)", fontSize: 24, lineHeight: 1.35 }}>
        {children}
      </div>
    </div>
  );
};

export const ProblemCard: React.FC<{ accent: string }> = ({ accent }) => {
  const frame = useCurrentFrame();
  const titleO = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ padding: 80, justifyContent: "center" }}>
      <div style={{ maxWidth: 980 }}>
        <div
          style={{
            fontSize: 44,
            fontWeight: 650,
            letterSpacing: -0.6,
            color: "white",
            opacity: titleO,
          }}
        >
          Prompts are everywhere.
        </div>
        <div
          style={{
            marginTop: 14,
            fontSize: 22,
            color: "rgba(255,255,255,0.65)",
            maxWidth: 820,
            opacity: titleO,
          }}
        >
          Docs, snippets, DMs… and every reuse turns into manual edits.
        </div>

        <div style={{ marginTop: 34, display: "flex", flexDirection: "column", gap: 18 }}>
          <Bullet accent={accent} idx={0}>
            Variables drift. Output quality becomes inconsistent.
          </Bullet>
          <Bullet accent={accent} idx={1}>
            Dropdown choices (tone, audience, format) live in your head.
          </Bullet>
          <Bullet accent={accent} idx={2}>
            Copy/paste invites mistakes (and sometimes leaks).
          </Bullet>
        </div>
      </div>
    </AbsoluteFill>
  );
};
