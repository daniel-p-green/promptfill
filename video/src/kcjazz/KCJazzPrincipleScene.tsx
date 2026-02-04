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
import { KCJazzDemo } from "./KCJazzDemo";
import { KCJazzPrinciple } from "./principles";
import { KCJazzTheme } from "./theme";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const Pill: React.FC<{ theme: KCJazzTheme; label: string }> = ({ theme, label }) => (
  <div
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
        theme.style === "sheet" ? "rgba(255,255,255,0.80)" : "rgba(255,255,255,0.06)",
      color: theme.colors.ink,
      fontFamily: theme.font.body,
      fontSize: 14,
      fontWeight: 650,
      letterSpacing: 1.8,
      textTransform: "uppercase",
    }}
  >
    <span
      style={{
        width: 10,
        height: 10,
        borderRadius: 999,
        background: theme.colors.gold,
        boxShadow: `0 0 22px ${theme.colors.gold}55`,
      }}
    />
    {label}
  </div>
);

const Beats: React.FC<{
  theme: KCJazzTheme;
  active: number;
  total: number;
  opacity: number;
}> = ({ theme, active, total, opacity }) => (
  <div style={{ display: "flex", gap: 8, opacity }}>
    {new Array(total).fill(0).map((_, i) => {
      const on = i === active;
      return (
        <div
          key={i}
          style={{
            width: on ? 18 : 10,
            height: 10,
            borderRadius: 999,
            background: on ? theme.colors.teal : theme.style === "sheet" ? "rgba(20,20,20,0.16)" : "rgba(255,255,255,0.14)",
            boxShadow: on ? `0 0 20px ${theme.colors.teal}66` : "none",
          }}
        />
      );
    })}
  </div>
);

