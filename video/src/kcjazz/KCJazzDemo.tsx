import React from "react";
import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { KCJazzPrinciple } from "./principles";
import { KCJazzTheme } from "./theme";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const SoftShadow: React.FC<{ x: number; y: number; rX: number; rY: number; opacity: number }> = ({
  x,
  y,
  rX,
  rY,
  opacity,
}) => (
  <ellipse cx={x} cy={y} rx={rX} ry={rY} fill="rgba(0,0,0,0.55)" opacity={opacity} />
);

const NoteGlyph: React.FC<{
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
  rotation: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
  highlight: string;
}> = ({ x, y, scaleX, scaleY, rotation, fill, stroke, strokeWidth, highlight }) => (
  <g transform={`translate(${x} ${y}) rotate(${rotation}) scale(${scaleX} ${scaleY})`}>
    <ellipse cx={0} cy={0} rx={46} ry={34} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
    <ellipse cx={-12} cy={-10} rx={26} ry={18} fill={highlight} opacity={0.18} />
    <rect x={36} y={-176} width={18} height={182} rx={9} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
    <path
      d="M54 -175 C 112 -160, 112 -108, 68 -94 C 105 -110, 97 -148, 54 -155 Z"
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinejoin="round"
    />
  </g>
);

const DemoFrame: React.FC<{ theme: KCJazzTheme; children: React.ReactNode }> = ({
  theme,
  children,
}) => (
  <svg viewBox="0 0 1000 560" width="100%" height="100%" style={{ display: "block" }}>
    <defs>
      <linearGradient id="kcjazz-stage" x1="0" y1="0" x2="0" y2="1">
        <stop
          offset="0%"
          stopColor={theme.style === "sheet" ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.08)"}
        />
        <stop
          offset="100%"
          stopColor={theme.style === "sheet" ? "rgba(255,255,255,0.76)" : "rgba(0,0,0,0.30)"}
        />
      </linearGradient>
      <linearGradient id="kcjazz-gold" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor={theme.colors.gold} stopOpacity={0.95} />
        <stop offset="100%" stopColor={theme.colors.teal} stopOpacity={0.9} />
      </linearGradient>
      <filter id="kcjazz-softShadow" x="-40%" y="-40%" width="180%" height="180%">
        <feGaussianBlur in="SourceAlpha" stdDeviation="6" result="blur" />
        <feOffset dx="0" dy="6" result="offsetBlur" />
        <feColorMatrix
          in="offsetBlur"
          type="matrix"
          values="0 0 0 0 0
                  0 0 0 0 0
                  0 0 0 0 0
                  0 0 0 0.55 0"
          result="shadow"
        />
        <feMerge>
          <feMergeNode in="shadow" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>

    <rect x={24} y={20} width={952} height={520} rx={34} fill="url(#kcjazz-stage)" />
    <rect
      x={24}
      y={20}
      width={952}
      height={520}
      rx={34}
      fill="none"
      stroke={theme.style === "sheet" ? "rgba(20,20,20,0.14)" : "rgba(255,255,255,0.12)"}
      strokeWidth={2}
    />
    {children}
  </svg>
);

const SquashStretchDemo: React.FC<{ theme: KCJazzTheme }> = ({ theme }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const cycle = 1.65 * fps;
  const t = (frame % cycle) / cycle;

  const up = t < 0.5 ? Easing.out(Easing.quad)(t / 0.5) : 1 - Easing.in(Easing.quad)((t - 0.5) / 0.5);
  const y = lerp(420, 160, up);

  const impact = interpolate(up, [0, 0.08], [1, 0], clamp);
  const stretch = interpolate(up, [0.18, 0.72], [0, 1], clamp) * (1 - impact) * 0.65;

  const scaleX = 1 + impact * 0.24 - stretch * 0.1;
  const scaleY = 1 - impact * 0.24 + stretch * 0.22;

  const shadowP = interpolate(up, [0, 1], [1, 0.25], clamp);
  const shadowOpacity = theme.style === "sheet" ? 0.22 : 0.3;

  return (
    <DemoFrame theme={theme}>
      <SoftShadow x={500} y={456} rX={110 * shadowP} rY={24 * shadowP} opacity={shadowOpacity} />
      <NoteGlyph
        x={500}
        y={y}
        scaleX={scaleX}
        scaleY={scaleY}
        rotation={interpolate(stretch, [0, 1], [0, -4], clamp)}
        fill={theme.style === "sheet" ? theme.colors.ink : "url(#kcjazz-gold)"}
        stroke={theme.style === "sheet" ? "rgba(20,20,20,0.12)" : "rgba(255,255,255,0.12)"}
        strokeWidth={theme.style === "sheet" ? 2 : 1.5}
        highlight={theme.colors.paper}
      />
      <path
        d="M200 456 H800"
        stroke={theme.style === "sheet" ? "rgba(20,20,20,0.18)" : `${theme.colors.gold}33`}
        strokeWidth={3}
        strokeLinecap="round"
      />
    </DemoFrame>
  );
};

