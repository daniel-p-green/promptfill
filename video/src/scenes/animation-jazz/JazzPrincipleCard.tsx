import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from "remotion";

type Principle = {
  number: number;
  name: string;
  explanation: string;
  keyPoint: string;
};

type JazzPrincipleCardProps = {
  principle: Principle;
  index: number;
  total: number;
  amber: string;
  cream: string;
  brown: string;
  warmBlack: string;
};

// Large, clear animated demonstrations
const PrincipleDemo: React.FC<{
  num: number;
  frame: number;
  amber: string;
  cream: string;
  brown: string;
}> = ({ num, frame, amber, cream, brown }) => {
  const W = 400;
  const H = 300;

  const demos: Record<number, React.ReactNode> = {
    // 1. Squash & Stretch
    1: (() => {
      const cycle = (frame % 80) / 80;
      const bounce = Math.abs(Math.sin(cycle * Math.PI));
      const y = 50 + (1 - bounce) * 180;
      const impact = Math.max(0, 1 - (230 - y) / 40);
      const squashX = 1 + impact * 0.5;
      const squashY = 1 - impact * 0.35;
      const stretch = bounce > 0.8 ? (bounce - 0.8) * 5 : 0;
      const stretchX = 1 - stretch * 0.25;
      const stretchY = 1 + stretch * 0.35;

      return (
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          <line x1="50" y1="250" x2="350" y2="250" stroke={amber} strokeWidth="3" opacity="0.5" />
          <ellipse cx="200" cy="260" rx={45 * squashX} ry="8" fill={amber} opacity={0.25 * (1 - bounce * 0.6)} />
          <ellipse
            cx="200"
            cy={y}
            rx={40 * squashX * stretchX}
            ry={40 * squashY * stretchY}
            fill={brown}
            stroke={amber}
            strokeWidth="4"
          />
          {impact > 0.2 && (
            <text x="290" y={y + 8} fontSize="22" fill={cream} fontWeight="600">
              SQUASH
            </text>
          )}
          {stretch > 0.15 && (
            <text x="290" y={y} fontSize="22" fill={cream} fontWeight="600">
              STRETCH
            </text>
          )}
        </svg>
      );
    })(),

    // 2. Anticipation
    2: (() => {
      const cycle = (frame % 100) / 100;
      let bodyY = 140;
      let crouch = 0;
      let phase = "";

      if (cycle < 0.35) {
        phase = "wind-up";
        crouch = Math.sin((cycle / 0.35) * Math.PI * 0.5) * 40;
        bodyY = 140 + crouch;
      } else if (cycle < 0.5) {
        phase = "jump";
        bodyY = 180 - ((cycle - 0.35) / 0.15) * 140;
      } else if (cycle < 0.65) {
        phase = "fall";
        bodyY = 40 + ((cycle - 0.5) / 0.15) * 140;
      } else {
        phase = "land";
        crouch = Math.sin(((1 - (cycle - 0.65) / 0.35)) * Math.PI * 0.5) * 20;
        bodyY = 180 - crouch * 0.5;
      }

      return (
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          <line x1="50" y1="260" x2="350" y2="260" stroke={amber} strokeWidth="3" opacity="0.5" />
          <g transform={`translate(200, ${bodyY})`}>
            <ellipse cx="0" cy="35" rx="35" ry="30" fill={brown} stroke={amber} strokeWidth="3" />
            <circle cx="0" cy="-5" r="28" fill={brown} stroke={amber} strokeWidth="3" />
            <circle cx="-10" cy="-10" r="5" fill={cream} />
            <circle cx="10" cy="-10" r="5" fill={cream} />
            <line x1="-18" y1="62" x2={-28 - crouch * 0.4} y2="115" stroke={amber} strokeWidth="6" strokeLinecap="round" />
            <line x1="18" y1="62" x2={28 + crouch * 0.4} y2="115" stroke={amber} strokeWidth="6" strokeLinecap="round" />
          </g>
          {phase === "wind-up" && crouch > 15 && (
            <g opacity={crouch / 40}>
              <path d="M300 180 L300 220 M290 210 L300 220 L310 210" fill="none" stroke={amber} strokeWidth="4" />
              <text x="320" y="205" fontSize="20" fill={cream} fontWeight="600">WIND-UP</text>
            </g>
          )}
          {phase === "jump" && bodyY < 100 && (
            <g>
              <path d="M300 80 L300 40 M290 50 L300 40 L310 50" fill="none" stroke={cream} strokeWidth="4" />
              <text x="320" y="65" fontSize="20" fill={cream} fontWeight="600">ACTION!</text>
            </g>
          )}
        </svg>
      );
    })(),

    // 3. Staging
    3: (() => {
      const spotX = 200 + Math.sin(frame * 0.03) * 80;
      const inSpot = Math.abs(spotX - 200) < 50;

      return (
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          <rect x="40" y="40" width="320" height="210" fill="none" stroke={amber} strokeWidth="2" opacity="0.3" />
          <defs>
            <linearGradient id="spot3" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={amber} stopOpacity="0.4" />
              <stop offset="100%" stopColor={amber} stopOpacity="0.05" />
            </linearGradient>
          </defs>
          <path d={`M${spotX} 0 L${spotX - 60} 280 L${spotX + 60} 280 Z`} fill="url(#spot3)" />
          <g opacity={inSpot ? 1 : 0.25}>
            <ellipse cx="200" cy="195" rx="35" ry="28" fill={brown} stroke={amber} strokeWidth="3" />
            <circle cx="200" cy="150" r="28" fill={brown} stroke={amber} strokeWidth="3" />
            <circle cx="192" cy="145" r="5" fill={cream} />
            <circle cx="208" cy="145" r="5" fill={cream} />
          </g>
          <g opacity="0.2">
            <ellipse cx="90" cy="205" rx="20" ry="16" fill={cream} />
            <circle cx="90" cy="175" r="14" fill={cream} />
            <ellipse cx="310" cy="205" rx="20" ry="16" fill={cream} />
            <circle cx="310" cy="175" r="14" fill={cream} />
          </g>
          <text x="200" y="270" fontSize="20" fill={inSpot ? amber : `${cream}66`} textAnchor="middle" fontWeight="600">
            {inSpot ? "CLEAR FOCUS" : "Focus lost..."}
          </text>
        </svg>
      );
    })(),

    // 4. Straight Ahead vs Pose to Pose
    4: (() => {
      const t = (frame % 120) / 120;

      return (
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          <text x="200" y="35" fontSize="18" fill={amber} textAnchor="middle" fontWeight="600">STRAIGHT AHEAD</text>
          <text x="200" y="55" fontSize="14" fill={`${cream}88`} textAnchor="middle">Frame by frame, spontaneous</text>
          <path
            d={`M50 100 ${[...Array(Math.floor(t * 14))].map((_, i) => {
              const x = 50 + i * 22;
              const y = 100 + Math.sin(i * 0.6 + frame * 0.04) * 20;
              return `L${x} ${y}`;
            }).join(" ")}`}
            fill="none"
            stroke={cream}
            strokeWidth="4"
            strokeLinecap="round"
          />
          <circle cx={50 + t * 300} cy={100 + Math.sin(t * 8 + frame * 0.04) * 20} r="14" fill={brown} stroke={amber} strokeWidth="3" />

          <line x1="50" y1="150" x2="350" y2="150" stroke={amber} strokeWidth="1" opacity="0.3" />

          <text x="200" y="185" fontSize="18" fill={amber} textAnchor="middle" fontWeight="600">POSE TO POSE</text>
          <text x="200" y="205" fontSize="14" fill={`${cream}88`} textAnchor="middle">Key poses first, then fill in</text>
          {[0, 0.33, 0.66, 1].map((pos, i) => (
            <g key={i}>
              <circle
                cx={50 + pos * 300}
                cy="245"
                r="16"
                fill={t > pos ? brown : "transparent"}
                stroke={amber}
                strokeWidth="3"
                strokeDasharray={t > pos ? "0" : "6 6"}
              />
              <text x={50 + pos * 300} y="280" fontSize="14" fill={t > pos ? cream : `${cream}55`} textAnchor="middle">
                {["A", "B", "C", "D"][i]}
              </text>
            </g>
          ))}
          <line x1="50" y1="245" x2={50 + Math.min(t, 1) * 300} y2="245" stroke={`${cream}44`} strokeWidth="2" strokeDasharray="6 6" />
        </svg>
      );
    })(),

    // 5. Follow Through
    5: (() => {
      const swing = Math.sin(frame * 0.05);
      const d1 = Math.sin(frame * 0.05 - 0.5);
      const d2 = Math.sin(frame * 0.05 - 1.0);
      const d3 = Math.sin(frame * 0.05 - 1.5);

      const baseX = 200;
      const baseY = 50;
      const s1X = baseX + swing * 60, s1Y = baseY + 70;
      const s2X = s1X + d1 * 45, s2Y = s1Y + 55;
      const s3X = s2X + d2 * 35, s3Y = s2Y + 45;
      const s4X = s3X + d3 * 25, s4Y = s3Y + 35;

      return (
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          <circle cx={baseX} cy={baseY} r="12" fill={amber} />
          <line x1={baseX} y1={baseY} x2={s1X} y2={s1Y} stroke={amber} strokeWidth="8" strokeLinecap="round" />
          <circle cx={s1X} cy={s1Y} r="20" fill={brown} stroke={amber} strokeWidth="3" />
          <line x1={s1X} y1={s1Y} x2={s2X} y2={s2Y} stroke={amber} strokeWidth="6" strokeLinecap="round" />
          <circle cx={s2X} cy={s2Y} r="16" fill={brown} stroke={amber} strokeWidth="3" opacity="0.85" />
          <line x1={s2X} y1={s2Y} x2={s3X} y2={s3Y} stroke={amber} strokeWidth="5" strokeLinecap="round" />
          <circle cx={s3X} cy={s3Y} r="12" fill={brown} stroke={amber} strokeWidth="2" opacity="0.7" />
          <line x1={s3X} y1={s3Y} x2={s4X} y2={s4Y} stroke={amber} strokeWidth="4" strokeLinecap="round" />
          <circle cx={s4X} cy={s4Y} r="8" fill={brown} stroke={amber} strokeWidth="2" opacity="0.55" />

          <text x="60" y="100" fontSize="16" fill={cream}>Main mass</text>
          <text x="60" y="120" fontSize="16" fill={cream}>leads</text>
          <text x="300" y="230" fontSize="16" fill={amber}>Tail drags</text>
          <text x="300" y="250" fontSize="16" fill={amber}>behind</text>
        </svg>
      );
    })(),

    // 6. Slow In & Slow Out
    6: (() => {
      const cycle = (frame % 100) / 100;
      const linear = cycle;
      const eased = cycle < 0.5 ? 4 * cycle * cycle * cycle : 1 - Math.pow(-2 * cycle + 2, 3) / 2;

      return (
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          <text x="50" y="45" fontSize="18" fill={amber} fontWeight="600">LINEAR</text>
          <text x="50" y="65" fontSize="14" fill={`${cream}77`}>Constant speed (mechanical)</text>
          <line x1="50" y1="95" x2="350" y2="95" stroke={amber} strokeWidth="2" opacity="0.4" />
          {[0, 0.2, 0.4, 0.6, 0.8, 1].map((p, i) => (
            <circle key={i} cx={50 + p * 300} cy="95" r="4" fill={amber} opacity="0.5" />
          ))}
          <circle cx={50 + linear * 300} cy="95" r="18" fill={cream} stroke={amber} strokeWidth="2" opacity="0.7" />

          <text x="50" y="160" fontSize="18" fill={amber} fontWeight="600">EASED</text>
          <text x="50" y="180" fontSize="14" fill={`${cream}77`}>Slow in, slow out (natural)</text>
          <line x1="50" y1="210" x2="350" y2="210" stroke={amber} strokeWidth="2" opacity="0.4" />
          {[0, 0.03, 0.08, 0.18, 0.5, 0.82, 0.92, 0.97, 1].map((p, i) => (
            <circle key={i} cx={50 + p * 300} cy="210" r="4" fill={amber} opacity="0.5" />
          ))}
          <circle cx={50 + eased * 300} cy="210" r="18" fill={brown} stroke={amber} strokeWidth="3" />

          <text x="50" y="260" fontSize="14" fill={cream} opacity="0.7">Slow out →</text>
          <text x="280" y="260" fontSize="14" fill={cream} opacity="0.7">← Slow in</text>
        </svg>
      );
    })(),

    // 7. Arcs
    7: (() => {
      const t = (frame % 90) / 90;
      const angle = t * Math.PI;
      const arcX = 200 + Math.cos(angle - Math.PI / 2) * 120;
      const arcY = 180 - Math.sin(angle) * 130;

      return (
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          <text x="200" y="35" fontSize="20" fill={amber} textAnchor="middle" fontWeight="600">NATURAL ARC</text>
          <line x1="80" y1="180" x2="320" y2="180" stroke={`${cream}30`} strokeWidth="2" strokeDasharray="10 10" />
          <text x="200" y="205" fontSize="13" fill={`${cream}44`} textAnchor="middle">Straight = mechanical</text>
          <path d="M80 180 Q200 30 320 180" fill="none" stroke={amber} strokeWidth="3" strokeDasharray="8 6" />
          {[0.15, 0.35, 0.5, 0.65, 0.85].map((pos, i) => {
            const a = pos * Math.PI;
            return <circle key={i} cx={200 + Math.cos(a - Math.PI / 2) * 120} cy={180 - Math.sin(a) * 130} r="6" fill={amber} opacity="0.5" />;
          })}
          <circle cx={arcX} cy={arcY} r="22" fill={brown} stroke={amber} strokeWidth="4" />
          <circle cx="80" cy="180" r="10" fill={amber} opacity="0.6" />
          <circle cx="320" cy="180" r="10" fill={amber} opacity="0.6" />
          <text x="200" y="260" fontSize="16" fill={cream}>Living things move in curves</text>
        </svg>
      );
    })(),

    // 8. Secondary Action
    8: (() => {
      const walk = (frame % 50) / 50;
      const bob = Math.sin(walk * Math.PI * 2) * 8;
      const leg = Math.sin(walk * Math.PI * 2) * 25;
      const arm = Math.sin(walk * Math.PI * 2 - 1) * 40;

      return (
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          <line x1="50" y1="260" x2="350" y2="260" stroke={amber} strokeWidth="3" opacity="0.5" />
          <g transform={`translate(200, ${130 + bob})`}>
            <ellipse cx="0" cy="40" rx="40" ry="35" fill={brown} stroke={amber} strokeWidth="3" />
            <circle cx="0" cy="-10" r="30" fill={brown} stroke={amber} strokeWidth="3" />
            <circle cx="-10" cy="-15" r="6" fill={cream} />
            <circle cx="10" cy="-15" r="6" fill={cream} />
            <path d="M-12 5 Q0 15 12 5" fill="none" stroke={cream} strokeWidth="3" />
            <line x1="0" y1="25" x2={Math.sin(arm * Math.PI / 180) * 45} y2={75 + Math.cos(arm * Math.PI / 180) * 30} stroke={amber} strokeWidth="7" strokeLinecap="round" />
            <line x1="-18" y1="72" x2={-25 + leg} y2="125" stroke={amber} strokeWidth="7" strokeLinecap="round" />
            <line x1="18" y1="72" x2={25 - leg} y2="125" stroke={amber} strokeWidth="7" strokeLinecap="round" />
          </g>
          <text x="60" y="80" fontSize="16" fill={cream}>PRIMARY:</text>
          <text x="60" y="100" fontSize="18" fill={amber} fontWeight="600">Walking</text>
          <text x="280" y="180" fontSize="16" fill={cream}>SECONDARY:</text>
          <text x="280" y="200" fontSize="18" fill={amber} fontWeight="600">Arm swing</text>
        </svg>
      );
    })(),

    // 9. Timing
    9: (() => {
      const fast = ((frame * 3) % 100) / 100;
      const slow = (frame % 100) / 100;

      return (
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          <text x="50" y="40" fontSize="18" fill={amber} fontWeight="600">FAST = LIGHT</text>
          <text x="280" y="40" fontSize="14" fill={`${cream}77`}>Few frames</text>
          <line x1="50" y1="80" x2="350" y2="80" stroke={amber} strokeWidth="2" opacity="0.4" />
          <circle cx={50 + fast * 300} cy="80" r="16" fill={cream} stroke={amber} strokeWidth="2" />
          <ellipse cx={50 + fast * 300 - 20} cy="80" rx="30" ry="10" fill={cream} opacity="0.15" />

          <text x="50" y="160" fontSize="18" fill={amber} fontWeight="600">SLOW = HEAVY</text>
          <text x="280" y="160" fontSize="14" fill={`${cream}77`}>Many frames</text>
          <line x1="50" y1="200" x2="350" y2="200" stroke={amber} strokeWidth="2" opacity="0.4" />
          <circle cx={50 + slow * 300} cy="200" r="28" fill={brown} stroke={amber} strokeWidth="4" />

          <text x="200" y="270" fontSize="16" fill={cream} textAnchor="middle">Same distance, different weight</text>
        </svg>
      );
    })(),

    // 10. Exaggeration
    10: (() => {
      const cycle = (frame % 100) / 100;
      const showPushed = cycle > 0.5;
      const pulse = showPushed ? 1 + Math.sin(cycle * Math.PI * 6) * 0.08 : 1;

      return (
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          <text x="110" y="35" fontSize="18" fill={showPushed ? `${amber}77` : amber} textAnchor="middle" fontWeight="600">NORMAL</text>
          <g opacity={showPushed ? 0.4 : 1}>
            <circle cx="110" cy="130" r="55" fill={brown} stroke={amber} strokeWidth="3" />
            <circle cx="95" cy="115" r="10" fill={cream} />
            <circle cx="125" cy="115" r="10" fill={cream} />
            <circle cx="95" cy="118" r="4" fill={`#1a1510`} />
            <circle cx="125" cy="118" r="4" fill={`#1a1510`} />
            <path d="M90 150 Q110 165 130 150" fill="none" stroke={cream} strokeWidth="4" />
          </g>

          <path d="M175 130 L225 130 M215 120 L225 130 L215 140" fill="none" stroke={amber} strokeWidth="3" opacity="0.7" />
          <text x="200" y="170" fontSize="14" fill={amber} textAnchor="middle">PUSH IT</text>

          <text x="290" y="35" fontSize="18" fill={showPushed ? amber : `${amber}77`} textAnchor="middle" fontWeight="600">EXAGGERATED</text>
          <g opacity={showPushed ? 1 : 0.4} transform={`translate(290, 130) scale(${pulse})`}>
            <ellipse cx="0" cy="0" rx="65" ry="55" fill={brown} stroke={amber} strokeWidth="4" />
            <ellipse cx="-20" cy="-18" rx="16" ry="20" fill={cream} />
            <ellipse cx="20" cy="-18" rx="16" ry="20" fill={cream} />
            <circle cx="-16" cy="-12" r="7" fill={`#1a1510`} />
            <circle cx="24" cy="-12" r="7" fill={`#1a1510`} />
            <circle cx="-10" cy="-22" r="5" fill={cream} />
            <circle cx="30" cy="-22" r="5" fill={cream} />
            <path d="M-30 30 Q0 55 30 30" fill="none" stroke={cream} strokeWidth="6" />
          </g>

          <text x="200" y="250" fontSize="16" fill={cream} textAnchor="middle">Find the truth, then push it</text>
        </svg>
      );
    })(),

    // 11. Solid Drawing
    11: (() => {
      const rot = (frame * 1.2 * Math.PI) / 180;

      return (
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          <text x="200" y="35" fontSize="20" fill={amber} textAnchor="middle" fontWeight="600">3D FORM & VOLUME</text>
          <g opacity="0.25">
            <ellipse cx="200" cy="150" rx="100" ry="35" fill="none" stroke={amber} strokeDasharray="6 6" />
            <line x1="200" y1="50" x2="200" y2="250" stroke={amber} strokeDasharray="6 6" />
            <line x1="100" y1="150" x2="300" y2="150" stroke={amber} strokeDasharray="6 6" />
          </g>
          <circle cx="200" cy="150" r="85" fill={brown} stroke={amber} strokeWidth="4" />
          <ellipse cx="200" cy="150" rx={85 * Math.abs(Math.cos(rot))} ry="85" fill="none" stroke={cream} strokeWidth="2" opacity="0.5" transform="rotate(90 200 150)" />
          <ellipse cx="200" cy="150" rx="85" ry={30 * Math.cos(rot * 0.5)} fill="none" stroke={cream} strokeWidth="2" opacity="0.4" />
          <ellipse cx="170" cy="115" rx="25" ry="18" fill={cream} opacity="0.2" />
          <text x="70" y="100" fontSize="16" fill={cream}>Form</text>
          <text x="300" y="130" fontSize="16" fill={cream}>Volume</text>
          <text x="200" y="270" fontSize="16" fill={cream} textAnchor="middle">Weight</text>
        </svg>
      );
    })(),

    // 12. Appeal
    12: (() => {
      const blink = frame % 100 < 5;
      const breathe = Math.sin(frame * 0.07) * 4;

      return (
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          <text x="200" y="30" fontSize="20" fill={amber} textAnchor="middle" fontWeight="600">APPEALING DESIGN</text>
          <g transform={`translate(200, ${135 + breathe})`}>
            <ellipse cx="0" cy="0" rx="70" ry="60" fill={brown} stroke={amber} strokeWidth="4" />
            {!blink ? (
              <>
                <ellipse cx="-22" cy="-10" rx="20" ry="26" fill={cream} />
                <ellipse cx="22" cy="-10" rx="20" ry="26" fill={cream} />
                <circle cx="-18" cy="-4" r="10" fill={`#1a1510`} />
                <circle cx="26" cy="-4" r="10" fill={`#1a1510`} />
                <circle cx="-12" cy="-14" r="6" fill={cream} />
                <circle cx="32" cy="-14" r="6" fill={cream} />
              </>
            ) : (
              <>
                <path d="M-42 -10 Q-22 5 -2 -10" fill="none" stroke={cream} strokeWidth="4" />
                <path d="M2 -10 Q22 5 42 -10" fill="none" stroke={cream} strokeWidth="4" />
              </>
            )}
            <ellipse cx="0" cy="20" rx="8" ry="5" fill={amber} opacity="0.6" />
            <path d="M-28 40 Q0 65 28 40" fill="none" stroke={cream} strokeWidth="5" strokeLinecap="round" />
            <ellipse cx="0" cy="100" rx="40" ry="28" fill={brown} stroke={amber} strokeWidth="3" />
          </g>
          <text x="55" y="90" fontSize="14" fill={amber}>Big eyes</text>
          <text x="55" y="108" fontSize="12" fill={`${cream}88`}>expressive</text>
          <text x="310" y="90" fontSize="14" fill={amber}>Round shapes</text>
          <text x="310" y="108" fontSize="12" fill={`${cream}88`}>friendly</text>
          <text x="55" y="220" fontSize="14" fill={amber}>Big head ratio</text>
          <text x="310" y="220" fontSize="14" fill={amber}>Personality</text>
        </svg>
      );
    })(),
  };

  return demos[num] || null;
};

