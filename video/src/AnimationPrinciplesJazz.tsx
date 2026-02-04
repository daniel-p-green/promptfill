import React from "react";
import {
  AbsoluteFill,
  Sequence,
  interpolate,
  useCurrentFrame,
  Easing,
} from "remotion";

export type AnimationPrinciplesJazzProps = {
  accent: string;
};

const PRINCIPLES = [
  {
    number: 1,
    name: "Squash & Stretch",
    description: "Objects deform when they move. Volume stays constant.",
  },
  {
    number: 2,
    name: "Anticipation",
    description: "Every action has a wind-up. It prepares the viewer.",
  },
  {
    number: 3,
    name: "Staging",
    description: "Present one idea clearly. Direct the viewer's eye.",
  },
  {
    number: 4,
    name: "Straight Ahead & Pose to Pose",
    description: "Two approaches: spontaneous or planned keyframes.",
  },
  {
    number: 5,
    name: "Follow Through",
    description: "Nothing stops all at once. Parts move at different rates.",
  },
  {
    number: 6,
    name: "Slow In & Slow Out",
    description: "Movement eases in and out. More frames at start and end.",
  },
  {
    number: 7,
    name: "Arcs",
    description: "Natural motion follows curves, not straight lines.",
  },
  {
    number: 8,
    name: "Secondary Action",
    description: "Supporting movements enrich without distracting.",
  },
  {
    number: 9,
    name: "Timing",
    description: "Speed conveys weight. Fast is light, slow is heavy.",
  },
  {
    number: 10,
    name: "Exaggeration",
    description: "Push the truth further. Subtlety reads as nothing.",
  },
  {
    number: 11,
    name: "Solid Drawing",
    description: "Understand 3D form, weight, and volume.",
  },
  {
    number: 12,
    name: "Appeal",
    description: "Create characters people want to watch.",
  },
];