const AnticipationDemo: React.FC<{ theme: KCJazzTheme }> = ({ theme }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const cycle = 2.4 * fps;
  const t = (frame % cycle) / cycle;

  const windUp = interpolate(t, [0, 0.45], [0, 1], clamp);
  const strike = interpolate(t, [0.45, 0.62], [0, 1], clamp);
  const settle = interpolate(t, [0.62, 1], [0, 1], clamp);

  const stickRot = -18 * Easing.out(Easing.quad)(windUp) + 42 * Easing.in(Easing.cubic)(strike) + 4 * Math.sin(settle * Math.PI * 2) * (1 - settle);
  const stickY = 210 - 34 * Easing.out(Easing.quad)(windUp) + 52 * Easing.in(Easing.cubic)(strike);

  const hit = strike > 0.001 ? (1 - strike) : 0;
  const burst = interpolate(hit, [0, 1], [0, 1], clamp);

  return (
    <DemoFrame theme={theme}>
      <path
        d="M220 448 C 360 420, 640 420, 780 448"
        fill="none"
        stroke={theme.style === "sheet" ? "rgba(20,20,20,0.2)" : "rgba(255,255,255,0.14)"}
        strokeWidth={3}
        strokeLinecap="round"
      />
      <g filter="url(#kcjazz-softShadow)">
        <circle cx={500} cy={420} r={92} fill={theme.style === "sheet" ? "#ffffff" : "rgba(0,0,0,0.26)"} />
        <circle
          cx={500}
          cy={420}
          r={92}
          fill="none"
          stroke={theme.style === "sheet" ? "rgba(20,20,20,0.16)" : "rgba(255,255,255,0.14)"}
          strokeWidth={3}
        />
        <circle cx={500} cy={420} r={22} fill={theme.colors.gold} opacity={0.32} />
      </g>

      <g transform={`translate(500 ${stickY}) rotate(${stickRot})`}>
        <rect
          x={-220}
          y={-10}
          width={280}
          height={20}
          rx={10}
          fill={theme.style === "sheet" ? theme.colors.ink : theme.colors.gold}
          opacity={0.9}
        />
        <circle
          cx={76}
          cy={0}
          r={18}
          fill={theme.style === "sheet" ? theme.colors.ink : theme.colors.teal}
          opacity={0.85}
        />
      </g>

      <g opacity={burst}>
        {new Array(10).fill(0).map((_, i) => {
          const a = (i / 10) * Math.PI * 2;
          const x1 = 500 + Math.cos(a) * 34;
          const y1 = 420 + Math.sin(a) * 34;
          const x2 = 500 + Math.cos(a) * 92;
          const y2 = 420 + Math.sin(a) * 92;
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={theme.colors.teal}
              strokeWidth={4}
              strokeLinecap="round"
              opacity={0.8}
            />
          );
        })}
      </g>
    </DemoFrame>
  );
};

