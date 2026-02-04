import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

type Principle = {
  number: number;
  name: string;
  description: string;
};

// Hand-drawn style demo animations
const ClassicDemo: React.FC<{
  principle: Principle;
  accentWarm: string;
  accentCool: string;
  frame: number;
}> = ({ principle, accentWarm, accentCool, frame }) => {
  const inkColor = "#2c1810";
  const sketchColor = "#5c4a32";

  const demos: Record<number, React.ReactNode> = {
    // Squash & Stretch - classic flour sack
    1: (() => {
      const bounce = Math.abs(Math.sin(frame * 0.12));
      const squash = 1 + (1 - bounce) * 0.4;
      return (
        <svg width="100" height="90" viewBox="0 0 100 90">
          {/* Ground line */}
          <line
            x1="10"
            y1="80"
            x2="90"
            y2="80"
            stroke={sketchColor}
            strokeWidth="1.5"
            strokeDasharray="4 3"
          />
          {/* Flour sack body */}
          <ellipse
            cx="50"
            cy={75 - bounce * 35}
            rx={18 * squash}
            ry={25 / squash}
            fill="none"
            stroke={inkColor}
            strokeWidth="2.5"
          />
          {/* Eyes */}
          <circle
            cx={44}
            cy={68 - bounce * 35}
            r="3"
            fill={inkColor}
          />
          <circle
            cx={56}
            cy={68 - bounce * 35}
            r="3"
            fill={inkColor}
          />
          {/* Motion lines */}
          {bounce < 0.5 && (
            <>
              <line
                x1="35"
                y1={45 - bounce * 35}
                x2="35"
                y2={60 - bounce * 35}
                stroke={sketchColor}
                strokeWidth="1"
                opacity={0.5}
              />
              <line
                x1="65"
                y1={45 - bounce * 35}
                x2="65"
                y2={60 - bounce * 35}
                stroke={sketchColor}
                strokeWidth="1"
                opacity={0.5}
              />
            </>
          )}
        </svg>
      );
    })(),

    // Anticipation - character wind-up
    2: (() => {
      const phase = (frame % 90) / 90;
      const windUp = phase < 0.4 ? phase / 0.4 : 0;
      const release = phase >= 0.4 && phase < 0.6 ? (phase - 0.4) / 0.2 : 0;
      // settle phase is implicit (after release)
      return (
        <svg width="100" height="90" viewBox="0 0 100 90">
          {/* Ground */}
          <line
            x1="10"
            y1="80"
            x2="90"
            y2="80"
            stroke={sketchColor}
            strokeWidth="1.5"
          />
          {/* Body */}
          <ellipse
            cx={40 + release * 35 - windUp * 10}
            cy={60}
            rx="18"
            ry="16"
            fill="none"
            stroke={inkColor}
            strokeWidth="2"
            transform={`rotate(${-windUp * 15 + release * 5}, ${40 + release * 35 - windUp * 10}, 60)`}
          />
          {/* Head */}
          <circle
            cx={40 + release * 35 - windUp * 15}
            cy={40}
            r="12"
            fill="none"
            stroke={inkColor}
            strokeWidth="2"
          />
          {/* Eye */}
          <circle
            cx={44 + release * 35 - windUp * 15}
            cy={38}
            r="2"
            fill={inkColor}
          />
          {/* Anticipation arrow */}
          {windUp > 0.3 && release === 0 && (
            <path
              d="M20 50 L10 50 L15 45 M10 50 L15 55"
              fill="none"
              stroke={accentWarm}
              strokeWidth="2"
              opacity={windUp}
            />
          )}
        </svg>
      );
    })(),

    // Staging - spotlight composition
    3: (() => {
      return (
        <svg width="100" height="90" viewBox="0 0 100 90">
          {/* Stage frame */}
          <rect
            x="10"
            y="10"
            width="80"
            height="70"
            fill="none"
            stroke={sketchColor}
            strokeWidth="1.5"
          />
          {/* Spotlight cone */}
          <path
            d="M50 0 L30 85 L70 85 Z"
            fill={`${accentWarm}20`}
            stroke="none"
          />
          {/* Character in spotlight */}
          <ellipse
            cx="50"
            cy="65"
            rx="12"
            ry="10"
            fill="none"
            stroke={inkColor}
            strokeWidth="2.5"
          />
          <circle cx="50" cy="48" r="9" fill="none" stroke={inkColor} strokeWidth="2" />
          {/* Background characters (muted) */}
          <ellipse cx="22" cy="68" rx="6" ry="5" fill="none" stroke={sketchColor} strokeWidth="1" opacity="0.4" />
          <ellipse cx="78" cy="68" rx="6" ry="5" fill="none" stroke={sketchColor} strokeWidth="1" opacity="0.4" />
        </svg>
      );
    })(),

    // Straight Ahead vs Pose to Pose
    4: (() => {
      const t = (frame % 60) / 60;
      return (
        <svg width="100" height="90" viewBox="0 0 100 90">
          {/* Labels */}
          <text x="50" y="15" fontSize="8" fill={sketchColor} textAnchor="middle">
            Straight Ahead
          </text>
          <text x="50" y="85" fontSize="8" fill={sketchColor} textAnchor="middle">
            Pose to Pose
          </text>
          {/* Straight ahead - fluid path */}
          <path
            d="M15 30 Q50 20 85 30"
            fill="none"
            stroke={sketchColor}
            strokeWidth="1"
            strokeDasharray="3 2"
          />
          <circle
            cx={15 + t * 70}
            cy={30 - Math.sin(t * Math.PI) * 10}
            r="6"
            fill={inkColor}
          />
          {/* Pose to pose - key poses */}
          <path
            d="M15 60 L50 50 L85 60"
            fill="none"
            stroke={sketchColor}
            strokeWidth="1"
            strokeDasharray="3 2"
          />
          {/* Key pose markers */}
          <rect x="12" y="57" width="6" height="6" fill="none" stroke={accentWarm} strokeWidth="1.5" />
          <rect x="47" y="47" width="6" height="6" fill="none" stroke={accentWarm} strokeWidth="1.5" />
          <rect x="82" y="57" width="6" height="6" fill="none" stroke={accentWarm} strokeWidth="1.5" />
          <circle
            cx={15 + Math.floor(t * 3) * 35}
            cy={60 - (Math.floor(t * 3) === 1 ? 10 : 0)}
            r="5"
            fill={accentCool}
          />
        </svg>
      );
    })(),

    // Follow Through - pendulum with overlapping parts
    5: (() => {
      const swing = Math.sin(frame * 0.08) * 35;
      const tailSwing = Math.sin(frame * 0.08 - 0.4) * 40;
      const earSwing = Math.sin(frame * 0.08 - 0.2) * 25;
      return (
        <svg width="100" height="90" viewBox="0 0 100 90">
          {/* Pivot */}
          <circle cx="50" cy="10" r="4" fill={sketchColor} />
          {/* Main pendulum arm */}
          <line
            x1="50"
            y1="10"
            x2={50 + Math.sin((swing * Math.PI) / 180) * 45}
            y2={10 + Math.cos((swing * Math.PI) / 180) * 45}
            stroke={inkColor}
            strokeWidth="2"
          />
          {/* Ball/head */}
          <circle
            cx={50 + Math.sin((swing * Math.PI) / 180) * 45}
            cy={10 + Math.cos((swing * Math.PI) / 180) * 45}
            r="12"
            fill="none"
            stroke={inkColor}
            strokeWidth="2"
          />
          {/* Ear (overlapping) */}
          <ellipse
            cx={50 + Math.sin((swing * Math.PI) / 180) * 45 + Math.sin((earSwing * Math.PI) / 180) * 8}
            cy={10 + Math.cos((swing * Math.PI) / 180) * 45 - 10}
            rx="5"
            ry="8"
            fill="none"
            stroke={accentWarm}
            strokeWidth="1.5"
            transform={`rotate(${earSwing / 2}, ${50 + Math.sin((swing * Math.PI) / 180) * 45}, ${10 + Math.cos((swing * Math.PI) / 180) * 45 - 10})`}
          />
          {/* Tail (follow through) */}
          <path
            d={`M${50 + Math.sin((swing * Math.PI) / 180) * 45} ${10 + Math.cos((swing * Math.PI) / 180) * 45 + 10} Q${50 + Math.sin((tailSwing * Math.PI) / 180) * 50} ${75} ${50 + Math.sin((tailSwing * Math.PI) / 180) * 55} 85`}
            fill="none"
            stroke={accentCool}
            strokeWidth="2"
          />
        </svg>
      );
    })(),

    // Slow In Slow Out - spacing chart
    6: (() => {
      const t = (frame % 90) / 90;
      const eased = 0.5 - Math.cos(t * Math.PI) / 2;
      return (
        <svg width="100" height="90" viewBox="0 0 100 90">
          {/* Chart frame */}
          <rect x="10" y="15" width="80" height="60" fill="none" stroke={sketchColor} strokeWidth="1" />
          {/* Grid lines */}
          {[...Array(5)].map((_, i) => (
            <line
              key={i}
              x1="10"
              y1={15 + i * 15}
              x2="90"
              y2={15 + i * 15}
              stroke={sketchColor}
              strokeWidth="0.5"
              opacity="0.3"
            />
          ))}
          {/* Linear path */}
          <line x1="10" y1="70" x2="90" y2="20" stroke={sketchColor} strokeWidth="1" strokeDasharray="3 2" />
          {/* Eased curve */}
          <path
            d="M10 70 C30 70 70 20 90 20"
            fill="none"
            stroke={inkColor}
            strokeWidth="2"
          />
          {/* Moving points */}
          <circle cx={10 + t * 80} cy={70 - t * 50} r="4" fill={sketchColor} opacity="0.5" />
          <circle cx={10 + eased * 80} cy={70 - eased * 50} r="5" fill={accentWarm} />
          {/* Labels */}
          <text x="15" y="82" fontSize="7" fill={sketchColor}>Slow In</text>
          <text x="65" y="12" fontSize="7" fill={sketchColor}>Slow Out</text>
        </svg>
      );
    })(),

    // Arcs - natural motion path
    7: (() => {
      const t = (frame % 75) / 75;
      return (
        <svg width="100" height="90" viewBox="0 0 100 90">
          {/* Arc path */}
          <path
            d="M15 75 Q50 5 85 75"
            fill="none"
            stroke={sketchColor}
            strokeWidth="1.5"
            strokeDasharray="4 3"
          />
          {/* Arc indicators */}
          {[0.2, 0.4, 0.5, 0.6, 0.8].map((pos, i) => (
            <circle
              key={i}
              cx={15 + pos * 70}
              cy={75 - Math.sin(pos * Math.PI) * 70}
              r="2"
              fill={sketchColor}
              opacity="0.4"
            />
          ))}
          {/* Moving ball */}
          <circle
            cx={15 + t * 70}
            cy={75 - Math.sin(t * Math.PI) * 70}
            r="8"
            fill="none"
            stroke={inkColor}
            strokeWidth="2"
          />
          {/* Hand throwing */}
          <path
            d="M8 80 L15 75 L12 68"
            fill="none"
            stroke={accentWarm}
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      );
    })(),

    // Secondary Action - walking with arm swing
    8: (() => {
      const walk = Math.sin(frame * 0.12);
      const bob = Math.abs(walk) * 3;
      return (
        <svg width="100" height="90" viewBox="0 0 100 90">
          {/* Ground */}
          <line x1="10" y1="82" x2="90" y2="82" stroke={sketchColor} strokeWidth="1" />
          {/* Body */}
          <ellipse
            cx="50"
            cy={55 - bob}
            rx="14"
            ry="18"
            fill="none"
            stroke={inkColor}
            strokeWidth="2"
          />
          {/* Head */}
          <circle cx="50" cy={32 - bob} r="10" fill="none" stroke={inkColor} strokeWidth="2" />
          {/* Primary: Legs walking */}
          <line
            x1="45"
            y1={70 - bob}
            x2={42 + walk * 8}
            y2="80"
            stroke={inkColor}
            strokeWidth="2.5"
          />
          <line
            x1="55"
            y1={70 - bob}
            x2={58 - walk * 8}
            y2="80"
            stroke={inkColor}
            strokeWidth="2.5"
          />
          {/* Secondary: Arms swinging opposite */}
          <line
            x1="40"
            y1={50 - bob}
            x2={35 - walk * 10}
            y2={60 - bob}
            stroke={accentWarm}
            strokeWidth="2"
          />
          <line
            x1="60"
            y1={50 - bob}
            x2={65 + walk * 10}
            y2={60 - bob}
            stroke={accentWarm}
            strokeWidth="2"
          />
          {/* Secondary: Hat bobbing */}
          <ellipse
            cx="50"
            cy={22 - bob - walk * 2}
            rx="12"
            ry="4"
            fill="none"
            stroke={accentCool}
            strokeWidth="1.5"
          />
        </svg>
      );
    })(),

    // Timing - fast vs slow
    9: (() => {
      const fastBall = (frame % 20) / 20;
      const slowBall = (frame % 80) / 80;
      return (
        <svg width="100" height="90" viewBox="0 0 100 90">
          {/* Labels */}
          <text x="10" y="25" fontSize="9" fill={sketchColor}>Fast</text>
          <text x="10" y="65" fontSize="9" fill={sketchColor}>Slow</text>
          {/* Fast track */}
          <line x1="30" y1="20" x2="90" y2="20" stroke={sketchColor} strokeWidth="1" strokeDasharray="2 2" />
          {/* Motion blur for fast */}
          <ellipse
            cx={30 + fastBall * 55}
            cy="20"
            rx="12"
            ry="6"
            fill={`${accentWarm}40`}
          />
          <circle cx={30 + fastBall * 60} cy="20" r="6" fill={accentWarm} />
          {/* Slow track */}
          <line x1="30" y1="60" x2="90" y2="60" stroke={sketchColor} strokeWidth="1" strokeDasharray="2 2" />
          {/* Spacing marks for slow */}
          {[...Array(8)].map((_, i) => (
            <line
              key={i}
              x1={30 + i * 8}
              y1="55"
              x2={30 + i * 8}
              y2="65"
              stroke={sketchColor}
              strokeWidth="0.5"
              opacity="0.4"
            />
          ))}
          <circle cx={30 + slowBall * 60} cy="60" r="6" fill={inkColor} />
          {/* Timing chart */}
          <text x="50" y="82" fontSize="7" fill={sketchColor} textAnchor="middle">
            fewer drawings = faster
          </text>
        </svg>
      );
    })(),

    // Exaggeration - expression push
    10: (() => {
      const breathe = Math.sin(frame * 0.08);
      return (
        <svg width="100" height="90" viewBox="0 0 100 90">
          {/* Normal face */}
          <circle cx="30" cy="45" r="20" fill="none" stroke={sketchColor} strokeWidth="1.5" />
          <circle cx="25" cy="42" r="2" fill={sketchColor} />
          <circle cx="35" cy="42" r="2" fill={sketchColor} />
          <path d="M25 52 Q30 55 35 52" fill="none" stroke={sketchColor} strokeWidth="1" />
          <text x="30" y="75" fontSize="8" fill={sketchColor} textAnchor="middle">Normal</text>
          {/* Exaggerated face */}
          <ellipse
            cx="70"
            cy="45"
            rx={22 + breathe * 3}
            ry={20 - breathe * 2}
            fill="none"
            stroke={inkColor}
            strokeWidth="2"
          />
          {/* Big excited eyes */}
          <ellipse cx="62" cy="40" rx="5" ry={6 + breathe * 2} fill={inkColor} />
          <ellipse cx="78" cy="40" rx="5" ry={6 + breathe * 2} fill={inkColor} />
          {/* Wide smile */}
          <path
            d={`M58 ${52 + breathe * 2} Q70 ${62 + breathe * 3} 82 ${52 + breathe * 2}`}
            fill="none"
            stroke={inkColor}
            strokeWidth="2"
          />
          <text x="70" y="75" fontSize="8" fill={accentWarm} textAnchor="middle" fontWeight="bold">
            Exaggerated!
          </text>
        </svg>
      );
    })(),

    // Solid Drawing - 3D form construction
    11: (() => {
      const rotate = frame * 0.5;
      return (
        <svg width="100" height="90" viewBox="0 0 100 90">
          {/* Construction lines */}
          <ellipse
            cx="50"
            cy="45"
            rx="30"
            ry="35"
            fill="none"
            stroke={sketchColor}
            strokeWidth="1"
            strokeDasharray="3 3"
            opacity="0.5"
          />
          {/* Center axis */}
          <line
            x1="50"
            y1="10"
            x2="50"
            y2="80"
            stroke={sketchColor}
            strokeWidth="0.5"
            strokeDasharray="2 2"
            opacity="0.4"
          />
          {/* Cross contour */}
          <ellipse
            cx="50"
            cy="45"
            rx="28"
            ry={8 + Math.sin((rotate * Math.PI) / 90) * 6}
            fill="none"
            stroke={accentCool}
            strokeWidth="1"
          />
          {/* Volume form */}
          <ellipse
            cx="50"
            cy="45"
            rx="25"
            ry="32"
            fill="none"
            stroke={inkColor}
            strokeWidth="2.5"
          />
          {/* Shading indication */}
          <path
            d="M35 35 Q30 45 35 55"
            fill="none"
            stroke={inkColor}
            strokeWidth="1"
            opacity="0.4"
          />
          <text x="50" y="85" fontSize="7" fill={sketchColor} textAnchor="middle">
            Form & Volume
          </text>
        </svg>
      );
    })(),

    // Appeal - charming character design
    12: (() => {
      const blink = frame % 80 < 4;
      const tilt = Math.sin(frame * 0.06) * 5;
      return (
        <svg width="100" height="90" viewBox="0 0 100 90">
          <g transform={`rotate(${tilt}, 50, 50)`}>
            {/* Big head (appeal through proportions) */}
            <ellipse cx="50" cy="42" rx="28" ry="30" fill="none" stroke={inkColor} strokeWidth="2" />
            {/* Big eyes (appeal through features) */}
            <ellipse
              cx="40"
              cy="40"
              rx="8"
              ry={blink ? 1 : 10}
              fill="none"
              stroke={inkColor}
              strokeWidth="1.5"
            />
            <ellipse
              cx="60"
              cy="40"
              rx="8"
              ry={blink ? 1 : 10}
              fill="none"
              stroke={inkColor}
              strokeWidth="1.5"
            />
            {/* Pupils */}
            {!blink && (
              <>
                <circle cx="42" cy="42" r="3" fill={inkColor} />
                <circle cx="62" cy="42" r="3" fill={inkColor} />
                {/* Sparkle */}
                <circle cx="44" cy="39" r="1.5" fill="white" />
                <circle cx="64" cy="39" r="1.5" fill="white" />
              </>
            )}
            {/* Cute smile */}
            <path d="M40 55 Q50 62 60 55" fill="none" stroke={inkColor} strokeWidth="2" />
            {/* Rosy cheeks */}
            <ellipse cx="30" cy="50" rx="5" ry="3" fill={accentWarm} opacity="0.4" />
            <ellipse cx="70" cy="50" rx="5" ry="3" fill={accentWarm} opacity="0.4" />
            {/* Small body (appeal through proportions) */}
            <ellipse cx="50" cy="78" rx="12" ry="8" fill="none" stroke={inkColor} strokeWidth="1.5" />
          </g>
        </svg>
      );
    })(),
  };

  return demos[principle.number] || null;
};

