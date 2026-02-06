import React from "react";
import { AbsoluteFill, Img, interpolate, useCurrentFrame } from "remotion";
import { KCJazzTheme } from "./theme";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const grainSvg =
  "data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%221280%22 height=%22720%22%3E%3Cfilter id=%22n%22 x=%220%22 y=%220%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%222%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%221280%22 height=%22720%22 filter=%22url(%23n)%22 opacity=%220.35%22/%3E%3C/svg%3E";

const StaffLines: React.FC<{ color: string; opacity: number }> = ({
  color,
  opacity,
}) => {
  const lines = new Array(5).fill(0);
  return (
    <svg
      viewBox="0 0 1280 720"
      width={1280}
      height={720}
      style={{ position: "absolute", inset: 0, opacity }}
    >
      {new Array(3).fill(0).map((_, blockIndex) => {
        const top = 126 + blockIndex * 210;
        return (
          <g key={blockIndex} opacity={1}>
            {lines.map((__, i) => (
              <line
                key={i}
                x1={76}
                x2={1204}
                y1={top + i * 18}
                y2={top + i * 18}
                stroke={color}
                strokeWidth={2}
                strokeLinecap="round"
                opacity={0.22}
              />
            ))}
          </g>
        );
      })}
    </svg>
  );
};

const DecoFrame: React.FC<{ theme: KCJazzTheme; opacity: number }> = ({
  theme,
  opacity,
}) => {
  if (theme.style === "sheet") return null;

  const { gold } = theme.colors;

  return (
    <svg
      viewBox="0 0 1280 720"
      width={1280}
      height={720}
      style={{ position: "absolute", inset: 0, opacity, pointerEvents: "none" }}
    >
      <rect
        x={36}
        y={36}
        width={1208}
        height={648}
        rx={34}
        fill="none"
        stroke={`${gold}66`}
        strokeWidth={2}
      />
      <rect
        x={52}
        y={52}
        width={1176}
        height={616}
        rx={28}
        fill="none"
        stroke={`${gold}24`}
        strokeWidth={2}
      />
      {[
        [52, 52],
        [1228, 52],
        [52, 668],
        [1228, 668],
      ].map(([x, y], idx) => (
        <g key={idx}>
          <circle cx={x} cy={y} r={7} fill={gold} opacity={0.85} />
          <circle cx={x} cy={y} r={14} fill={gold} opacity={0.12} />
        </g>
      ))}
    </svg>
  );
};

export const KCJazzBackdrop: React.FC<{ theme: KCJazzTheme }> = ({ theme }) => {
  const frame = useCurrentFrame();
  const breathe = interpolate(frame, [0, 240], [0.85, 1], {
    ...clamp,
  });

  const base =
    theme.style === "sheet"
      ? `radial-gradient(900px 520px at 40% 20%, rgba(255,255,255,0.75), rgba(0,0,0,0) 64%),
         linear-gradient(180deg, ${theme.colors.bg0}, ${theme.colors.bg1})`
      : `radial-gradient(900px 520px at 45% 20%, rgba(255,255,255,0.08), rgba(0,0,0,0) 62%),
         radial-gradient(840px 520px at 18% 60%, ${theme.colors.teal}18, rgba(0,0,0,0) 58%),
         radial-gradient(980px 620px at 82% 46%, ${theme.colors.gold}10, rgba(0,0,0,0) 62%),
         linear-gradient(180deg, ${theme.colors.bg0}, ${theme.colors.bg1})`;

  const staffOpacity = theme.style === "sheet" ? 0.35 : 0.16;
  const staffColor = theme.style === "sheet" ? theme.colors.ink : theme.colors.gold;

  return (
    <AbsoluteFill style={{ backgroundImage: base }}>
      <AbsoluteFill style={{ opacity: breathe }}>
        <StaffLines color={staffColor} opacity={staffOpacity} />
      </AbsoluteFill>
      <DecoFrame theme={theme} opacity={0.9} />
      <AbsoluteFill
        style={{
          mixBlendMode: theme.style === "sheet" ? "multiply" : "overlay",
          opacity: theme.style === "sheet" ? 0.18 : 0.1,
        }}
      >
        <Img
          src={grainSvg}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          background:
            theme.style === "sheet"
              ? "linear-gradient(180deg, rgba(0,0,0,0.06), rgba(0,0,0,0) 24%, rgba(0,0,0,0.08))"
              : "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0) 26%, rgba(0,0,0,0.25))",
          opacity: 0.85,
        }}
      />
    </AbsoluteFill>
  );
};

