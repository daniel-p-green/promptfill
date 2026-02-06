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
  icon: string;
};

const PrincipleDemo: React.FC<{
  principle: Principle;
  accent: string;
  frame: number;
}> = ({ principle, accent, frame }) => {
  // Different animations for each principle
  const demoAnimations: Record<number, React.ReactNode> = {
    // Squash & Stretch - bouncing ball
    1: (() => {
      const bounce = Math.abs(Math.sin(frame * 0.15));
      const squash = 1 + (1 - bounce) * 0.3;
      return (
        <div
          style={{
            width: 40,
            height: 40 / squash,
            borderRadius: "50%",
            background: `linear-gradient(135deg, ${accent}, ${accent}88)`,
            transform: `translateY(${-bounce * 50}px) scaleX(${squash}) scaleY(${1 / squash})`,
            boxShadow: `0 ${20 + bounce * 30}px ${20 + bounce * 10}px rgba(0,0,0,0.3)`,
          }}
        />
      );
    })(),

    // Anticipation - wind up before action
    2: (() => {
      const phase = (frame % 90) / 90;
      const anticipate = phase < 0.3 ? phase / 0.3 : phase < 0.4 ? 1 - (phase - 0.3) / 0.1 * 2 : 0;
      const action = phase >= 0.4 && phase < 0.7 ? (phase - 0.4) / 0.3 : 0;
      return (
        <div
          style={{
            width: 30,
            height: 50,
            background: `linear-gradient(135deg, ${accent}, ${accent}88)`,
            borderRadius: 8,
            transform: `translateX(${-anticipate * 30 + action * 100}px) rotate(${-anticipate * 20 + action * 10}deg)`,
          }}
        />
      );
    })(),

    // Staging - spotlight effect
    3: (() => {
      const spotlightX = Math.sin(frame * 0.05) * 30;
      return (
        <div style={{ position: "relative", width: 120, height: 80 }}>
          <div
            style={{
              position: "absolute",
              width: 60,
              height: 60,
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              borderRadius: "50%",
              background: `radial-gradient(circle at ${50 + spotlightX}% 40%, ${accent}40, transparent 70%)`,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              width: 24,
              height: 24,
              borderRadius: "50%",
              background: accent,
              boxShadow: `0 0 20px ${accent}`,
            }}
          />
        </div>
      );
    })(),

    // Straight Ahead & Pose to Pose - two approaches
    4: (() => {
      const progress = (frame % 60) / 60;
      return (
        <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
          {/* Straight ahead - continuous */}
          <div
            style={{
              width: 20,
              height: 20,
              borderRadius: "50%",
              background: accent,
              transform: `translateX(${progress * 60}px)`,
            }}
          />
          {/* Pose to pose - keyframes */}
          <div
            style={{
              width: 20,
              height: 20,
              borderRadius: "50%",
              background: `${accent}88`,
              transform: `translateX(${Math.floor(progress * 3) * 20}px)`,
            }}
          />
        </div>
      );
    })(),

    // Follow Through - trailing motion
    5: (() => {
      const swing = Math.sin(frame * 0.1) * 30;
      return (
        <div style={{ position: "relative" }}>
          <div
            style={{
              width: 8,
              height: 40,
              background: accent,
              borderRadius: 4,
              transform: `rotate(${swing}deg)`,
              transformOrigin: "top center",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 36,
              left: 0,
              width: 8,
              height: 30,
              background: `${accent}88`,
              borderRadius: 4,
              transform: `rotate(${swing * 1.3}deg)`,
              transformOrigin: "top center",
            }}
          />
        </div>
      );
    })(),

    // Slow In & Slow Out - easing
    6: (() => {
      const linear = (frame % 90) / 90;
      const eased = 0.5 - Math.cos(linear * Math.PI) / 2;
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", width: 50 }}>Linear</div>
            <div
              style={{
                width: 16,
                height: 16,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.3)",
                transform: `translateX(${linear * 60}px)`,
              }}
            />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", width: 50 }}>Eased</div>
            <div
              style={{
                width: 16,
                height: 16,
                borderRadius: "50%",
                background: accent,
                transform: `translateX(${eased * 60}px)`,
              }}
            />
          </div>
        </div>
      );
    })(),

    // Arc - curved motion path
    7: (() => {
      const t = (frame % 90) / 90;
      const x = t * 80;
      const y = -Math.sin(t * Math.PI) * 40;
      return (
        <div style={{ position: "relative", width: 100, height: 60 }}>
          {/* Arc path */}
          <svg
            style={{ position: "absolute", top: 0, left: 0 }}
            width="100"
            height="60"
            viewBox="0 0 100 60"
          >
            <path
              d="M 10 50 Q 50 0 90 50"
              fill="none"
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="2"
              strokeDasharray="4 4"
            />
          </svg>
          <div
            style={{
              position: "absolute",
              width: 16,
              height: 16,
              borderRadius: "50%",
              background: accent,
              left: 10 + x - 8,
              top: 50 + y - 8,
              boxShadow: `0 0 12px ${accent}`,
            }}
          />
        </div>
      );
    })(),

    // Secondary Action - supporting motion
    8: (() => {
      const walk = Math.sin(frame * 0.15);
      return (
        <div style={{ display: "flex", alignItems: "flex-end", gap: 4 }}>
          {/* Body (primary) */}
          <div
            style={{
              width: 24,
              height: 40,
              background: accent,
              borderRadius: 8,
              transform: `translateY(${Math.abs(walk) * 5}px)`,
            }}
          />
          {/* Arm (secondary) */}
          <div
            style={{
              width: 8,
              height: 20,
              background: `${accent}88`,
              borderRadius: 4,
              transform: `rotate(${walk * 30}deg)`,
              transformOrigin: "top center",
            }}
          />
        </div>
      );
    })(),

    // Timing - speed comparison
    9: (() => {
      const fast = (frame % 30) / 30;
      const slow = (frame % 90) / 90;
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", width: 40 }}>Fast</div>
            <div
              style={{
                width: 16,
                height: 16,
                borderRadius: "50%",
                background: accent,
                transform: `translateX(${fast * 60}px)`,
              }}
            />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", width: 40 }}>Slow</div>
            <div
              style={{
                width: 16,
                height: 16,
                borderRadius: "50%",
                background: `${accent}88`,
                transform: `translateX(${slow * 60}px)`,
              }}
            />
          </div>
        </div>
      );
    })(),

    // Exaggeration - pushed poses
    10: (() => {
      const stretch = Math.sin(frame * 0.1);
      return (
        <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
          {/* Normal */}
          <div
            style={{
              width: 24,
              height: 24 + stretch * 4,
              background: "rgba(255,255,255,0.3)",
              borderRadius: 6,
            }}
          />
          {/* Exaggerated */}
          <div
            style={{
              width: 24,
              height: 24 + stretch * 16,
              background: accent,
              borderRadius: 6,
              boxShadow: `0 0 15px ${accent}50`,
            }}
          />
        </div>
      );
    })(),

    // Solid Drawing - 3D form
    11: (() => {
      const rotateY = Math.sin(frame * 0.05) * 20;
      return (
        <div
          style={{
            width: 50,
            height: 50,
            background: `linear-gradient(135deg, ${accent}, ${accent}44)`,
            borderRadius: 8,
            transform: `perspective(200px) rotateY(${rotateY}deg)`,
            boxShadow: `${rotateY / 2}px 4px 20px rgba(0,0,0,0.3)`,
          }}
        />
      );
    })(),

    // Appeal - charismatic character
    12: (() => {
      const blink = frame % 90 < 5;
      const bounce = Math.sin(frame * 0.1) * 2;
      return (
        <div
          style={{
            width: 50,
            height: 50,
            background: accent,
            borderRadius: "50%",
            position: "relative",
            transform: `translateY(${bounce}px)`,
            boxShadow: `0 4px 20px ${accent}40`,
          }}
        >
          {/* Eyes */}
          <div
            style={{
              position: "absolute",
              top: 18,
              left: 12,
              width: 8,
              height: blink ? 2 : 8,
              background: "#0a0a0f",
              borderRadius: 4,
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 18,
              right: 12,
              width: 8,
              height: blink ? 2 : 8,
              background: "#0a0a0f",
              borderRadius: 4,
            }}
          />
          {/* Smile */}
          <div
            style={{
              position: "absolute",
              bottom: 12,
              left: "50%",
              transform: "translateX(-50%)",
              width: 20,
              height: 10,
              borderRadius: "0 0 10px 10px",
              background: "#0a0a0f",
            }}
          />
        </div>
      );
    })(),
  };

  return demoAnimations[principle.number] || null;
};