const StagingDemo: React.FC<{ theme: KCJazzTheme }> = ({ theme }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const sweep = (frame % (4.8 * fps)) / (4.8 * fps);
  const spotX = lerp(320, 680, Easing.inOut(Easing.sin)(sweep));
  const focus = interpolate(Math.abs(0.5 - sweep), [0, 0.5], [1, 0], clamp);

  const clutterOpacity = theme.style === "sheet" ? 0.16 : 0.12;
  const focusOpacity = interpolate(focus, [0, 1], [0.5, 1], clamp);

  return (
    <DemoFrame theme={theme}>
      <g opacity={clutterOpacity}>
        {new Array(14).fill(0).map((_, i) => {
          const rx = 120 + (i * 62) % 780;
          const ry = 110 + ((i * 97) % 300);
          const s = 0.55 + ((i * 37) % 100) / 240;
          return (
            <NoteGlyph
              key={i}
              x={rx}
              y={ry}
              scaleX={s}
              scaleY={s}
              rotation={-16 + (i % 6) * 8}
              fill={theme.style === "sheet" ? theme.colors.ink : "rgba(255,255,255,0.6)"}
              stroke="transparent"
              strokeWidth={0}
              highlight={theme.colors.paper}
            />
          );
        })}
      </g>

      <g opacity={0.92}>
        <path
          d="M160 462 H840"
          stroke={theme.style === "sheet" ? "rgba(20,20,20,0.18)" : "rgba(255,255,255,0.12)"}
          strokeWidth={3}
          strokeLinecap="round"
        />
      </g>

      <defs>
        <radialGradient id="kcjazz-spot" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity={theme.style === "sheet" ? 0.85 : 0.55} />
          <stop offset="65%" stopColor="#ffffff" stopOpacity={0.0} />
        </radialGradient>
      </defs>

      <circle cx={spotX} cy={240} r={280} fill="url(#kcjazz-spot)" opacity={theme.style === "sheet" ? 0.36 : 0.18} />

      <g opacity={focusOpacity} filter="url(#kcjazz-softShadow)">
        <NoteGlyph
          x={spotX}
          y={290}
          scaleX={1.05}
          scaleY={1.05}
          rotation={0}
          fill={theme.style === "sheet" ? theme.colors.ink : "url(#kcjazz-gold)"}
          stroke={theme.style === "sheet" ? "rgba(20,20,20,0.14)" : "rgba(255,255,255,0.12)"}
          strokeWidth={theme.style === "sheet" ? 2.2 : 1.6}
          highlight={theme.colors.paper}
        />
      </g>
    </DemoFrame>
  );
};

const PoseDemo: React.FC<{ theme: KCJazzTheme }> = ({ theme }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const t = (frame % (3.2 * fps)) / (3.2 * fps);
  const x = lerp(200, 440, Easing.inOut(Easing.quad)(t));
  const y = lerp(380, 220, Math.sin(t * Math.PI));

  const keyPoses = [
    { x: 660, y: 380 },
    { x: 770, y: 220 },
    { x: 880, y: 360 },
  ];

  const inbetween = spring({
    fps,
    frame,
    config: { damping: 80, mass: 0.8, stiffness: 140 },
    durationInFrames: Math.round(1.4 * fps),
  });

  const k = Math.floor((frame / Math.round(1.1 * fps)) % keyPoses.length);
  const k2 = (k + 1) % keyPoses.length;
  const local = (frame % Math.round(1.1 * fps)) / Math.round(1.1 * fps);
  const eased = Easing.inOut(Easing.quad)(local);
  const px = lerp(keyPoses[k].x, keyPoses[k2].x, eased);
  const py = lerp(keyPoses[k].y, keyPoses[k2].y, eased);

  const stroke = theme.style === "sheet" ? "rgba(20,20,20,0.22)" : "rgba(255,255,255,0.18)";

  return (
    <DemoFrame theme={theme}>
      <g opacity={0.92}>
        <text
          x={250}
          y={90}
          textAnchor="middle"
          fontFamily={theme.font.body}
          fontSize={20}
          fill={theme.style === "sheet" ? theme.colors.ink : theme.colors.mutedText}
        >
          Straight Ahead
        </text>
        <text
          x={770}
          y={90}
          textAnchor="middle"
          fontFamily={theme.font.body}
          fontSize={20}
          fill={theme.style === "sheet" ? theme.colors.ink : theme.colors.mutedText}
        >
          Pose to Pose
        </text>
      </g>

      <line x1={500} y1={130} x2={500} y2={500} stroke={stroke} strokeWidth={2} opacity={0.8} />

      <path
        d="M120 456 H460"
        stroke={stroke}
        strokeWidth={3}
        strokeLinecap="round"
        opacity={0.9}
      />
      <NoteGlyph
        x={x}
        y={y}
        scaleX={1}
        scaleY={1}
        rotation={-6 + 12 * t}
        fill={theme.style === "sheet" ? theme.colors.ink : "url(#kcjazz-gold)"}
        stroke="transparent"
        strokeWidth={0}
        highlight={theme.colors.paper}
      />
      <path
        d="M160 360 C 260 200, 320 170, 420 250"
        fill="none"
        stroke={theme.colors.teal}
        strokeWidth={4}
        strokeLinecap="round"
        opacity={0.45}
        strokeDasharray="14 10"
      />

      <g opacity={0.9}>
        {keyPoses.map((p, idx) => (
          <circle
            key={idx}
            cx={p.x}
            cy={p.y}
            r={16}
            fill={theme.colors.gold}
            opacity={0.22}
            stroke={stroke}
            strokeWidth={2}
          />
        ))}
      </g>

      <g opacity={0.95} transform={`scale(${0.92 + 0.08 * inbetween})`}>
        <NoteGlyph
          x={px}
          y={py}
          scaleX={1}
          scaleY={1}
          rotation={4 * Math.sin(t * Math.PI * 2)}
          fill={theme.style === "sheet" ? theme.colors.ink : theme.colors.gold}
          stroke={stroke}
          strokeWidth={theme.style === "sheet" ? 1.8 : 1.2}
          highlight={theme.colors.paper}
        />
      </g>
    </DemoFrame>
  );
};