// Title card
const TitleCard: React.FC<{ accent: string }> = ({ accent }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: "clamp" });
  const exitOpacity = interpolate(frame, [240, 270], [1, 0], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#fafafa",
        justifyContent: "center",
        alignItems: "center",
        opacity: exitOpacity,
      }}
    >
      <div style={{ opacity, textAlign: "center" }}>
        <div style={{ fontSize: 18, letterSpacing: 4, color: "#666", marginBottom: 20 }}>
          THE
        </div>
        <h1 style={{ fontSize: 72, fontWeight: 600, color: "#111", margin: 0, letterSpacing: -1 }}>
          12 Principles
        </h1>
        <div style={{ fontSize: 18, letterSpacing: 4, color: "#666", marginTop: 20 }}>
          OF ANIMATION
        </div>
        <div
          style={{
            width: 60,
            height: 3,
            backgroundColor: accent,
            margin: "40px auto",
            borderRadius: 2,
          }}
        />
        <div style={{ fontSize: 16, color: "#888", marginTop: 10 }}>
          Frank Thomas & Ollie Johnston
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Individual principle demonstration
const PrincipleCard: React.FC<{
  principle: typeof PRINCIPLES[0];
  accent: string;
}> = ({ principle, accent }) => {
  const frame = useCurrentFrame();

  const enterOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const exitOpacity = interpolate(frame, [280, 315], [1, 0], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#fafafa",
        padding: 60,
        opacity: enterOpacity * exitOpacity,
      }}
    >
      {/* Number */}
      <div
        style={{
          position: "absolute",
          top: 50,
          right: 60,
          fontSize: 120,
          fontWeight: 200,
          color: "#eee",
        }}
      >
        {String(principle.number).padStart(2, "0")}
      </div>

      {/* Content */}
      <div style={{ display: "flex", height: "100%", alignItems: "center", gap: 80 }}>
        {/* Demo */}
        <div
          style={{
            width: 500,
            height: 400,
            backgroundColor: "#fff",
            borderRadius: 16,
            border: "1px solid #e5e5e5",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Demo num={principle.number} frame={frame} accent={accent} />
        </div>

        {/* Text */}
        <div style={{ flex: 1 }}>
          <h2
            style={{
              fontSize: 48,
              fontWeight: 600,
              color: "#111",
              margin: 0,
              marginBottom: 20,
            }}
          >
            {principle.name}
          </h2>
          <p
            style={{
              fontSize: 24,
              color: "#555",
              lineHeight: 1.5,
              margin: 0,
            }}
          >
            {principle.description}
          </p>
        </div>
      </div>

      {/* Progress */}
      <div
        style={{
          position: "absolute",
          bottom: 40,
          left: 60,
          right: 60,
          height: 3,
          backgroundColor: "#eee",
          borderRadius: 2,
        }}
      >
        <div
          style={{
            width: `${(principle.number / 12) * 100}%`,
            height: "100%",
            backgroundColor: accent,
            borderRadius: 2,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

// Clean, teaching-focused demos
const Demo: React.FC<{ num: number; frame: number; accent: string }> = ({
  num,
  frame,
  accent,
}) => {
  const demos: Record<number, React.ReactNode> = {
    // Squash & Stretch - the ball says it all
    1: (() => {
      const t = (frame % 60) / 60;
      const y = Math.abs(Math.sin(t * Math.PI));
      const posY = 50 + (1 - y) * 220;
      const impact = Math.max(0, 1 - (270 - posY) / 50);
      const squash = 1 + impact * 0.4;
      const stretch = y > 0.85 ? 1 + (y - 0.85) * 3 : 1;

      return (
        <svg width="400" height="320" viewBox="0 0 400 320">
          <line x1="50" y1="290" x2="350" y2="290" stroke="#ddd" strokeWidth="2" />
          <ellipse
            cx="200"
            cy={posY}
            rx={50 * squash / stretch}
            ry={50 / squash * stretch}
            fill={accent}
          />
        </svg>
      );
    })(),

    // Anticipation - crouch before jump
    2: (() => {
      const t = (frame % 90) / 90;
      let y = 200;
      let scaleY = 1;

      if (t < 0.4) {
        // Crouch (anticipation)
        const crouch = Math.sin((t / 0.4) * Math.PI * 0.5);
        y = 200 + crouch * 30;
        scaleY = 1 - crouch * 0.2;
      } else if (t < 0.55) {
        // Jump
        const jump = (t - 0.4) / 0.15;
        y = 230 - jump * 180;
        scaleY = 1 + jump * 0.2;
      } else if (t < 0.7) {
        // Fall
        const fall = (t - 0.55) / 0.15;
        y = 50 + fall * 180;
        scaleY = 1.2 - fall * 0.2;
      } else {
        // Land
        const land = (t - 0.7) / 0.3;
        const settle = Math.sin((1 - land) * Math.PI * 0.5);
        y = 230 - settle * 20;
        scaleY = 1 - settle * 0.1;
      }

      return (
        <svg width="400" height="320" viewBox="0 0 400 320">
          <line x1="50" y1="290" x2="350" y2="290" stroke="#ddd" strokeWidth="2" />
          <g transform={`translate(200, ${y})`}>
            <ellipse cx="0" cy="0" rx="40" ry={50 * scaleY} fill={accent} />
            <circle cx="-12" cy="-15" r="6" fill="#fff" />
            <circle cx="12" cy="-15" r="6" fill="#fff" />
          </g>
          {t < 0.4 && t > 0.15 && (
            <text x="300" y="220" fontSize="14" fill="#999">anticipation</text>
          )}
        </svg>
      );
    })(),

    // Staging - spotlight
    3: (() => {
      const spotX = 200 + Math.sin(frame * 0.04) * 100;
      const inSpot = Math.abs(spotX - 200) < 60;

      return (
        <svg width="400" height="320" viewBox="0 0 400 320">
          <defs>
            <linearGradient id="spot" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={accent} stopOpacity="0.2" />
              <stop offset="100%" stopColor={accent} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={`M${spotX} 0 L${spotX - 80} 320 L${spotX + 80} 320 Z`} fill="url(#spot)" />
          <circle cx="120" cy="220" r="30" fill={inSpot ? "#ddd" : "#eee"} />
          <circle cx="200" cy="220" r="35" fill={inSpot ? accent : "#ccc"} />
          <circle cx="280" cy="220" r="30" fill={inSpot ? "#ddd" : "#eee"} />
          <text x="200" y="290" fontSize="14" fill="#999" textAnchor="middle">
            {inSpot ? "clear focus" : ""}
          </text>
        </svg>
      );
    })(),

    // Straight Ahead vs Pose to Pose
    4: (() => {
      const t = (frame % 120) / 120;

      return (
        <svg width="400" height="320" viewBox="0 0 400 320">
          <text x="50" y="50" fontSize="14" fill="#999">straight ahead</text>
          <path
            d={`M50 100 ${[...Array(Math.floor(t * 15))].map((_, i) => {
              const x = 50 + i * 20;
              const y = 100 + Math.sin(i * 0.5 + frame * 0.03) * 25;
              return `L${x} ${y}`;
            }).join(" ")}`}
            fill="none"
            stroke={accent}
            strokeWidth="3"
          />
          <circle cx={50 + t * 300} cy={100 + Math.sin(t * 7 + frame * 0.03) * 25} r="12" fill={accent} />

          <text x="50" y="180" fontSize="14" fill="#999">pose to pose</text>
          <line x1="50" y1="220" x2="350" y2="220" stroke="#eee" strokeWidth="2" strokeDasharray="5 5" />
          {[0, 0.33, 0.66, 1].map((p, i) => (
            <circle
              key={i}
              cx={50 + p * 300}
              cy="220"
              r="15"
              fill={t >= p ? accent : "none"}
              stroke={accent}
              strokeWidth="2"
            />
          ))}
          <text x="50" y="260" fontSize="12" fill="#bbb">A</text>
          <text x="145" y="260" fontSize="12" fill="#bbb">B</text>
          <text x="245" y="260" fontSize="12" fill="#bbb">C</text>
          <text x="345" y="260" fontSize="12" fill="#bbb">D</text>
        </svg>
      );
    })(),

    // Follow Through - pendulum
    5: (() => {
      const swing = Math.sin(frame * 0.06);
      const d1 = Math.sin(frame * 0.06 - 0.6);
      const d2 = Math.sin(frame * 0.06 - 1.2);

      return (
        <svg width="400" height="320" viewBox="0 0 400 320">
          <circle cx="200" cy="30" r="8" fill="#ddd" />
          <line x1="200" y1="30" x2={200 + swing * 80} y2="130" stroke="#999" strokeWidth="3" />
          <circle cx={200 + swing * 80} cy="130" r="25" fill={accent} />
          <line x1={200 + swing * 80} y1="130" x2={200 + swing * 80 + d1 * 50} y2="200" stroke="#999" strokeWidth="2" />
          <circle cx={200 + swing * 80 + d1 * 50} cy="200" r="18" fill={accent} opacity="0.7" />
          <line x1={200 + swing * 80 + d1 * 50} y1="200" x2={200 + swing * 80 + d1 * 50 + d2 * 35} y2="255" stroke="#999" strokeWidth="2" />
          <circle cx={200 + swing * 80 + d1 * 50 + d2 * 35} cy="255" r="12" fill={accent} opacity="0.5" />
          <text x="50" y="290" fontSize="12" fill="#bbb">each part follows with delay</text>
        </svg>
      );
    })(),

    // Slow In & Slow Out
    6: (() => {
      const t = (frame % 90) / 90;
      const linear = t;
      const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

      return (
        <svg width="400" height="320" viewBox="0 0 400 320">
          <text x="50" y="80" fontSize="14" fill="#999">linear</text>
          <line x1="50" y1="110" x2="350" y2="110" stroke="#eee" strokeWidth="2" />
          <circle cx={50 + linear * 300} cy="110" r="15" fill="#ccc" />

          <text x="50" y="190" fontSize="14" fill="#999">eased</text>
          <line x1="50" y1="220" x2="350" y2="220" stroke="#eee" strokeWidth="2" />
          <circle cx={50 + eased * 300} cy="220" r="15" fill={accent} />

          <text x="50" y="280" fontSize="12" fill="#bbb">same time, different feel</text>
        </svg>
      );
    })(),

    // Arcs
    7: (() => {
      const t = (frame % 80) / 80;
      const angle = t * Math.PI;
      const x = 200 + Math.cos(angle - Math.PI / 2) * 130;
      const y = 200 - Math.sin(angle) * 140;

      return (
        <svg width="400" height="320" viewBox="0 0 400 320">
          <line x1="70" y1="200" x2="330" y2="200" stroke="#eee" strokeWidth="2" strokeDasharray="5 5" />
          <text x="200" y="225" fontSize="12" fill="#ccc" textAnchor="middle">straight (wrong)</text>
          <path d="M70 200 Q200 40 330 200" fill="none" stroke={accent} strokeWidth="2" strokeDasharray="8 4" />
          <circle cx={x} cy={y} r="20" fill={accent} />
          <circle cx="70" cy="200" r="8" fill="#ddd" />
          <circle cx="330" cy="200" r="8" fill="#ddd" />
        </svg>
      );
    })(),

    // Secondary Action
    8: (() => {
      const walk = (frame % 40) / 40;
      const bob = Math.sin(walk * Math.PI * 2) * 8;
      const arm = Math.sin(walk * Math.PI * 2 - 0.8) * 35;
      const leg = Math.sin(walk * Math.PI * 2) * 20;

      return (
        <svg width="400" height="320" viewBox="0 0 400 320">
          <line x1="50" y1="280" x2="350" y2="280" stroke="#ddd" strokeWidth="2" />
          <g transform={`translate(200, ${150 + bob})`}>
            <ellipse cx="0" cy="30" rx="35" ry="30" fill={accent} />
            <circle cx="0" cy="-10" r="28" fill={accent} />
            <circle cx="-10" cy="-15" r="5" fill="#fff" />
            <circle cx="10" cy="-15" r="5" fill="#fff" />
            <line x1="0" y1="20" x2={Math.sin(arm * Math.PI / 180) * 40} y2={60 + Math.cos(arm * Math.PI / 180) * 25} stroke="#888" strokeWidth="5" strokeLinecap="round" />
            <line x1="-12" y1="58" x2={-18 + leg} y2="115" stroke="#888" strokeWidth="5" strokeLinecap="round" />
            <line x1="12" y1="58" x2={18 - leg} y2="115" stroke="#888" strokeWidth="5" strokeLinecap="round" />
          </g>
          <text x="310" y="130" fontSize="12" fill="#bbb">arm swing</text>
          <text x="310" y="145" fontSize="12" fill="#bbb">(secondary)</text>
        </svg>
      );
    })(),

    // Timing
    9: (() => {
      const fast = ((frame * 3) % 90) / 90;
      const slow = (frame % 90) / 90;

      return (
        <svg width="400" height="320" viewBox="0 0 400 320">
          <text x="50" y="70" fontSize="14" fill="#999">fast = light</text>
          <line x1="50" y1="100" x2="350" y2="100" stroke="#eee" strokeWidth="2" />
          <circle cx={50 + fast * 300} cy="100" r="12" fill="#ccc" />

          <text x="50" y="180" fontSize="14" fill="#999">slow = heavy</text>
          <line x1="50" y1="210" x2="350" y2="210" stroke="#eee" strokeWidth="2" />
          <circle cx={50 + slow * 300} cy="210" r="25" fill={accent} />

          <text x="200" y="280" fontSize="12" fill="#bbb" textAnchor="middle">same distance</text>
        </svg>
      );
    })(),

    // Exaggeration
    10: (() => {
      const t = (frame % 80) / 80;
      const show = t > 0.5;
      const pulse = show ? 1 + Math.sin(t * Math.PI * 6) * 0.05 : 1;

      return (
        <svg width="400" height="320" viewBox="0 0 400 320">
          <text x="120" y="40" fontSize="14" fill="#999" textAnchor="middle">normal</text>
          <g opacity={show ? 0.4 : 1}>
            <circle cx="120" cy="150" r="50" fill="#ddd" />
            <circle cx="108" cy="140" r="8" fill="#fff" />
            <circle cx="132" cy="140" r="8" fill="#fff" />
            <path d="M100 165 Q120 180 140 165" fill="none" stroke="#fff" strokeWidth="3" />
          </g>

          <text x="280" y="40" fontSize="14" fill="#999" textAnchor="middle">exaggerated</text>
          <g transform={`translate(280, 150) scale(${pulse})`} opacity={show ? 1 : 0.4}>
            <ellipse cx="0" cy="0" rx="60" ry="50" fill={accent} />
            <ellipse cx="-18" cy="-12" rx="14" ry="18" fill="#fff" />
            <ellipse cx="18" cy="-12" rx="14" ry="18" fill="#fff" />
            <circle cx="-14" cy="-8" r="6" fill="#333" />
            <circle cx="22" cy="-8" r="6" fill="#333" />
            <path d="M-25 20 Q0 45 25 20" fill="none" stroke="#fff" strokeWidth="5" />
          </g>
        </svg>
      );
    })(),

    // Solid Drawing
    11: (() => {
      const rot = frame * 1.5;

      return (
        <svg width="400" height="320" viewBox="0 0 400 320">
          <g opacity="0.2">
            <line x1="200" y1="40" x2="200" y2="280" stroke="#999" strokeDasharray="4 4" />
            <line x1="80" y1="160" x2="320" y2="160" stroke="#999" strokeDasharray="4 4" />
            <ellipse cx="200" cy="160" rx="110" ry="40" fill="none" stroke="#999" strokeDasharray="4 4" />
          </g>
          <circle cx="200" cy="160" r="90" fill={accent} />
          <ellipse
            cx="200"
            cy="160"
            rx={90 * Math.abs(Math.cos(rot * Math.PI / 180))}
            ry="90"
            fill="none"
            stroke="#fff"
            strokeWidth="2"
            opacity="0.5"
            transform="rotate(90 200 160)"
          />
          <ellipse cx="170" cy="130" rx="25" ry="18" fill="#fff" opacity="0.2" />
          <text x="200" y="290" fontSize="12" fill="#bbb" textAnchor="middle">form, volume, weight</text>
        </svg>
      );
    })(),

    // Appeal
    12: (() => {
      const blink = frame % 90 < 5;
      const breathe = Math.sin(frame * 0.08) * 3;

      return (
        <svg width="400" height="320" viewBox="0 0 400 320">
          <g transform={`translate(200, ${140 + breathe})`}>
            <ellipse cx="0" cy="0" rx="70" ry="60" fill={accent} />
            {!blink ? (
              <>
                <ellipse cx="-22" cy="-10" rx="18" ry="24" fill="#fff" />
                <ellipse cx="22" cy="-10" rx="18" ry="24" fill="#fff" />
                <circle cx="-18" cy="-5" r="9" fill="#333" />
                <circle cx="26" cy="-5" r="9" fill="#333" />
                <circle cx="-12" cy="-12" r="5" fill="#fff" />
                <circle cx="32" cy="-12" r="5" fill="#fff" />
              </>
            ) : (
              <>
                <path d="M-40 -10 Q-22 5 -4 -10" fill="none" stroke="#fff" strokeWidth="3" />
                <path d="M4 -10 Q22 5 40 -10" fill="none" stroke="#fff" strokeWidth="3" />
              </>
            )}
            <path d="M-25 25 Q0 45 25 25" fill="none" stroke="#fff" strokeWidth="4" />
            <ellipse cx="0" cy="90" rx="35" ry="25" fill={accent} opacity="0.8" />
          </g>
          <text x="60" y="100" fontSize="12" fill="#bbb">big eyes</text>
          <text x="300" y="100" fontSize="12" fill="#bbb">simple shapes</text>
          <text x="200" y="290" fontSize="12" fill="#bbb" textAnchor="middle">personality</text>
        </svg>
      );
    })(),
  };

  return <>{demos[num]}</>;
};

// Closing card
const ClosingCard: React.FC<{ accent: string }> = ({ accent }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [300, 360], [1, 0], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#fafafa",
        justifyContent: "center",
        alignItems: "center",
        opacity: opacity * fadeOut,
      }}
    >
      <div style={{ textAlign: "center", maxWidth: 700 }}>
        <div style={{ fontSize: 100, fontWeight: 200, color: accent, marginBottom: 20 }}>
          12
        </div>
        <h2 style={{ fontSize: 36, fontWeight: 600, color: "#111", margin: 0 }}>
          Principles of Animation
        </h2>
        <div
          style={{
            width: 60,
            height: 3,
            backgroundColor: accent,
            margin: "40px auto",
            borderRadius: 2,
          }}
        />
        <p style={{ fontSize: 20, color: "#666", lineHeight: 1.6, fontStyle: "italic" }}>
          "You're not supposed to animate drawings.
          <br />
          You're supposed to animate feelings."
        </p>
        <p style={{ fontSize: 14, color: "#999", marginTop: 20 }}>
          — Ollie Johnston
        </p>
        <p style={{ fontSize: 14, color: "#bbb", marginTop: 40 }}>
          The Illusion of Life · 1981
        </p>
      </div>
    </AbsoluteFill>
  );
};

export const AnimationPrinciplesJazz: React.FC<AnimationPrinciplesJazzProps> = ({
  accent,
}) => {
  const TITLE_DURATION = 9 * 30;
  const PRINCIPLE_DURATION = 10.5 * 30;
  const CLOSING_DURATION = 12 * 30;

  return (
    <AbsoluteFill style={{ backgroundColor: "#fafafa" }}>
      <Sequence from={0} durationInFrames={TITLE_DURATION}>
        <TitleCard accent={accent} />
      </Sequence>

      {PRINCIPLES.map((p, i) => (
        <Sequence
          key={p.number}
          from={TITLE_DURATION + i * PRINCIPLE_DURATION}
          durationInFrames={PRINCIPLE_DURATION}
        >
          <PrincipleCard principle={p} accent={accent} />
        </Sequence>
      ))}

      <Sequence
        from={TITLE_DURATION + PRINCIPLES.length * PRINCIPLE_DURATION}
        durationInFrames={CLOSING_DURATION}
      >
        <ClosingCard accent={accent} />
      </Sequence>
    </AbsoluteFill>
  );
};
