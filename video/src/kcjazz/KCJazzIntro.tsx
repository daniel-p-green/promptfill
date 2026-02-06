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
import { KCJazzTheme } from "./theme";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const KCJazzIntro: React.FC<{
  theme: KCJazzTheme;
  durationInFrames: number;
}> = ({ theme, durationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({
    fps,
    frame,
    config: { damping: 200 },
    durationInFrames: Math.round(0.9 * fps),
  });

  const titleY = interpolate(enter, [0, 1], [16, 0], clamp);
  const titleOpacity = interpolate(enter, [0, 1], [0, 1], clamp);

  const glow = interpolate(frame, [0, 2.5 * fps], [0, 1], clamp);
  const subtitleOpacity = interpolate(frame, [0.7 * fps, 2.2 * fps], [0, 1], clamp);

  const tagOpacity = interpolate(frame, [1.6 * fps, 3.2 * fps], [0, 1], clamp);

  const titleFontSize = 72;
  const subtitleFontSize = 26;

  return (
    <AbsoluteFill>
      <KCJazzBackdrop theme={theme} />

      <AbsoluteFill style={{ padding: 84, justifyContent: "center" }}>
        <div style={{ opacity: titleOpacity, transform: `translateY(${titleY}px)` }}>
          <div
            style={{
              fontFamily: theme.font.body,
              fontSize: 18,
              letterSpacing: 2.6,
              textTransform: "uppercase",
              color: theme.style === "sheet" ? theme.colors.ink : theme.colors.mutedText,
              opacity: 0.95,
            }}
          >
            Kansas City jazz · a study in motion
          </div>

          <div
            style={{
              marginTop: 16,
              fontFamily: theme.font.display,
              fontWeight: 800,
              fontSize: titleFontSize,
              letterSpacing: -0.8,
              lineHeight: 1.02,
              color: theme.colors.ink,
              textShadow:
                theme.style === "sheet"
                  ? "0 16px 60px rgba(0,0,0,0.10)"
                  : "0 22px 90px rgba(0,0,0,0.55)",
            }}
          >
            The 12 Principles
            <br />
            of Animation
          </div>

          <div
            style={{
              marginTop: 18,
              fontFamily: theme.font.body,
              fontSize: subtitleFontSize,
              color: theme.colors.mutedText,
              maxWidth: 960,
              lineHeight: 1.3,
              opacity: subtitleOpacity,
            }}
          >
            Clear on‑screen explanations. Big visual demos. No voiceover—just rhythm, spacing,
            and intent.
          </div>

          <div
            style={{
              marginTop: 26,
              display: "inline-flex",
              alignItems: "center",
              gap: 12,
              padding: "12px 16px",
              borderRadius: 999,
              border:
                theme.style === "sheet"
                  ? `1px solid rgba(20,20,20,0.14)`
                  : `1px solid rgba(255,255,255,0.14)`,
              background:
                theme.style === "sheet"
                  ? "rgba(255,255,255,0.75)"
                  : "rgba(255,255,255,0.06)",
              opacity: tagOpacity,
            }}
          >
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: 999,
                background: theme.colors.gold,
                boxShadow: `0 0 24px ${theme.colors.gold}66`,
                opacity: glow,
              }}
            />
            <div
              style={{
                fontFamily: theme.font.body,
                fontSize: 16,
                fontWeight: 650,
                color: theme.colors.ink,
                letterSpacing: -0.2,
              }}
            >
              Inspired by the timeless language of character animation.
            </div>
          </div>
        </div>
      </AbsoluteFill>

      <KCJazzCurtain theme={theme} durationInFrames={durationInFrames} />
    </AbsoluteFill>
  );
};