const FollowThroughDemo: React.FC<{ theme: KCJazzTheme }> = ({ theme }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const cycle = 3.2 * fps;
  const t = (frame % cycle) / cycle;
  const angle = Math.sin(t * Math.PI * 2) * 22;
  const baseX = 520;
  const baseY = 300;

  const segments = 10;
  const segLen = 34;

  const pts = new Array(segments).fill(0).map((_, i) => {
    const delayed = (frame - i * 3) / fps;
    const a = Math.sin((delayed / 3.2) * Math.PI * 2) * 22;
    const rad = ((a - 90) * Math.PI) / 180;
    return {
      x: baseX + Math.cos(rad) * i * segLen,
      y: baseY + Math.sin(rad) * i * segLen,
    };
  });

  const stroke = theme.style === "sheet" ? "rgba(20,20,20,0.20)" : "rgba(255,255,255,0.16)";

  return (
    <DemoFrame theme={theme}>
      <path
        d="M200 456 H820"
        stroke={stroke}
        strokeWidth={3}
        strokeLinecap="round"
        opacity={0.85}
      />
      <g opacity={0.9}>
        {pts.slice(1).map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={16 - i * 0.9}
            fill={theme.colors.teal}
            opacity={0.12 + i * 0.02}
          />
        ))}
      </g>

      <path
        d={pts
          .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
          .join(" ")}
        fill="none"
        stroke={theme.colors.teal}
        strokeWidth={8}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.3}
      />

      <NoteGlyph
        x={baseX}
        y={baseY}
        scaleX={1}
        scaleY={1}
        rotation={angle}
        fill={theme.style === "sheet" ? theme.colors.ink : "url(#kcjazz-gold)"}
        stroke={stroke}
        strokeWidth={theme.style === "sheet" ? 2 : 1.4}
        highlight={theme.colors.paper}
      />
    </DemoFrame>
  );
};