export const ClassicPrincipleShowcase: React.FC<{
  principles: Principle[];
  accentWarm: string;
  accentCool: string;
  chapterNum: string;
}> = ({ principles, accentWarm, accentCool, chapterNum }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        padding: 50,
      }}
    >
      <div style={{ width: "100%", maxWidth: 1050 }}>
        {/* Chapter Header */}
        <div
          style={{
            marginBottom: 30,
            opacity: titleOpacity,
            display: "flex",
            alignItems: "center",
            gap: 20,
          }}
        >
          <div
            style={{
              width: 50,
              height: 50,
              borderRadius: "50%",
              border: `2px solid ${accentWarm}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontSize: 22,
              color: accentWarm,
              fontWeight: 600,
            }}
          >
            {chapterNum}
          </div>
          <div>
            <div
              style={{
                fontSize: 12,
                color: "#6b5a42",
                letterSpacing: 2,
                textTransform: "uppercase",
              }}
            >
              Chapter {chapterNum}
            </div>
            <div
              style={{
                fontSize: 28,
                fontFamily: "Georgia, 'Times New Roman', serif",
                color: "#2c1810",
              }}
            >
              Principles {principles[0].number}–{principles[principles.length - 1].number}
            </div>
          </div>
        </div>

        {/* Cards Grid - 2x2 */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 20,
          }}
        >
          {principles.map((principle, index) => {
            const delay = index * 10;
            const cardSpring = spring({
              fps,
              frame: frame - delay - 20,
              config: { damping: 22, mass: 0.9 },
            });

            const cardOpacity = interpolate(
              frame - delay - 20,
              [0, 15],
              [0, 1],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }
            );

            const romanNumerals = [
              "I", "II", "III", "IV", "V", "VI",
              "VII", "VIII", "IX", "X", "XI", "XII",
            ];

            return (
              <div
                key={principle.number}
                style={{
                  background: "rgba(255,252,245,0.7)",
                  border: "1px solid rgba(92,74,50,0.2)",
                  borderRadius: 8,
                  padding: 18,
                  display: "flex",
                  gap: 18,
                  alignItems: "center",
                  transform: `translateY(${(1 - cardSpring) * 20}px)`,
                  opacity: cardOpacity,
                  boxShadow: "2px 3px 8px rgba(92,74,50,0.1)",
                }}
              >
                {/* Animation Demo */}
                <div
                  style={{
                    width: 110,
                    height: 95,
                    background: "rgba(245,230,200,0.5)",
                    borderRadius: 6,
                    border: "1px solid rgba(92,74,50,0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <ClassicDemo
                    principle={principle}
                    accentWarm={accentWarm}
                    accentCool={accentCool}
                    frame={frame}
                  />
                </div>

                {/* Text Content */}
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      gap: 10,
                      marginBottom: 6,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 16,
                        fontFamily: "Georgia, 'Times New Roman', serif",
                        color: accentWarm,
                        fontWeight: 600,
                      }}
                    >
                      {romanNumerals[principle.number - 1]}.
                    </div>
                    <div
                      style={{
                        fontSize: 17,
                        fontFamily: "Georgia, 'Times New Roman', serif",
                        fontWeight: 600,
                        color: "#2c1810",
                      }}
                    >
                      {principle.name}
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: "#5c4a32",
                      lineHeight: 1.5,
                      fontStyle: "italic",
                    }}
                  >
                    {principle.description}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