export const KCJazzPrincipleScene: React.FC<{
  theme: KCJazzTheme;
  principle: KCJazzPrinciple;
  durationInFrames: number;
  totalPrinciples: number;
}> = ({ theme, principle, durationInFrames, totalPrinciples }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({
    fps,
    frame,
    config: { damping: 200 },
    durationInFrames: Math.round(0.8 * fps),
  });

  const headerOpacity = interpolate(enter, [0, 1], [0, 1], clamp);
  const headerY = interpolate(enter, [0, 1], [10, 0], clamp);

  const splitP = interpolate(frame, [2.0 * fps, 3.0 * fps], [0, 1], clamp);

  const line1Opacity = interpolate(frame, [3.0 * fps, 3.8 * fps], [0, 1], clamp);
  const line2Opacity = interpolate(frame, [3.8 * fps, 4.6 * fps], [0, 1], clamp);
  const watchOpacity = interpolate(frame, [5.2 * fps, 6.0 * fps], [0, 1], clamp);
  const jazzOpacity = interpolate(frame, [6.0 * fps, 6.8 * fps], [0, 1], clamp);

  const panelScale = spring({
    fps,
    frame: frame - Math.round(0.2 * fps),
    config: { damping: 160, mass: 0.9, stiffness: 140 },
    durationInFrames: Math.round(0.9 * fps),
  });

  const activeIndex = Math.max(0, principle.number - 1);
  const beatsOpacity = interpolate(frame, [0.6 * fps, 1.4 * fps], [0, 1], clamp);

  const pad = 64;
  const contentW = 1280 - pad * 2;
  const stageH = 380;
  const demoW = 680;
  const stageGap = 24;
  const textW = contentW - (demoW + stageGap);
  const demoXInitial = (contentW - demoW) / 2;

  const demoX = interpolate(splitP, [0, 1], [demoXInitial, 0], clamp);
  const demoScale = interpolate(splitP, [0, 1], [1.08, 1], clamp) * (0.98 + 0.02 * panelScale);
  const demoY = interpolate(splitP, [0, 1], [10, 0], clamp);

  const textX = demoW + stageGap + interpolate(splitP, [0, 1], [80, 0], clamp);
  const textOpacity = interpolate(splitP, [0, 1], [0, 1], clamp);

  return (
    <AbsoluteFill>
      <KCJazzBackdrop theme={theme} />

      <AbsoluteFill style={{ padding: pad }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Pill theme={theme} label={`Principle ${principle.number} of ${totalPrinciples}`} />
            <Beats theme={theme} active={activeIndex} total={totalPrinciples} opacity={beatsOpacity} />
          </div>
          <div
            style={{
              fontFamily: theme.font.body,
              fontSize: 14,
              color: theme.colors.mutedText,
              letterSpacing: 1.9,
              textTransform: "uppercase",
              opacity: 0.9,
            }}
          >
            18th & Vine · Kansas City
          </div>
        </div>

        <div style={{ marginTop: 20, opacity: headerOpacity, transform: `translateY(${headerY}px)` }}>
          <div
            style={{
              fontFamily: theme.font.display,
              fontWeight: 800,
              fontSize: 52,
              letterSpacing: -0.8,
              lineHeight: 1.03,
              color: theme.colors.ink,
            }}
          >
            {principle.name}
          </div>
          <div
            style={{
              marginTop: 10,
              fontFamily: theme.font.body,
              fontSize: 21,
              lineHeight: 1.22,
              color: theme.colors.mutedText,
              maxWidth: 980,
            }}
          >
            {principle.subtitle}
          </div>
        </div>

        <div style={{ marginTop: 18, height: stageH, position: "relative" }}>
          <div
            style={{
              position: "absolute",
              left: demoX,
              top: demoY,
              width: demoW,
              height: stageH,
              transform: `scale(${demoScale})`,
              transformOrigin: "top left",
            }}
          >
            <KCJazzDemo theme={theme} principle={principle} />
          </div>

          <div
            style={{
              position: "absolute",
              left: textX,
              top: 0,
              width: textW,
              height: stageH,
              opacity: textOpacity,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: 14,
            }}
          >
            <div
              style={{
                padding: "18px 18px",
                borderRadius: 22,
                border:
                  theme.style === "sheet"
                    ? "1px solid rgba(20,20,20,0.14)"
                    : "1px solid rgba(255,255,255,0.14)",
                background:
                  theme.style === "sheet"
                    ? "rgba(255,255,255,0.78)"
                    : "rgba(0,0,0,0.22)",
                boxShadow:
                  theme.style === "sheet"
                    ? "0 18px 60px rgba(0,0,0,0.10)"
                    : "0 24px 90px rgba(0,0,0,0.45)",
                backdropFilter: "blur(8px)",
              }}
            >
              <div
                style={{
                  fontFamily: theme.font.body,
                  fontSize: 21,
                  lineHeight: 1.32,
                  color: theme.colors.ink,
                  opacity: line1Opacity,
                }}
              >
                {principle.explanation[0]}
              </div>
              <div
                style={{
                  marginTop: 10,
                  fontFamily: theme.font.body,
                  fontSize: 21,
                  lineHeight: 1.32,
                  color: theme.colors.ink,
                  opacity: line2Opacity,
                }}
              >
                {principle.explanation[1]}
              </div>

              <div
                style={{
                  marginTop: 14,
                  fontFamily: theme.font.body,
                  fontSize: 18,
                  lineHeight: 1.35,
                  color: theme.colors.mutedText,
                  opacity: watchOpacity,
                }}
              >
                {principle.watch}
              </div>
              <div
                style={{
                  marginTop: 8,
                  fontFamily: theme.font.body,
                  fontSize: 18,
                  lineHeight: 1.35,
                  color: theme.colors.mutedText,
                  opacity: jazzOpacity,
                }}
              >
                {principle.jazz}
              </div>
            </div>
          </div>
        </div>
      </AbsoluteFill>

      <KCJazzCurtain theme={theme} durationInFrames={durationInFrames} />
    </AbsoluteFill>
  );
};