const SlowInOutDemo: React.FC<{ theme: KCJazzTheme }> = ({ theme }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const t = (frame % (3 * fps)) / (3 * fps);
  const eased = Easing.inOut(Easing.quad)(t);

  const xLinear = lerp(220, 780, t);
  const xEased = lerp(220, 780, eased);

  const stroke = theme.style === "sheet" ? "rgba(20,20,20,0.20)" : "rgba(255,255,255,0.14)";

  const markers = new Array(13).fill(0).map((_, i) => i / 12);

  return (
    <DemoFrame theme={theme}>
      <text x={500} y={94} textAnchor="middle" fontFamily={theme.font.body} fontSize={20} fill={theme.colors.mutedText}>
        Same distance, different spacing
      </text>

      <g opacity={0.9}>
        <path d="M220 250 H780" stroke={stroke} strokeWidth={3} strokeLinecap="round" />
        <path d="M220 390 H780" stroke={stroke} strokeWidth={3} strokeLinecap="round" />
      </g>

      <text x={220} y={224} fontFamily={theme.font.body} fontSize={16} fill={theme.colors.mutedText}>
        Linear
      </text>
      <text x={220} y={364} fontFamily={theme.font.body} fontSize={16} fill={theme.colors.mutedText}>
        Ease in/out
      </text>

      <g opacity={0.9}>
        {markers.map((m, i) => (
          <circle key={i} cx={lerp(220, 780, m)} cy={250} r={6} fill={theme.colors.gold} opacity={0.14} />
        ))}
        {markers.map((m, i) => (
          <circle
            key={i}
            cx={lerp(220, 780, Easing.inOut(Easing.quad)(m))}
            cy={390}
            r={6}
            fill={theme.colors.teal}
            opacity={0.16}
          />
        ))}
      </g>

      <NoteGlyph
        x={xLinear}
        y={250}
        scaleX={0.82}
        scaleY={0.82}
        rotation={0}
        fill={theme.style === "sheet" ? theme.colors.ink : theme.colors.gold}
        stroke="transparent"
        strokeWidth={0}
        highlight={theme.colors.paper}
      />
      <NoteGlyph
        x={xEased}
        y={390}
        scaleX={0.82}
        scaleY={0.82}
        rotation={0}
        fill={theme.style === "sheet" ? theme.colors.ink : theme.colors.teal}
        stroke="transparent"
        strokeWidth={0}
        highlight={theme.colors.paper}
      />
    </DemoFrame>
  );
};

const ArcsDemo: React.FC<{ theme: KCJazzTheme }> = ({ theme }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const t = (frame % (3.2 * fps)) / (3.2 * fps);
  const x = lerp(220, 780, t);
  const y = 390 - Math.sin(t * Math.PI) * 180;

  const stroke = theme.style === "sheet" ? "rgba(20,20,20,0.20)" : "rgba(255,255,255,0.16)";

  return (
    <DemoFrame theme={theme}>
      <path d="M220 456 H780" stroke={stroke} strokeWidth={3} strokeLinecap="round" opacity={0.9} />
      <path
        d="M220 390 Q 500 130 780 390"
        fill="none"
        stroke={theme.colors.teal}
        strokeWidth={6}
        strokeLinecap="round"
        opacity={0.38}
      />
      <circle cx={220} cy={390} r={10} fill={theme.colors.gold} opacity={0.2} />
      <circle cx={780} cy={390} r={10} fill={theme.colors.gold} opacity={0.2} />
      <NoteGlyph
        x={x}
        y={y}
        scaleX={0.95}
        scaleY={0.95}
        rotation={interpolate(t, [0, 1], [-12, 12], clamp)}
        fill={theme.style === "sheet" ? theme.colors.ink : "url(#kcjazz-gold)"}
        stroke={stroke}
        strokeWidth={theme.style === "sheet" ? 2 : 1.4}
        highlight={theme.colors.paper}
      />
    </DemoFrame>
  );
};

