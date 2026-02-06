import React from "react";
import { loadFont as loadBodyFont } from "@remotion/google-fonts/Manrope";
import { loadFont as loadDisplayFont } from "@remotion/google-fonts/SpaceGrotesk";
import { loadFont as loadMonoFont } from "@remotion/google-fonts/IBMPlexMono";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const { fontFamily: displayFont } = loadDisplayFont("normal", {
  weights: ["600", "700"],
  subsets: ["latin"],
});
const { fontFamily: bodyFont } = loadBodyFont("normal", {
  weights: ["500", "600", "700"],
  subsets: ["latin"],
});
const { fontFamily: monoFont } = loadMonoFont("normal", {
  weights: ["500"],
  subsets: ["latin"],
});

export const PROMPTFILL_USER_STORY_DURATION_IN_FRAMES = 12 * 30;

type StoryVariant = "email" | "summary" | "support" | "prd";

export type PromptFillUserStoryProps = {
  accent: string;
  productName: string;
  variant: StoryVariant;
};

type StoryContent = {
  badge: string;
  headline: string;
  subhead: string;
  problemA: string;
  problemB: string;
  actionTitle: string;
  actionBody: string;
  outcome: string;
  chips: string[];
  screenshot: string;
};

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const STORIES: Record<StoryVariant, StoryContent> = {
  email: {
    badge: "For outreach and account emails",
    headline: "Write tailored emails in minutes.",
    subhead: "Turn rough asks into a reusable template right inside chat.",
    problemA: "You restart from a blank draft every send.",
    problemB: "Tone and context drift across teammates.",
    actionTitle: "Step 1: structure once",
    actionBody: "Save fields for recipient, tone, topic, and context. Reuse the same pattern every time.",
    outcome: "Fill only what changes. Copy a clean, consistent email in seconds.",
    chips: ["recipient_name", "topic", "tone", "context"],
    screenshot: "ui/promptfill-drawer-1280x720.png",
  },
  summary: {
    badge: "For executive summaries",
    headline: "Turn notes into clear executive briefs.",
    subhead: "Keep audience, format, and length explicit every time.",
    problemA: "Important details get buried in long notes.",
    problemB: "Each teammate summarizes in a different style.",
    actionTitle: "Step 1: define the brief shape",
    actionBody: "Lock fields for notes, audience, format, and length so each summary follows the same structure.",
    outcome: "Ship concise updates faster without losing context.",
    chips: ["notes", "audience", "format", "length"],
    screenshot: "ui/promptfill-ui-1280x720.png",
  },
  support: {
    badge: "For support and success replies",
    headline: "Respond faster without losing empathy.",
    subhead: "Keep policy and tone in the same reliable template.",
    problemA: "Reply quality drops when queues spike.",
    problemB: "Policy details are easy to miss under pressure.",
    actionTitle: "Step 1: save a response pattern",
    actionBody: "Capture customer message, policy context, tone, and resolution options as explicit variables.",
    outcome: "Send replies that stay accurate, calm, and on-brand.",
    chips: ["customer_message", "policy_context", "tone", "resolution_options"],
    screenshot: "ui/promptfill-drawer-1280x720.png",
  },
  prd: {
    badge: "For PRDs and planning docs",
    headline: "Draft PRDs with less rework.",
    subhead: "Reuse one structure while scope and constraints change.",
    problemA: "Specs start from scratch and drift by author.",
    problemB: "Key sections get skipped when timelines tighten.",
    actionTitle: "Step 1: lock your PRD template",
    actionBody: "Set doc type, audience, scope, constraints, and context as required fields.",
    outcome: "Produce consistent PRDs faster and reduce review churn.",
    chips: ["doc_type", "audience", "scope", "constraints", "context"],
    screenshot: "ui/promptfill-share-1280x720.png",
  },
};

const Badge: React.FC<{ text: string; accent: string; opacity: number }> = ({
  text,
  accent,
  opacity,
}) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 10,
      borderRadius: 999,
      border: `1px solid ${accent}7a`,
      background: "rgba(3, 7, 12, 0.78)",
      color: "rgba(255,255,255,0.92)",
      fontFamily: monoFont,
      fontSize: 14,
      padding: "9px 14px",
      opacity,
    }}
  >
    <span
      style={{
        width: 8,
        height: 8,
        borderRadius: 999,
        background: accent,
        boxShadow: `0 0 14px ${accent}88`,
      }}
    />
    {text}
  </div>
);

const GlassCard: React.FC<{
  children: React.ReactNode;
  width: number;
  opacity: number;
  x: number;
  y: number;
  border?: string;
}> = ({ children, width, opacity, x, y, border }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width,
      borderRadius: 26,
      border: border ?? "1px solid rgba(255,255,255,0.16)",
      background: "linear-gradient(165deg, rgba(6,12,19,0.88), rgba(5,9,15,0.76))",
      boxShadow: "0 26px 70px rgba(0,0,0,0.52)",
      backdropFilter: "blur(8px)",
      opacity,
    }}
  >
    {children}
  </div>
);

