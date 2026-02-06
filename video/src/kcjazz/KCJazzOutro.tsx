import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { KCJazzBackdrop } from "./KCJazzBackdrop";
import { KCJazzCurtain } from "./KCJazzCurtain";
import { KCJAZZ_PRINCIPLES } from "./principles";
import { KCJazzTheme } from "./theme";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const PrincipleList: React.FC<{ theme: KCJazzTheme; opacity: number }> = ({
  theme,
  opacity,
}) => {
  const columns: string[][] = [[], [], []];
  KCJAZZ_PRINCIPLES.forEach((p, idx) => {
    columns[idx % columns.length].push(`${p.number}. ${p.name}`);
  });

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        gap: 18,
        marginTop: 28,
        opacity,
      }}
    >
      {columns.map((col, i) => (
        <div key={i} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {col.map((line) => (
            <div
              key={line}
              style={{
                fontFamily: theme.font.body,
                fontSize: 18,
                lineHeight: 1.2,
                color: theme.colors.mutedText,
              }}
            >
              {line}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export const KCJazzOutro: React.FC<{
  theme: KCJazzTheme;
  durationInFrames: number;
}> = ({ theme, durationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({
    fps,
    frame,
    config: { damping: 200 },
    durationInFrames: Math.round(1.1 * fps),
  });

  const opacity = interpolate(enter, [0, 1], [0, 1], clamp);
  const y = interpolate(enter, [0, 1], [12, 0], clamp);
  const listOpacity = interpolate(frame, [0.9 * fps, 2.2 * fps], [0, 1], clamp);

  return (
    <AbsoluteFill>
      <KCJazzBackdrop theme={theme} />

      <AbsoluteFill style={{ padding: 84, justifyContent: "center" }}>
        <div style={{ opacity, transform: `translateY(${y}px)` }}>
          <div
            style={{
              fontFamily: theme.font.display,
              fontWeight: 800,
              fontSize: 56,
              letterSpacing: -0.8,
              lineHeight: 1.04,
              color: theme.colors.ink,
            }}
          >
            Animation is rhythm.
            <br />
            Rhythm is clarity.
          </div>
          <div
            style={{
              marginTop: 16,
              fontFamily: theme.font.body,
              fontSize: 22,
              lineHeight: 1.3,
              color: theme.colors.mutedText,
              maxWidth: 980,
            }}
          >
            Use these principles like a bandstand: listen, adjust spacing, commit to the pose, and
            let each idea read.
          </div>

          <PrincipleList theme={theme} opacity={listOpacity} />

          <div
            style={{
              marginTop: 30,
              display: "flex",
              alignItems: "center",
              gap: 14,
              flexWrap: "wrap",
              fontFamily: theme.font.body,
              fontSize: 16,
              color: theme.colors.mutedText,
            }}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 12px",
                borderRadius: 999,
                border:
                  theme.style === "sheet"
                    ? "1px solid rgba(20,20,20,0.16)"
                    : "1px solid rgba(255,255,255,0.16)",
                background:
                  theme.style === "sheet"
                    ? "rgba(255,255,255,0.72)"
                    : "rgba(255,255,255,0.06)",
              }}
            >
              <span
                style={{
                  width: 9,
                  height: 9,
                  borderRadius: 999,
                  background: theme.colors.teal,
                  boxShadow: `0 0 20px ${theme.colors.teal}66`,
                }}
              />
              Built with Remotion
            </span>
            <span style={{ opacity: 0.9 }}>
              Inspired by the tradition of Disney animation and the principles popularized by Frank
              Thomas & Ollie Johnston.
            </span>
          </div>
        </div>
      </AbsoluteFill>

      <KCJazzCurtain theme={theme} durationInFrames={durationInFrames} />
    </AbsoluteFill>
  );
};