const SecondaryActionDemo: React.FC<{ theme: KCJazzTheme }> = ({ theme }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const t = (frame % (2.8 * fps)) / (2.8 * fps);
  const main = Math.sin(t * Math.PI * 2) * 70;
  const sec = Math.sin((t * Math.PI * 2 + 0.8)) * 18;
  const lag = Math.sin((t * Math.PI * 2 + 1.4)) * 28;

  const baseX = 500;
  const baseY = 300;

  const stroke = theme.style === "sheet" ? "rgba(20,20,20,0.18)" : "rgba(255,255,255,0.14)";

  return (
    <DemoFrame theme={theme}>
      <path d="M220 456 H780" stroke={stroke} strokeWidth={3} strokeLinecap="round" opacity={0.9} />

      <g opacity={0.92}>
        <NoteGlyph
          x={baseX}
          y={baseY + main}
          scaleX={1}
          scaleY={1}
          rotation={0}
          fill={theme.style === "sheet" ? theme.colors.ink : "url(#kcjazz-gold)"}
          stroke={stroke}
          strokeWidth={theme.style === "sheet" ? 2 : 1.4}
          highlight={theme.colors.paper}
        />
      </g>

      <g opacity={0.75} filter="url(#kcjazz-softShadow)">
        <NoteGlyph
          x={baseX + 160}
          y={baseY + main + lag}
          scaleX={0.66}
          scaleY={0.66}
          rotation={sec * 0.4}
          fill={theme.style === "sheet" ? theme.colors.ink : theme.colors.teal}
          stroke="transparent"
          strokeWidth={0}
          highlight={theme.colors.paper}
        />
      </g>

      <path
        d={`M ${baseX + 40} ${baseY + main - 10} C ${baseX + 120} ${baseY + main - 40}, ${baseX + 120} ${
          baseY + main + 40
        }, ${baseX + 190} ${baseY + main + lag}`}
        fill="none"
        stroke={theme.colors.teal}
        strokeWidth={5}
        strokeLinecap="round"
        opacity={0.22}
      />
    </DemoFrame>
  );
};

const TimingDemo: React.FC<{ theme: KCJazzTheme }> = ({ theme }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fastT = (frame % (1.4 * fps)) / (1.4 * fps);
  const slowT = (frame % (2.6 * fps)) / (2.6 * fps);

  const fastUp =
    fastT < 0.5
      ? Easing.out(Easing.quad)(fastT / 0.5)
      : 1 - Easing.in(Easing.quad)((fastT - 0.5) / 0.5);
  const slowUp =
    slowT < 0.5
      ? Easing.out(Easing.quad)(slowT / 0.5)
      : 1 - Easing.in(Easing.quad)((slowT - 0.5) / 0.5);

  const stroke = theme.style === "sheet" ? "rgba(20,20,20,0.18)" : "rgba(255,255,255,0.14)";

  return (
    <DemoFrame theme={theme}>
      <path d="M240 456 H760" stroke={stroke} strokeWidth={3} strokeLinecap="round" opacity={0.9} />

      <text x={280} y={170} fontFamily={theme.font.body} fontSize={18} fill={theme.colors.mutedText}>
        Fast
      </text>
      <text x={680} y={170} fontFamily={theme.font.body} fontSize={18} fill={theme.colors.mutedText} textAnchor="end">
        Slow
      </text>

      <NoteGlyph
        x={300}
        y={lerp(420, 210, fastUp)}
        scaleX={0.9}
        scaleY={0.9}
        rotation={0}
        fill={theme.style === "sheet" ? theme.colors.ink : theme.colors.teal}
        stroke="transparent"
        strokeWidth={0}
        highlight={theme.colors.paper}
      />
      <NoteGlyph
        x={700}
        y={lerp(420, 210, slowUp)}
        scaleX={0.9}
        scaleY={0.9}
        rotation={0}
        fill={theme.style === "sheet" ? theme.colors.ink : theme.colors.gold}
        stroke="transparent"
        strokeWidth={0}
        highlight={theme.colors.paper}
      />
    </DemoFrame>
  );
};