export const PromptFillUserStory: React.FC<PromptFillUserStoryProps> = ({
  accent,
  productName,
  variant,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const content = STORIES[variant];

  const heroReveal = spring({
    fps,
    frame: frame - 2,
    durationInFrames: 34,
    config: { damping: 200 },
  });
  const actionReveal = spring({
    fps,
    frame: frame - 78,
    durationInFrames: 30,
    config: { damping: 200 },
  });
  const outcomeReveal = spring({
    fps,
    frame: frame - 182,
    durationInFrames: 30,
    config: { damping: 200 },
  });
  const chipsReveal = spring({
    fps,
    frame: frame - 108,
    durationInFrames: 34,
    config: { damping: 180 },
  });

  const heroY = interpolate(heroReveal, [0, 1], [16, 0], clamp);
  const actionX = interpolate(actionReveal, [0, 1], [22, 0], clamp);
  const outcomeY = interpolate(outcomeReveal, [0, 1], [18, 0], clamp);
  const chipsY = interpolate(chipsReveal, [0, 1], [20, 0], clamp);
  const endFade = 1 - interpolate(frame, [320, 360], [0, 1], clamp);
  const overlayGlow = 0.44 + 0.08 * Math.sin(frame * 0.12);
  const parallaxX = interpolate(frame, [0, 360], [0, -26], {
    ...clamp,
    easing: Easing.inOut(Easing.sin),
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#05080f", opacity: endFade }}>
      <AbsoluteFill>
        <Img
          src={staticFile(content.screenshot)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: `translateX(${parallaxX}px) scale(1.03)`,
            filter: "brightness(0.32) saturate(0.86)",
          }}
        />
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(115deg, rgba(3,8,13,0.92) 0%, rgba(4,8,13,0.76) 48%, rgba(4,8,13,0.44) 100%)",
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(730px 380px at 12% 14%, ${accent}44, rgba(0,0,0,0) 70%)`,
          opacity: overlayGlow,
        }}
      />

      <div
        style={{
          position: "absolute",
          left: 48,
          top: 40,
          width: 660,
          opacity: heroReveal,
          transform: `translateY(${heroY}px)`,
        }}
      >
        <Badge text={content.badge} accent={accent} opacity={heroReveal} />
        <div
          style={{
            marginTop: 18,
            color: "#fff",
            fontFamily: displayFont,
            fontWeight: 700,
            fontSize: 72,
            lineHeight: 0.95,
            letterSpacing: -1.2,
            textWrap: "balance",
          }}
        >
          {content.headline}
        </div>
        <div
          style={{
            marginTop: 14,
            color: "rgba(255,255,255,0.82)",
            fontFamily: bodyFont,
            fontSize: 41,
            lineHeight: 1.12,
            letterSpacing: -0.5,
            maxWidth: 650,
            textWrap: "balance",
          }}
        >
          {content.subhead}
        </div>
      </div>

      <GlassCard x={48} y={480} width={590} opacity={heroReveal} border={`1px solid ${accent}66`}>
        <div style={{ padding: "20px 22px 18px 22px" }}>
          <div
            style={{
              color: "rgba(255,255,255,0.98)",
              fontFamily: bodyFont,
              fontWeight: 700,
              fontSize: 16,
            }}
          >
            Friction today
          </div>
          <div
            style={{
              marginTop: 10,
              color: "rgba(255,255,255,0.88)",
              fontFamily: bodyFont,
              fontSize: 15,
              lineHeight: 1.4,
            }}
          >
            • {content.problemA}
          </div>
          <div
            style={{
              marginTop: 6,
              color: "rgba(255,255,255,0.88)",
              fontFamily: bodyFont,
              fontSize: 15,
              lineHeight: 1.4,
            }}
          >
            • {content.problemB}
          </div>
        </div>
      </GlassCard>

      <GlassCard x={682} y={118} width={548} opacity={actionReveal} border="1px solid rgba(255,255,255,0.16)">
        <div
          style={{
            padding: "22px 24px 20px 24px",
            transform: `translateX(${actionX}px)`,
          }}
        >
          <div
            style={{
              color: "#fff",
              fontFamily: bodyFont,
              fontWeight: 700,
              fontSize: 30,
              letterSpacing: -0.2,
            }}
          >
            {content.actionTitle}
          </div>
          <div
            style={{
              marginTop: 8,
              color: "rgba(255,255,255,0.84)",
              fontFamily: bodyFont,
              fontSize: 20,
              lineHeight: 1.3,
            }}
          >
            {content.actionBody}
          </div>
        </div>
      </GlassCard>

      <div
        style={{
          position: "absolute",
          left: 682,
          bottom: 148,
          width: 548,
          display: "flex",
          flexWrap: "wrap",
          gap: 9,
          opacity: chipsReveal,
          transform: `translateY(${chipsY}px)`,
        }}
      >
        {content.chips.map((chip) => (
          <div
            key={chip}
            style={{
              borderRadius: 999,
              border: `1px solid ${accent}88`,
              background: "rgba(5, 12, 20, 0.86)",
              color: "rgba(255,255,255,0.92)",
              fontFamily: monoFont,
              fontSize: 13,
              padding: "8px 12px",
            }}
          >
            {chip}
          </div>
        ))}
      </div>

      <GlassCard x={682} y={492} width={548} opacity={outcomeReveal} border={`1px solid ${accent}66`}>
        <div
          style={{
            padding: "19px 22px 18px 22px",
            transform: `translateY(${outcomeY}px)`,
          }}
        >
          <div
            style={{
              color: "#fff",
              fontFamily: bodyFont,
              fontWeight: 700,
              fontSize: 17,
              marginBottom: 8,
            }}
          >
            Outcome
          </div>
          <div
            style={{
              color: "rgba(255,255,255,0.9)",
              fontFamily: bodyFont,
              fontSize: 23,
              lineHeight: 1.22,
              letterSpacing: -0.2,
            }}
          >
            {content.outcome}
          </div>
        </div>
      </GlassCard>

      <div
        style={{
          position: "absolute",
          right: 44,
          top: 36,
          color: "rgba(255,255,255,0.86)",
          fontFamily: monoFont,
          fontSize: 36,
          letterSpacing: -0.7,
        }}
      >
        {productName}
      </div>
    </AbsoluteFill>
  );
};