export const PrincipleShowcase: React.FC<{
  principles: Principle[];
  accent: string;
  groupLabel: string;
}> = ({ principles, accent, groupLabel }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        padding: 60,
      }}
    >
      <div style={{ width: "100%", maxWidth: 1100 }}>
        {/* Section Label */}
        <div
          style={{
            marginBottom: 32,
            opacity: titleOpacity,
          }}
        >
          <div
            style={{
              fontSize: 14,
              color: accent,
              fontWeight: 600,
              letterSpacing: 2,
              textTransform: "uppercase",
              marginBottom: 8,
            }}
          >
            {groupLabel}
          </div>
          <div
            style={{
              fontSize: 32,
              fontWeight: 600,
              color: "white",
              letterSpacing: -0.5,
            }}
          >
            Principles {principles[0].number}–{principles[principles.length - 1].number}
          </div>
        </div>

        {/* Cards Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 20,
          }}
        >
          {principles.map((principle, index) => {
            const delay = index * 8;
            const cardSpring = spring({
              fps,
              frame: frame - delay - 15,
              config: { damping: 18, mass: 0.8 },
            });

            const cardOpacity = interpolate(
              frame - delay - 15,
              [0, 12],
              [0, 1],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }
            );

            return (
              <div
                key={principle.number}
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 16,
                  padding: 24,
                  display: "flex",
                  gap: 24,
                  alignItems: "center",
                  transform: `translateY(${(1 - cardSpring) * 25}px)`,
                  opacity: cardOpacity,
                }}
              >
                {/* Demo Animation */}
                <div
                  style={{
                    width: 140,
                    height: 100,
                    background: "rgba(0,0,0,0.3)",
                    borderRadius: 12,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <PrincipleDemo
                    principle={principle}
                    accent={accent}
                    frame={frame}
                  />
                </div>

                {/* Text Content */}
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      marginBottom: 8,
                    }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        background: `${accent}25`,
                        color: accent,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 14,
                        fontWeight: 700,
                      }}
                    >
                      {principle.number}
                    </div>
                    <div
                      style={{
                        fontSize: 20,
                        fontWeight: 600,
                        color: "white",
                      }}
                    >
                      {principle.name}
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: 15,
                      color: "rgba(255,255,255,0.55)",
                      lineHeight: 1.5,
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