export const JazzPrincipleCard: React.FC<JazzPrincipleCardProps> = ({
  principle,
  index,
  total,
  amber,
  cream,
  brown,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Animation timing for 10.5 seconds (315 frames)
  const numberSpring = spring({ fps, frame, config: { damping: 18, mass: 0.9 } });
  const titleOpacity = interpolate(frame, [15, 40], [0, 1], { extrapolateRight: "clamp" });
  const demoOpacity = interpolate(frame, [30, 60], [0, 1], { extrapolateRight: "clamp" });
  const demoScale = interpolate(frame, [30, 65], [0.95, 1], { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const textOpacity = interpolate(frame, [70, 110], [0, 1], { extrapolateRight: "clamp" });
  const keyOpacity = interpolate(frame, [140, 180], [0, 1], { extrapolateRight: "clamp" });
  const exitOpacity = interpolate(frame, [280, 315], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ padding: "40px 50px", opacity: exitOpacity }}>
      {/* Header: Number and Title */}
      <div style={{ display: "flex", alignItems: "center", gap: 25, marginBottom: 20 }}>
        <div
          style={{
            fontSize: 80,
            fontWeight: 300,
            color: amber,
            lineHeight: 1,
            transform: `scale(${numberSpring})`,
            minWidth: 100,
          }}
        >
          {String(principle.number).padStart(2, "0")}
        </div>
        <div style={{ opacity: titleOpacity }}>
          <h2
            style={{
              fontSize: 42,
              fontWeight: 500,
              color: cream,
              margin: 0,
              lineHeight: 1.1,
            }}
          >
            {principle.name}
          </h2>
          <div style={{ fontSize: 14, color: `${cream}77`, marginTop: 6 }}>
            Principle {principle.number} of {total}
          </div>
        </div>
      </div>

      {/* Main content: Demo + Text */}
      <div style={{ display: "flex", gap: 40, flex: 1, alignItems: "center" }}>
        {/* Large Demo */}
        <div
          style={{
            opacity: demoOpacity,
            transform: `scale(${demoScale})`,
            background: `linear-gradient(135deg, ${brown}40, ${brown}20)`,
            borderRadius: 16,
            border: `2px solid ${amber}30`,
            padding: 15,
            flexShrink: 0,
          }}
        >
          <PrincipleDemo num={principle.number} frame={frame} amber={amber} cream={cream} brown={brown} />
        </div>

        {/* Text content */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 25 }}>
          <p
            style={{
              fontSize: 22,
              color: cream,
              lineHeight: 1.6,
              margin: 0,
              opacity: textOpacity,
            }}
          >
            {principle.explanation}
          </p>

          <div
            style={{
              opacity: keyOpacity,
              background: `${amber}18`,
              borderLeft: `4px solid ${amber}`,
              padding: "16px 20px",
              borderRadius: "0 10px 10px 0",
            }}
          >
            <div style={{ fontSize: 12, letterSpacing: 2, color: amber, textTransform: "uppercase", marginBottom: 8 }}>
              Key Insight
            </div>
            <p style={{ fontSize: 18, color: cream, margin: 0, fontStyle: "italic" }}>
              {principle.keyPoint}
            </p>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ position: "absolute", bottom: 35, left: 50, right: 50, display: "flex", alignItems: "center", gap: 15 }}>
        <span style={{ fontSize: 14, color: `${cream}66`, minWidth: 60 }}>
          {principle.number} of {total}
        </span>
        <div style={{ flex: 1, display: "flex", gap: 6 }}>
          {[...Array(total)].map((_, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: 4,
                borderRadius: 2,
                background: i < principle.number ? amber : `${cream}22`,
              }}
            />
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};