const ExaggerationDemo: React.FC<{ theme: KCJazzTheme }> = ({ theme }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const t = (frame % (3.4 * fps)) / (3.4 * fps);
  const split = t < 0.5;
  const p = split ? t / 0.5 : (t - 0.5) / 0.5;

  const amt = split ? 0.24 : 0.5;
  const bend = Math.sin(p * Math.PI) * amt;

  const scaleY = 1 + bend;
  const scaleX = 1 - bend * 0.55;
  const smear = interpolate(Math.abs(Math.sin(p * Math.PI)), [0, 1], [0, 1], clamp) * (split ? 0.25 : 0.65);

  const stroke = theme.style === "sheet" ? "rgba(20,20,20,0.18)" : "rgba(255,255,255,0.14)";

  return (
    <DemoFrame theme={theme}>
      <path d="M220 456 H780" stroke={stroke} strokeWidth={3} strokeLinecap="round" opacity={0.9} />
      <text x={250} y={112} fontFamily={theme.font.body} fontSize={18} fill={theme.colors.mutedText}>
        Normal
      </text>
      <text x={750} y={112} fontFamily={theme.font.body} fontSize={18} fill={theme.colors.mutedText} textAnchor="end">
        Exaggerated
      </text>

      <g opacity={0.75}>
        <NoteGlyph
          x={300}
          y={300}
          scaleX={1 - 0.18 * Math.sin(p * Math.PI)}
          scaleY={1 + 0.18 * Math.sin(p * Math.PI)}
          rotation={-4}
          fill={theme.style === "sheet" ? theme.colors.ink : theme.colors.teal}
          stroke="transparent"
          strokeWidth={0}
          highlight={theme.colors.paper}
        />
      </g>

      <g filter="url(#kcjazz-softShadow)">
        <NoteGlyph
          x={700}
          y={300}
          scaleX={scaleX}
          scaleY={scaleY}
          rotation={-8}
          fill={theme.style === "sheet" ? theme.colors.ink : "url(#kcjazz-gold)"}
          stroke={stroke}
          strokeWidth={theme.style === "sheet" ? 2 : 1.3}
          highlight={theme.colors.paper}
        />
      </g>

      <g opacity={smear}>
        <path
          d="M650 300 C 640 250, 660 220, 710 212"
          fill="none"
          stroke={theme.colors.gold}
          strokeWidth={6}
          strokeLinecap="round"
          opacity={0.4}
        />
        <path
          d="M650 320 C 642 360, 670 386, 724 398"
          fill="none"
          stroke={theme.colors.gold}
          strokeWidth={6}
          strokeLinecap="round"
          opacity={0.32}
        />
      </g>
    </DemoFrame>
  );
};

const SolidDrawingDemo: React.FC<{ theme: KCJazzTheme }> = ({ theme }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const t = (frame % (4.2 * fps)) / (4.2 * fps);
  const rot = Math.sin(t * Math.PI * 2) * 0.6;

  const cx = 500;
  const cy = 300;
  const size = 140;

  const project = (x: number, y: number, z: number) => {
    const depth = 420;
    const s = depth / (depth + z);
    return { x: cx + x * s, y: cy + y * s };
  };

  const cube = [
    [-1, -1, -1],
    [1, -1, -1],
    [1, 1, -1],
    [-1, 1, -1],
    [-1, -1, 1],
    [1, -1, 1],
    [1, 1, 1],
    [-1, 1, 1],
  ].map(([x, y, z]) => {
    const xr = x * Math.cos(rot) + z * Math.sin(rot);
    const zr = -x * Math.sin(rot) + z * Math.cos(rot);
    return project(xr * size, y * size, zr * size + 140);
  });

  const stroke = theme.style === "sheet" ? "rgba(20,20,20,0.22)" : "rgba(255,255,255,0.18)";

  const faceA = theme.style === "sheet" ? "rgba(20,20,20,0.06)" : "rgba(255,255,255,0.06)";
  const faceB = theme.style === "sheet" ? "rgba(20,20,20,0.10)" : "rgba(255,255,255,0.09)";
  const faceC = theme.style === "sheet" ? "rgba(20,20,20,0.14)" : "rgba(255,255,255,0.12)";

  const p = (i: number) => `${cube[i].x.toFixed(1)} ${cube[i].y.toFixed(1)}`;

  return (
    <DemoFrame theme={theme}>
      <path d="M220 456 H780" stroke={stroke} strokeWidth={3} strokeLinecap="round" opacity={0.9} />

      <g filter="url(#kcjazz-softShadow)">
        <path
          d={`M ${p(4)} L ${p(5)} L ${p(6)} L ${p(7)} Z`}
          fill={faceA}
          stroke={stroke}
          strokeWidth={2}
        />
        <path
          d={`M ${p(5)} L ${p(1)} L ${p(2)} L ${p(6)} Z`}
          fill={faceB}
          stroke={stroke}
          strokeWidth={2}
        />
        <path
          d={`M ${p(4)} L ${p(0)} L ${p(1)} L ${p(5)} Z`}
          fill={faceC}
          stroke={stroke}
          strokeWidth={2}
        />
      </g>

      <g opacity={0.9}>
        <path d={`M ${p(0)} L ${p(1)} L ${p(2)} L ${p(3)} Z`} fill="none" stroke={theme.colors.teal} strokeWidth={3} opacity={0.28} />
        <path d={`M ${p(0)} L ${p(4)} M ${p(1)} L ${p(5)} M ${p(2)} L ${p(6)} M ${p(3)} L ${p(7)}`} fill="none" stroke={theme.colors.gold} strokeWidth={3} opacity={0.22} />
      </g>

      <text x={500} y={112} textAnchor="middle" fontFamily={theme.font.body} fontSize={18} fill={theme.colors.mutedText}>
        Think in volume, not outlines
      </text>
    </DemoFrame>
  );
};

