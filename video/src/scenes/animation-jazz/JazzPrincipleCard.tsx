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
  subtitle: string;
  lines: string[];
  tip: string;
};

type JazzPrincipleCardProps = {
  principle: Principle;
  gold: string;
  cream: string;
  burgundy: string;
  totalPrinciples: number;
};

// Large, clear animated demonstrations for each principle
const PrincipleDemo: React.FC<{
  principleNumber: number;
  frame: number;
  gold: string;
  cream: string;
  burgundy: string;
}> = ({ principleNumber, frame, gold, cream, burgundy }) => {
  // Larger demo area: 320x240
  const W = 320;
  const H = 240;

  const demos: Record<number, React.ReactNode> = {
    // 1. Squash & Stretch - clear bouncing ball demonstration
    1: (() => {
      const cycle = (frame % 90) / 90;
      const bounceY = Math.abs(Math.sin(cycle * Math.PI));
      const y = 40 + (1 - bounceY) * 140;
      const impactProximity = Math.max(0, 1 - (180 - y) / 30);
      const squashX = 1 + impactProximity * 0.4;
      const squashY = 1 - impactProximity * 0.3;
      const stretchAmount = bounceY > 0.85 ? (bounceY - 0.85) * 4 : 0;
      const stretchX = 1 - stretchAmount * 0.2;
      const stretchY = 1 + stretchAmount * 0.3;

      return (
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* Ground */}
          <line x1="40" y1="200" x2="280" y2="200" stroke={gold} strokeWidth="2" opacity="0.5" />

          {/* Shadow */}
          <ellipse
            cx="160"
            cy="205"
            rx={30 * squashX}
            ry="6"
            fill={gold}
            opacity={0.2 * (1 - bounceY * 0.7)}
          />

          {/* Ball */}
          <ellipse
            cx="160"
            cy={y}
            rx={28 * squashX * stretchX}
            ry={28 * squashY * stretchY}
            fill={burgundy}
            stroke={gold}
            strokeWidth="3"
          />

          {/* Labels */}
          {impactProximity > 0.3 && (
            <g opacity={impactProximity}>
              <text x="220" y={y + 5} fontSize="14" fill={cream} fontWeight="500">
                SQUASH
              </text>
              <line x1="195" y1={y} x2="215" y2={y} stroke={cream} strokeWidth="1" opacity="0.5" />
            </g>
          )}
          {stretchAmount > 0.1 && (
            <g opacity={stretchAmount * 3}>
              <text x="220" y={y} fontSize="14" fill={cream} fontWeight="500">
                STRETCH
              </text>
              <line x1="195" y1={y} x2="215" y2={y} stroke={cream} strokeWidth="1" opacity="0.5" />
            </g>
          )}

          {/* Volume indicator */}
          <text x="160" y="230" fontSize="11" fill={`${cream}60`} textAnchor="middle">
            Volume stays constant
          </text>
        </svg>
      );
    })(),

    // 2. Anticipation - character jumping with clear wind-up
    2: (() => {
      const cycle = (frame % 120) / 120;
      let phase = "ready";
      let bodyY = 120;
      let crouch = 0;
      let bodyScale = 1;

      if (cycle < 0.35) {
        // Wind-up phase
        phase = "anticipate";
        const t = cycle / 0.35;
        crouch = Math.sin(t * Math.PI * 0.5) * 30;
        bodyY = 120 + crouch;
        bodyScale = 1 - t * 0.1;
      } else if (cycle < 0.5) {
        // Jump phase
        phase = "jump";
        const t = (cycle - 0.35) / 0.15;
        bodyY = 150 - t * 110;
        bodyScale = 1 + t * 0.15;
      } else if (cycle < 0.65) {
        // Fall phase
        phase = "fall";
        const t = (cycle - 0.5) / 0.15;
        bodyY = 40 + t * 110;
        bodyScale = 1.15 - t * 0.15;
      } else {
        // Land and settle
        phase = "settle";
        const t = (cycle - 0.65) / 0.35;
        crouch = Math.sin((1 - t) * Math.PI * 0.5) * 15;
        bodyY = 150 - crouch * 0.5;
        bodyScale = 1 - (1 - t) * 0.05;
      }

      return (
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* Ground */}
          <line x1="40" y1="200" x2="280" y2="200" stroke={gold} strokeWidth="2" opacity="0.5" />

          {/* Character */}
          <g transform={`translate(160, ${bodyY}) scale(${bodyScale})`}>
            {/* Body */}
            <ellipse cx="0" cy="25" rx="25" ry="22" fill={burgundy} stroke={gold} strokeWidth="2" />
            {/* Head */}
            <circle cx="0" cy="-5" r="18" fill={burgundy} stroke={gold} strokeWidth="2" />
            {/* Eyes */}
            <circle cx="-6" cy="-8" r="3" fill={cream} />
            <circle cx="6" cy="-8" r="3" fill={cream} />
            {/* Legs */}
            <line x1="-10" y1="45" x2={-15 - crouch * 0.3} y2="75" stroke={gold} strokeWidth="4" strokeLinecap="round" />
            <line x1="10" y1="45" x2={15 + crouch * 0.3} y2="75" stroke={gold} strokeWidth="4" strokeLinecap="round" />
          </g>

          {/* Anticipation arrow and label */}
          {phase === "anticipate" && crouch > 10 && (
            <g opacity={crouch / 30}>
              <path
                d="M230 130 L230 160 M225 155 L230 160 L235 155"
                fill="none"
                stroke={gold}
                strokeWidth="3"
              />
              <text x="230" y="180" fontSize="13" fill={gold} textAnchor="middle" fontWeight="500">
                WIND-UP
              </text>
              <text x="230" y="195" fontSize="10" fill={`${cream}70`} textAnchor="middle">
                prepares the jump
              </text>
            </g>
          )}

          {/* Action label */}
          {phase === "jump" && bodyY < 80 && (
            <g>
              <text x="230" y="60" fontSize="13" fill={cream} textAnchor="middle" fontWeight="500">
                ACTION
              </text>
              <path
                d="M230 70 L230 40 M225 45 L230 40 L235 45"
                fill="none"
                stroke={cream}
                strokeWidth="2"
              />
            </g>
          )}
        </svg>
      );
    })(),

    // 3. Staging - spotlight directing attention
    3: (() => {
      const spotlightX = 160 + Math.sin(frame * 0.025) * 60;
      const characterInSpot = Math.abs(spotlightX - 160) < 40;

      return (
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* Stage frame */}
          <rect x="40" y="30" width="240" height="160" fill="none" stroke={gold} strokeWidth="1" opacity="0.3" />

          {/* Spotlight cone */}
          <defs>
            <linearGradient id="spotlight" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={gold} stopOpacity="0.3" />
              <stop offset="100%" stopColor={gold} stopOpacity="0.05" />
            </linearGradient>
          </defs>
          <path
            d={`M${spotlightX} 0 L${spotlightX - 50} 200 L${spotlightX + 50} 200 Z`}
            fill="url(#spotlight)"
          />

          {/* Main character (center) */}
          <g opacity={characterInSpot ? 1 : 0.3}>
            <ellipse cx="160" cy="145" rx="22" ry="18" fill={burgundy} stroke={gold} strokeWidth="2" />
            <circle cx="160" cy="115" r="16" fill={burgundy} stroke={gold} strokeWidth="2" />
            <circle cx="155" cy="112" r="3" fill={cream} />
            <circle cx="165" cy="112" r="3" fill={cream} />
          </g>

          {/* Background characters (dimmed) */}
          <g opacity="0.2">
            <ellipse cx="80" cy="155" rx="14" ry="12" fill={cream} />
            <circle cx="80" cy="135" r="10" fill={cream} />
            <ellipse cx="240" cy="155" rx="14" ry="12" fill={cream} />
            <circle cx="240" cy="135" r="10" fill={cream} />
          </g>

          {/* Label */}
          <text x="160" y="210" fontSize="12" fill={characterInSpot ? gold : `${cream}50`} textAnchor="middle" fontWeight="500">
            {characterInSpot ? "CLEAR FOCUS" : "attention wanders..."}
          </text>
          <text x="160" y="228" fontSize="10" fill={`${cream}50`} textAnchor="middle">
            Direct the viewer's eye
          </text>
        </svg>
      );
    })(),

    // 4. Straight Ahead vs Pose to Pose
    4: (() => {
      const t = (frame % 150) / 150;

      return (
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* Straight Ahead section */}
          <text x="160" y="30" fontSize="13" fill={gold} textAnchor="middle" fontWeight="500">
            STRAIGHT AHEAD
          </text>
          <text x="160" y="45" fontSize="10" fill={`${cream}60`} textAnchor="middle">
            Frame by frame, spontaneous
          </text>

          {/* Continuous wavy path */}
          <path
            d={`M50 80 ${[...Array(Math.floor(t * 12))].map((_, i) => {
              const x = 50 + i * 20;
              const y = 80 + Math.sin(i * 0.7 + frame * 0.05) * 15;
              return `L${x} ${y}`;
            }).join(" ")}`}
            fill="none"
            stroke={cream}
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle
            cx={50 + t * 220}
            cy={80 + Math.sin(t * 8 + frame * 0.05) * 15}
            r="10"
            fill={burgundy}
            stroke={gold}
            strokeWidth="2"
          />

          {/* Divider */}
          <line x1="80" y1="120" x2="240" y2="120" stroke={gold} strokeWidth="1" opacity="0.3" />

          {/* Pose to Pose section */}
          <text x="160" y="145" fontSize="13" fill={gold} textAnchor="middle" fontWeight="500">
            POSE TO POSE
          </text>
          <text x="160" y="160" fontSize="10" fill={`${cream}60`} textAnchor="middle">
            Key poses first, then in-betweens
          </text>

          {/* Key pose markers */}
          {[0, 0.33, 0.66, 1].map((pos, i) => (
            <g key={i}>
              <circle
                cx={50 + pos * 220}
                cy="185"
                r="12"
                fill={t > pos ? burgundy : "transparent"}
                stroke={gold}
                strokeWidth="2"
                strokeDasharray={t > pos ? "0" : "4 4"}
              />
              <text
                x={50 + pos * 220}
                y="215"
                fontSize="10"
                fill={t > pos ? cream : `${cream}40`}
                textAnchor="middle"
              >
                {["KEY A", "KEY B", "KEY C", "KEY D"][i]}
              </text>
            </g>
          ))}

          {/* In-between line */}
          <line
            x1="50"
            y1="185"
            x2={50 + Math.min(t, 1) * 220}
            y2="185"
            stroke={`${cream}40`}
            strokeWidth="1"
            strokeDasharray="4 4"
          />
        </svg>
      );
    })(),

    // 5. Follow Through & Overlapping - pendulum/tail motion
    5: (() => {
      const swing = Math.sin(frame * 0.06);
      const delay1 = Math.sin(frame * 0.06 - 0.4);
      const delay2 = Math.sin(frame * 0.06 - 0.8);
      const delay3 = Math.sin(frame * 0.06 - 1.2);

      const baseX = 160;
      const baseY = 50;

      // Calculate pendulum positions
      const seg1X = baseX + swing * 40;
      const seg1Y = baseY + 50;
      const seg2X = seg1X + delay1 * 30;
      const seg2Y = seg1Y + 40;
      const seg3X = seg2X + delay2 * 25;
      const seg3Y = seg2Y + 35;
      const seg4X = seg3X + delay3 * 20;
      const seg4Y = seg3Y + 30;

      return (
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* Pivot point */}
          <circle cx={baseX} cy={baseY} r="8" fill={gold} />

          {/* Segments with decreasing delay */}
          <line x1={baseX} y1={baseY} x2={seg1X} y2={seg1Y} stroke={gold} strokeWidth="6" strokeLinecap="round" />
          <circle cx={seg1X} cy={seg1Y} r="12" fill={burgundy} stroke={gold} strokeWidth="2" />

          <line x1={seg1X} y1={seg1Y} x2={seg2X} y2={seg2Y} stroke={gold} strokeWidth="5" strokeLinecap="round" />
          <circle cx={seg2X} cy={seg2Y} r="10" fill={burgundy} stroke={gold} strokeWidth="2" opacity="0.85" />

          <line x1={seg2X} y1={seg2Y} x2={seg3X} y2={seg3Y} stroke={gold} strokeWidth="4" strokeLinecap="round" />
          <circle cx={seg3X} cy={seg3Y} r="8" fill={burgundy} stroke={gold} strokeWidth="2" opacity="0.7" />

          <line x1={seg3X} y1={seg3Y} x2={seg4X} y2={seg4Y} stroke={gold} strokeWidth="3" strokeLinecap="round" />
          <circle cx={seg4X} cy={seg4Y} r="6" fill={burgundy} stroke={gold} strokeWidth="2" opacity="0.55" />

          {/* Labels */}
          <text x="60" y="100" fontSize="11" fill={cream} opacity="0.8">Main mass</text>
          <text x="60" y="115" fontSize="11" fill={cream} opacity="0.8">leads</text>

          <text x="240" y="180" fontSize="11" fill={gold}>Tail drags</text>
          <text x="240" y="195" fontSize="11" fill={gold}>behind</text>

          <text x="160" y="230" fontSize="11" fill={`${cream}60`} textAnchor="middle">
            Each part follows at its own rate
          </text>
        </svg>
      );
    })(),

    // 6. Slow In & Slow Out - easing comparison
    6: (() => {
      const cycle = (frame % 120) / 120;
      const linearPos = cycle;
      // Ease in-out cubic
      const easedPos = cycle < 0.5
        ? 4 * cycle * cycle * cycle
        : 1 - Math.pow(-2 * cycle + 2, 3) / 2;

      return (
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* Linear motion */}
          <text x="45" y="45" fontSize="12" fill={gold} fontWeight="500">LINEAR</text>
          <text x="45" y="60" fontSize="10" fill={`${cream}50`}>Constant speed</text>

          <line x1="45" y1="80" x2="275" y2="80" stroke={gold} strokeWidth="1" opacity="0.3" />

          {/* Evenly spaced tick marks for linear */}
          {[0, 0.2, 0.4, 0.6, 0.8, 1].map((pos, i) => (
            <line key={i} x1={45 + pos * 230} y1="75" x2={45 + pos * 230} y2="85" stroke={gold} strokeWidth="1" opacity="0.5" />
          ))}

          <circle cx={45 + linearPos * 230} cy="80" r="14" fill={cream} stroke={gold} strokeWidth="2" opacity="0.6" />

          {/* Eased motion */}
          <text x="45" y="130" fontSize="12" fill={gold} fontWeight="500">EASED</text>
          <text x="45" y="145" fontSize="10" fill={`${cream}50`}>Slow in, slow out</text>

          <line x1="45" y1="165" x2="275" y2="165" stroke={gold} strokeWidth="1" opacity="0.3" />

          {/* Clustered tick marks for eased */}
          {[0, 0.02, 0.06, 0.15, 0.5, 0.85, 0.94, 0.98, 1].map((pos, i) => (
            <line key={i} x1={45 + pos * 230} y1="160" x2={45 + pos * 230} y2="170" stroke={gold} strokeWidth="1" opacity="0.5" />
          ))}

          <circle cx={45 + easedPos * 230} cy="165" r="14" fill={burgundy} stroke={gold} strokeWidth="2" />

          {/* Labels at ends */}
          <text x="45" y="200" fontSize="10" fill={cream} opacity="0.7">Slow out</text>
          <text x="255" y="200" fontSize="10" fill={cream} opacity="0.7">Slow in</text>

          <text x="160" y="228" fontSize="11" fill={`${cream}60`} textAnchor="middle">
            More drawings at start and end
          </text>
        </svg>
      );
    })(),

    // 7. Arcs - curved vs straight path
    7: (() => {
      const t = (frame % 100) / 100;
      const arcAngle = t * Math.PI;
      const arcX = 160 + Math.cos(arcAngle - Math.PI / 2) * 80;
      const arcY = 140 - Math.sin(arcAngle) * 90;

      return (
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* Straight path (wrong) */}
          <line
            x1="80"
            y1="140"
            x2="240"
            y2="140"
            stroke={`${cream}20`}
            strokeWidth="2"
            strokeDasharray="8 8"
          />
          <text x="160" y="160" fontSize="10" fill={`${cream}30`} textAnchor="middle">
            Mechanical (wrong)
          </text>

          {/* Arc path (correct) */}
          <path
            d="M80 140 Q160 30 240 140"
            fill="none"
            stroke={gold}
            strokeWidth="2"
            strokeDasharray="6 4"
          />

          {/* Position markers along arc */}
          {[0.15, 0.35, 0.5, 0.65, 0.85].map((pos, i) => {
            const a = pos * Math.PI;
            const px = 160 + Math.cos(a - Math.PI / 2) * 80;
            const py = 140 - Math.sin(a) * 90;
            return <circle key={i} cx={px} cy={py} r="4" fill={gold} opacity="0.4" />;
          })}

          {/* Moving ball */}
          <circle
            cx={arcX}
            cy={arcY}
            r="16"
            fill={burgundy}
            stroke={gold}
            strokeWidth="3"
          />

          {/* Labels */}
          <text x="160" y="25" fontSize="13" fill={gold} textAnchor="middle" fontWeight="500">
            NATURAL ARC
          </text>

          {/* Endpoints */}
          <circle cx="80" cy="140" r="6" fill={gold} opacity="0.5" />
          <circle cx="240" cy="140" r="6" fill={gold} opacity="0.5" />

          <text x="160" y="220" fontSize="11" fill={`${cream}60`} textAnchor="middle">
            Living things move in curves
          </text>
        </svg>
      );
    })(),

    // 8. Secondary Action - walking with arm swing
    8: (() => {
      const walkCycle = (frame % 60) / 60;
      const bodyBob = Math.sin(walkCycle * Math.PI * 2) * 5;
      const legSwing = Math.sin(walkCycle * Math.PI * 2) * 20;
      const armSwing = Math.sin(walkCycle * Math.PI * 2 - 0.8) * 35;

      return (
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* Ground */}
          <line x1="40" y1="200" x2="280" y2="200" stroke={gold} strokeWidth="2" opacity="0.5" />

          {/* Character */}
          <g transform={`translate(160, ${100 + bodyBob})`}>
            {/* Body */}
            <ellipse cx="0" cy="30" rx="28" ry="25" fill={burgundy} stroke={gold} strokeWidth="2" />

            {/* Head */}
            <circle cx="0" cy="-5" r="20" fill={burgundy} stroke={gold} strokeWidth="2" />
            <circle cx="-7" cy="-8" r="4" fill={cream} />
            <circle cx="7" cy="-8" r="4" fill={cream} />
            <path d="M-8 5 Q0 12 8 5" fill="none" stroke={cream} strokeWidth="2" />

            {/* Arm (secondary action) */}
            <line
              x1="0"
              y1="20"
              x2={Math.sin(armSwing * Math.PI / 180) * 35}
              y2={55 + Math.cos(armSwing * Math.PI / 180) * 25}
              stroke={gold}
              strokeWidth="5"
              strokeLinecap="round"
            />

            {/* Legs (main action) */}
            <line
              x1="-12"
              y1="52"
              x2={-20 + legSwing}
              y2="95"
              stroke={gold}
              strokeWidth="5"
              strokeLinecap="round"
            />
            <line
              x1="12"
              y1="52"
              x2={20 - legSwing}
              y2="95"
              stroke={gold}
              strokeWidth="5"
              strokeLinecap="round"
            />
          </g>

          {/* Labels */}
          <text x="60" y="80" fontSize="11" fill={cream}>MAIN ACTION:</text>
          <text x="60" y="95" fontSize="12" fill={gold} fontWeight="500">Walking</text>

          <text x="230" y="140" fontSize="11" fill={cream}>SECONDARY:</text>
          <text x="230" y="155" fontSize="12" fill={gold} fontWeight="500">Arm swing</text>

          <text x="160" y="230" fontSize="11" fill={`${cream}60`} textAnchor="middle">
            Supporting details add personality
          </text>
        </svg>
      );
    })(),

    // 9. Timing - weight through speed
    9: (() => {
      const fastCycle = ((frame * 3) % 120) / 120;
      const slowCycle = (frame % 120) / 120;

      return (
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* Fast/Light */}
          <text x="45" y="40" fontSize="12" fill={gold} fontWeight="500">FAST = LIGHT</text>
          <text x="200" y="40" fontSize="10" fill={`${cream}50`}>few frames</text>

          <line x1="45" y1="70" x2="275" y2="70" stroke={gold} strokeWidth="1" opacity="0.3" />

          {/* Small light ball moving fast */}
          <circle
            cx={45 + fastCycle * 230}
            cy="70"
            r="12"
            fill={cream}
            stroke={gold}
            strokeWidth="1.5"
            opacity="0.9"
          />
          {/* Motion blur effect */}
          <ellipse
            cx={45 + fastCycle * 230 - 15}
            cy="70"
            rx="20"
            ry="8"
            fill={cream}
            opacity="0.15"
          />

          {/* Slow/Heavy */}
          <text x="45" y="130" fontSize="12" fill={gold} fontWeight="500">SLOW = HEAVY</text>
          <text x="200" y="130" fontSize="10" fill={`${cream}50`}>many frames</text>

          <line x1="45" y1="165" x2="275" y2="165" stroke={gold} strokeWidth="1" opacity="0.3" />

          {/* Large heavy ball moving slow */}
          <circle
            cx={45 + slowCycle * 230}
            cy="165"
            r="22"
            fill={burgundy}
            stroke={gold}
            strokeWidth="3"
          />

          {/* Frame count indicators */}
          <text x="160" y="100" fontSize="10" fill={`${cream}40`} textAnchor="middle">↑ 4 frames to cross</text>
          <text x="160" y="200" fontSize="10" fill={`${cream}40`} textAnchor="middle">↑ 12 frames to cross</text>

          <text x="160" y="230" fontSize="11" fill={`${cream}60`} textAnchor="middle">
            Same distance, different weight
          </text>
        </svg>
      );
    })(),

    // 10. Exaggeration - normal vs pushed
    10: (() => {
      const pulse = (frame % 90) / 90;
      const showPushed = pulse > 0.5;
      const breathe = showPushed ? Math.sin(pulse * Math.PI * 4) * 0.08 + 1 : 1;

      return (
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* Normal version */}
          <text x="90" y="30" fontSize="12" fill={showPushed ? `${gold}60` : gold} textAnchor="middle" fontWeight="500">
            NORMAL
          </text>

          <g opacity={showPushed ? 0.4 : 1}>
            <circle cx="90" cy="100" r="40" fill={burgundy} stroke={gold} strokeWidth="2" />
            <circle cx="80" cy="90" r="6" fill={cream} />
            <circle cx="100" cy="90" r="6" fill={cream} />
            <circle cx="80" cy="92" r="2" fill="#0a1019" />
            <circle cx="100" cy="92" r="2" fill="#0a1019" />
            <path d="M75 115 Q90 125 105 115" fill="none" stroke={cream} strokeWidth="3" />
          </g>

          {/* Arrow */}
          <path d="M145 100 L175 100 M168 93 L175 100 L168 107" fill="none" stroke={gold} strokeWidth="2" opacity={showPushed ? 1 : 0.4} />
          <text x="160" y="130" fontSize="10" fill={gold} textAnchor="middle">PUSH IT</text>

          {/* Exaggerated version */}
          <text x="230" y="30" fontSize="12" fill={showPushed ? gold : `${gold}60`} textAnchor="middle" fontWeight="500">
            EXAGGERATED
          </text>

          <g opacity={showPushed ? 1 : 0.4} transform={`translate(230, 100) scale(${breathe})`}>
            <ellipse cx="0" cy="0" rx="50" ry="42" fill={burgundy} stroke={gold} strokeWidth="3" />
            <ellipse cx="-15" cy="-12" rx="12" ry="15" fill={cream} />
            <ellipse cx="15" cy="-12" rx="12" ry="15" fill={cream} />
            <circle cx="-12" cy="-8" r="5" fill="#0a1019" />
            <circle cx="18" cy="-8" r="5" fill="#0a1019" />
            {/* Sparkle in eyes */}
            <circle cx="-8" cy="-12" r="3" fill={cream} />
            <circle cx="22" cy="-12" r="3" fill={cream} />
            <path d="M-22 22 Q0 42 22 22" fill="none" stroke={cream} strokeWidth="5" />
          </g>

          <text x="160" y="200" fontSize="11" fill={`${cream}60`} textAnchor="middle">
            Amplify the essence to make it read
          </text>
        </svg>
      );
    })(),

    // 11. Solid Drawing - 3D form demonstration
    11: (() => {
      const rotation = frame * 1.5;
      const rotRad = (rotation * Math.PI) / 180;

      return (
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          <text x="160" y="30" fontSize="13" fill={gold} textAnchor="middle" fontWeight="500">
            UNDERSTAND 3D FORM
          </text>

          {/* Construction lines */}
          <g opacity="0.25">
            <ellipse cx="160" cy="115" rx="70" ry="25" fill="none" stroke={gold} strokeDasharray="4 4" />
            <line x1="160" y1="45" x2="160" y2="185" stroke={gold} strokeDasharray="4 4" />
            <line x1="90" y1="115" x2="230" y2="115" stroke={gold} strokeDasharray="4 4" />
          </g>

          {/* 3D sphere */}
          <circle cx="160" cy="115" r="60" fill={burgundy} stroke={gold} strokeWidth="3" />

          {/* Rotating latitude line */}
          <ellipse
            cx="160"
            cy="115"
            rx={60 * Math.abs(Math.cos(rotRad))}
            ry="60"
            fill="none"
            stroke={cream}
            strokeWidth="2"
            opacity="0.5"
            transform="rotate(90 160 115)"
          />

          {/* Equator */}
          <ellipse
            cx="160"
            cy="115"
            rx="60"
            ry={20 * Math.cos(rotRad * 0.5)}
            fill="none"
            stroke={cream}
            strokeWidth="1.5"
            opacity="0.4"
          />

          {/* Highlight for volume */}
          <ellipse cx="135" cy="90" rx="18" ry="14" fill={cream} opacity="0.2" />

          {/* Labels */}
          <text x="70" y="80" fontSize="10" fill={cream} opacity="0.7">Form</text>
          <text x="230" y="100" fontSize="10" fill={cream} opacity="0.7">Volume</text>
          <text x="160" y="200" fontSize="10" fill={cream} opacity="0.7" textAnchor="middle">Weight</text>

          <text x="160" y="225" fontSize="11" fill={`${cream}60`} textAnchor="middle">
            Characters exist in 3D space
          </text>
        </svg>
      );
    })(),

    // 12. Appeal - appealing character design
    12: (() => {
      const blink = frame % 120 < 6;
      const breathe = Math.sin(frame * 0.08) * 3;

      return (
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          <text x="160" y="25" fontSize="13" fill={gold} textAnchor="middle" fontWeight="500">
            APPEALING DESIGN
          </text>

          {/* Character with appeal */}
          <g transform={`translate(160, ${105 + breathe})`}>
            {/* Big head (appealing proportion) */}
            <ellipse cx="0" cy="0" rx="55" ry="48" fill={burgundy} stroke={gold} strokeWidth="3" />

            {/* Big expressive eyes */}
            {!blink ? (
              <>
                <ellipse cx="-18" cy="-8" rx="16" ry="20" fill={cream} />
                <ellipse cx="18" cy="-8" rx="16" ry="20" fill={cream} />
                <circle cx="-14" cy="-4" r="8" fill="#0a1019" />
                <circle cx="22" cy="-4" r="8" fill="#0a1019" />
                {/* Sparkle */}
                <circle cx="-10" cy="-10" r="4" fill={cream} />
                <circle cx="26" cy="-10" r="4" fill={cream} />
              </>
            ) : (
              <>
                <path d="M-34 -8 Q-18 2 -2 -8" fill="none" stroke={cream} strokeWidth="3" />
                <path d="M2 -8 Q18 2 34 -8" fill="none" stroke={cream} strokeWidth="3" />
              </>
            )}

            {/* Small cute nose */}
            <ellipse cx="0" cy="15" rx="5" ry="3" fill={gold} opacity="0.6" />

            {/* Friendly smile */}
            <path d="M-20 28 Q0 45 20 28" fill="none" stroke={cream} strokeWidth="4" strokeLinecap="round" />

            {/* Small body */}
            <ellipse cx="0" cy="75" rx="30" ry="22" fill={burgundy} stroke={gold} strokeWidth="2" />
          </g>

          {/* Design principle labels */}
          <text x="45" y="70" fontSize="10" fill={gold}>Big eyes</text>
          <text x="45" y="85" fontSize="9" fill={`${cream}60`}>expressive</text>

          <text x="250" y="70" fontSize="10" fill={gold}>Round shapes</text>
          <text x="250" y="85" fontSize="9" fill={`${cream}60`}>friendly</text>

          <text x="45" y="170" fontSize="10" fill={gold}>Big head</text>
          <text x="45" y="185" fontSize="9" fill={`${cream}60`}>appealing ratio</text>

          <text x="250" y="170" fontSize="10" fill={gold}>Personality</text>
          <text x="250" y="185" fontSize="9" fill={`${cream}60`}>charisma</text>

          <text x="160" y="230" fontSize="11" fill={`${cream}60`} textAnchor="middle">
            Characters people want to watch
          </text>
        </svg>
      );
    })(),
  };

  return (
    <div
      style={{
        width: W,
        height: H,
        background: `linear-gradient(180deg, ${burgundy}15, ${burgundy}08)`,
        borderRadius: 12,
        border: `1px solid ${gold}25`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {demos[principleNumber]}
    </div>
  );
};

export const JazzPrincipleCard: React.FC<JazzPrincipleCardProps> = ({
  principle,
  gold,
  cream,
  burgundy,
  totalPrinciples,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Timing for 10 seconds (300 frames):
  // 0-30: Number and name fade in
  // 30-60: Demo appears
  // 60-100: First explanation line
  // 100-140: Second line
  // 140-180: Third line
  // 180-220: Tip appears
  // 220-270: Let it breathe
  // 270-300: Fade out

  const numberOpacity = interpolate(frame, [0, 25], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const titleSpring = spring({
    fps,
    frame: frame - 5,
    config: { damping: 20, mass: 0.9 },
  });

  const demoOpacity = interpolate(frame, [25, 50], [0, 1], {
    extrapolateRight: "clamp",
  });

  const demoScale = interpolate(frame, [25, 55], [0.95, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const line1Opacity = interpolate(frame, [55, 80], [0, 1], {
    extrapolateRight: "clamp",
  });

  const line2Opacity = interpolate(frame, [90, 115], [0, 1], {
    extrapolateRight: "clamp",
  });

  const line3Opacity = interpolate(frame, [125, 150], [0, 1], {
    extrapolateRight: "clamp",
  });

  const tipOpacity = interpolate(frame, [165, 195], [0, 1], {
    extrapolateRight: "clamp",
  });

  const exitOpacity = interpolate(frame, [270, 300], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        padding: "45px 55px",
        opacity: exitOpacity,
      }}
    >
      {/* Top section: Number and Title */}
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 25,
          marginBottom: 25,
        }}
      >
        {/* Large principle number */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 200,
            color: gold,
            lineHeight: 1,
            opacity: numberOpacity,
            minWidth: 100,
          }}
        >
          {String(principle.number).padStart(2, "0")}
        </div>

        {/* Title block */}
        <div
          style={{
            transform: `translateY(${(1 - titleSpring) * 15}px)`,
            opacity: titleSpring,
          }}
        >
          <div
            style={{
              fontSize: 36,
              fontWeight: 400,
              color: cream,
              letterSpacing: 1,
              lineHeight: 1.1,
            }}
          >
            {principle.name}
          </div>
          <div
            style={{
              fontSize: 15,
              color: gold,
              fontStyle: "italic",
              marginTop: 6,
              letterSpacing: 2,
            }}
          >
            {principle.subtitle}
          </div>
        </div>
      </div>

      {/* Main content: Demo (hero) + Text */}
      <div
        style={{
          display: "flex",
          gap: 45,
          flex: 1,
          alignItems: "center",
        }}
      >
        {/* Demo - THE HERO */}
        <div
          style={{
            opacity: demoOpacity,
            transform: `scale(${demoScale})`,
            flexShrink: 0,
          }}
        >
          <PrincipleDemo
            principleNumber={principle.number}
            frame={frame}
            gold={gold}
            cream={cream}
            burgundy={burgundy}
          />
        </div>

        {/* Explanation text - appears line by line */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 18,
            flex: 1,
          }}
        >
          {principle.lines.map((line, i) => (
            <div
              key={i}
              style={{
                fontSize: 19,
                color: `${cream}dd`,
                lineHeight: 1.5,
                opacity: [line1Opacity, line2Opacity, line3Opacity][i],
                transform: `translateX(${(1 - [line1Opacity, line2Opacity, line3Opacity][i]) * 20}px)`,
              }}
            >
              {line}
            </div>
          ))}

          {/* Tip */}
          <div
            style={{
              marginTop: 20,
              padding: "16px 20px",
              background: `${gold}12`,
              borderLeft: `3px solid ${gold}`,
              borderRadius: "0 8px 8px 0",
              opacity: tipOpacity,
              transform: `translateX(${(1 - tipOpacity) * 15}px)`,
            }}
          >
            <div
              style={{
                fontSize: 11,
                letterSpacing: 3,
                color: gold,
                textTransform: "uppercase",
                marginBottom: 8,
              }}
            >
              Animator's Tip
            </div>
            <div
              style={{
                fontSize: 15,
                color: `${cream}bb`,
                lineHeight: 1.5,
                fontStyle: "italic",
              }}
            >
              {principle.tip}
            </div>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div
        style={{
          position: "absolute",
          bottom: 35,
          left: 55,
          right: 55,
          display: "flex",
          alignItems: "center",
          gap: 15,
        }}
      >
        <div
          style={{
            fontSize: 12,
            color: `${cream}50`,
            minWidth: 50,
          }}
        >
          {principle.number} / {totalPrinciples}
        </div>
        <div
          style={{
            flex: 1,
            display: "flex",
            gap: 6,
          }}
        >
          {[...Array(totalPrinciples)].map((_, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: 3,
                borderRadius: 2,
                background: i < principle.number ? gold : `${cream}15`,
                opacity: i === principle.number - 1 ? 1 : 0.7,
              }}
            />
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};