const AppealDemo: React.FC<{ theme: KCJazzTheme }> = ({ theme }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const t = frame / fps;
  const bounce = Math.sin(t * 2.2) * 14;
  const blink = Math.sin(t * 1.1) > 0.92 ? 0.08 : 1;

  const stroke = theme.style === "sheet" ? "rgba(20,20,20,0.16)" : "rgba(255,255,255,0.14)";

  return (
    <DemoFrame theme={theme}>
      <path d="M220 456 H780" stroke={stroke} strokeWidth={3} strokeLinecap="round" opacity={0.9} />
      <g transform={`translate(500 ${290 + bounce})`} filter="url(#kcjazz-softShadow)">
        <NoteGlyph
          x={0}
          y={0}
          scaleX={1.04}
          scaleY={1.04}
          rotation={0}
          fill={theme.style === "sheet" ? theme.colors.ink : "url(#kcjazz-gold)"}
          stroke={stroke}
          strokeWidth={theme.style === "sheet" ? 2 : 1.4}
          highlight={theme.colors.paper}
        />
        <g transform="translate(-10 -30)">
          <ellipse cx={-20} cy={0} rx={16} ry={12 * blink} fill={theme.colors.paper} opacity={theme.style === "sheet" ? 0.92 : 0.88} />
          <ellipse cx={36} cy={0} rx={16} ry={12 * blink} fill={theme.colors.paper} opacity={theme.style === "sheet" ? 0.92 : 0.88} />
          <circle cx={-20} cy={0} r={5} fill={theme.style === "sheet" ? theme.colors.ink : "#0b0d10"} opacity={blink} />
          <circle cx={36} cy={0} r={5} fill={theme.style === "sheet" ? theme.colors.ink : "#0b0d10"} opacity={blink} />
          <path d="M-10 30 C 4 42, 20 42, 34 30" stroke={theme.colors.teal} strokeWidth={6} strokeLinecap="round" fill="none" opacity={0.85} />
        </g>
      </g>
    </DemoFrame>
  );
};

export const KCJazzDemo: React.FC<{
  theme: KCJazzTheme;
  principle: KCJazzPrinciple;
}> = ({ theme, principle }) => {
  switch (principle.demo) {
    case "squash":
      return <SquashStretchDemo theme={theme} />;
    case "anticipation":
      return <AnticipationDemo theme={theme} />;
    case "staging":
      return <StagingDemo theme={theme} />;
    case "pose":
      return <PoseDemo theme={theme} />;
    case "follow":
      return <FollowThroughDemo theme={theme} />;
    case "slow":
      return <SlowInOutDemo theme={theme} />;
    case "arcs":
      return <ArcsDemo theme={theme} />;
    case "secondary":
      return <SecondaryActionDemo theme={theme} />;
    case "timing":
      return <TimingDemo theme={theme} />;
    case "exaggeration":
      return <ExaggerationDemo theme={theme} />;
    case "solid":
      return <SolidDrawingDemo theme={theme} />;
    case "appeal":
      return <AppealDemo theme={theme} />;
    default:
      return null;
  }
};

