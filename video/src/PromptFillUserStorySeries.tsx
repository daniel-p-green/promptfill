import React from "react";
import { loadFont as loadBodyFont } from "@remotion/google-fonts/Manrope";
import { loadFont as loadDisplayFont } from "@remotion/google-fonts/SpaceGrotesk";
import { loadFont as loadMonoFont } from "@remotion/google-fonts/IBMPlexMono";
import {
  AbsoluteFill,
  Img,
  Series,
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
  weights: ["400", "500"],
  subsets: ["latin"],
});

export type UserStoryKey = "email" | "summary" | "support" | "prd";

export type PromptFillUserStoryProps = {
  accent: string;
  productName: string;
  story: UserStoryKey;
};

const STORY_SCENES = {
  hook: 90,
  extract: 120,
  fill: 120,
  insert: 120,
  outcome: 90,
} as const;

export const PROMPTFILL_USER_STORY_DURATION_IN_FRAMES =
  STORY_SCENES.hook +
  STORY_SCENES.extract +
  STORY_SCENES.fill +
  STORY_SCENES.insert +
  STORY_SCENES.outcome;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const SAFE_AREA = {
  left: 72,
  right: 72,
  top: 56,
  bottom: 58,
} as const;

type StoryContent = {
  userLabel: string;
  goalLabel: string;
  roughPrompt: string;
  variables: string[];
  beforePain: string[];
  outcomeHeadline: string;
  outcomeBullets: string[];
};

const STORY_CONTENT: Record<UserStoryKey, StoryContent> = {
  email: {
    userLabel: "For outreach and account emails",
    goalLabel: "Write tailored emails in minutes.",
    roughPrompt: "Write an email to {recipient_name} about {topic} in a {tone} tone.",
    variables: ["recipient_name", "topic", "tone", "context"],
    beforePain: [
      "You restart from a blank draft every send.",
      "Tone and context drift across teammates.",
    ],
    outcomeHeadline: "Send faster with a consistent voice.",
    outcomeBullets: [
      "Reuse one structure for weekly updates.",
      "Drop final prompts right back into chat.",
    ],
  },
  summary: {
    userLabel: "For audience-based summaries",
    goalLabel: "Turn one source into audience-ready summaries.",
    roughPrompt: "Summarize these notes for {{audience}} in {{format}} with {{length}} length.",
    variables: ["notes", "audience", "format", "length"],
    beforePain: [
      "You rewrite the same update for every audience.",
      "Important decisions get buried in long notes.",
    ],
    outcomeHeadline: "One source. Clear updates for each audience.",
    outcomeBullets: [
      "Swap audience and format without rewriting.",
      "Keep updates concise and consistent.",
    ],
  },
  support: {
    userLabel: "For support response templates",
    goalLabel: "Reply with empathy and policy consistency.",
    roughPrompt:
      "Draft a support reply for {{customer_message}} using {{policy_context}} with {{tone}} tone.",
    variables: ["customer_message", "policy_context", "tone", "resolution_options"],
    beforePain: [
      "Similar tickets get different answers.",
      "Policy language is hard to apply quickly.",
    ],
    outcomeHeadline: "Consistent replies when queues spike.",
    outcomeBullets: [
      "Keep empathy and policy in the same flow.",
      "Reuse proven response patterns in seconds.",
    ],
  },
  prd: {
    userLabel: "For PRD and brief scaffolds",
    goalLabel: "Start strategic docs from a reliable structure.",
    roughPrompt:
      "Create a {{doc_type}} for {{audience}} with {{scope}} constraints and {{context}}.",
    variables: ["doc_type", "audience", "scope", "constraints", "context"],
    beforePain: [
      "Doc quality changes by author and deadline.",
      "Scope and constraints are often missing up front.",
    ],
    outcomeHeadline: "More reliable first drafts for critical docs.",
    outcomeBullets: [
      "Keep scope explicit every time.",
      "Spend less time fixing structure.",
    ],
  },
};

const StoryBackdrop: React.FC<{ accent: string }> = ({ accent }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const drift = interpolate(frame, [0, 18 * fps], [-20, 20], clamp);

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: "#06090f" }} />
      <AbsoluteFill
        style={{
          background: `radial-gradient(860px 520px at ${18 + drift * 0.2}% 18%, ${accent}3a, rgba(0,0,0,0) 76%)`,
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(900px 580px at 82% 82%, rgba(45,115,255,0.24), rgba(0,0,0,0) 78%)",
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.01) 26%, rgba(0,0,0,0.45) 88%)",
        }}
      />
    </AbsoluteFill>
  );
};

const SceneHeader: React.FC<{
  accent: string;
  step: string;
  title: string;
  subtitle: string;
}> = ({ accent, step, title, subtitle }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const reveal = spring({ frame, fps, config: { damping: 18, mass: 0.7 } });
  const y = interpolate(reveal, [0, 1], [14, 0], clamp);

  return (
    <div
      style={{
        position: "absolute",
        left: SAFE_AREA.left,
        top: SAFE_AREA.top,
        width: 640,
        opacity: reveal,
        transform: `translateY(${y}px)`,
      }}
    >
      <div
        style={{
          borderRadius: 24,
          border: "1px solid rgba(255,255,255,0.2)",
          background:
            "linear-gradient(180deg, rgba(6,9,14,0.86), rgba(6,9,14,0.74) 65%, rgba(6,9,14,0.68))",
          backdropFilter: "blur(8px)",
          boxShadow: "0 24px 60px rgba(0,0,0,0.44)",
          padding: "24px 26px 28px",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            borderRadius: 999,
            border: `1px solid ${accent}77`,
            background: "rgba(0,0,0,0.45)",
            color: "rgba(255,255,255,0.92)",
            fontFamily: monoFont,
            fontSize: 20,
            lineHeight: 1,
            padding: "10px 14px",
          }}
        >
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: 999,
              background: accent,
              boxShadow: `0 0 16px ${accent}66`,
            }}
          />
          {step}
        </div>
        <div
          style={{
            marginTop: 16,
            fontFamily: displayFont,
            fontWeight: 700,
            fontSize: 56,
            lineHeight: 0.96,
            letterSpacing: -1.2,
            color: "white",
            maxWidth: 580,
            textWrap: "balance",
          }}
        >
          {title}
        </div>
        <div
          style={{
            marginTop: 16,
            fontFamily: bodyFont,
            fontSize: 28,
            color: "rgba(255,255,255,0.92)",
            lineHeight: 1.24,
            maxWidth: 580,
          }}
        >
          {subtitle}
        </div>
      </div>
    </div>
  );
};

const FullFrameImage: React.FC<{ src: string; opacity?: number }> = ({ src, opacity = 1 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame, fps, config: { damping: 16, mass: 0.75 } });
  const scale = interpolate(pop, [0, 1], [0.97, 0.93], clamp);

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity }}>
      <div
        style={{
          width: 1280,
          height: 720,
          transform: `scale(${scale})`,
          transformOrigin: "center",
          borderRadius: 30,
          overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.15)",
          boxShadow: "0 42px 120px rgba(0,0,0,0.56)",
          position: "relative",
        }}
      >
        <Img src={src} style={{ width: "100%", height: "100%" }} />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(90deg, rgba(4,7,12,0.8), rgba(4,7,12,0.58) 34%, rgba(4,7,12,0.18) 68%, rgba(4,7,12,0.04))",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.08), rgba(0,0,0,0.22) 62%, rgba(0,0,0,0.42))",
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

const PainCards: React.FC<{ points: string[] }> = ({ points }) => (
  <div
    style={{
      position: "absolute",
      left: SAFE_AREA.left,
      right: SAFE_AREA.right,
      bottom: SAFE_AREA.bottom,
      display: "grid",
      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
      gap: 14,
    }}
  >
    {points.map((point) => (
      <div
        key={point}
        style={{
          borderRadius: 18,
          border: "1px solid rgba(255,255,255,0.2)",
          background: "rgba(6,9,14,0.76)",
          color: "rgba(255,255,255,0.9)",
          fontFamily: bodyFont,
          fontSize: 24,
          lineHeight: 1.22,
          padding: "18px 18px",
          minHeight: 106,
        }}
      >
        {point}
      </div>
    ))}
  </div>
);

const VariableChips: React.FC<{ accent: string; variables: string[] }> = ({ accent, variables }) => {
  const visibleVariables = variables.slice(0, 4);
  const overflowCount = Math.max(0, variables.length - visibleVariables.length);
  const chipLabels =
    overflowCount > 0 ? [...visibleVariables, `+${overflowCount} more`] : visibleVariables;

  return (
    <div
      style={{
        position: "absolute",
        left: SAFE_AREA.left,
        right: SAFE_AREA.right,
        bottom: SAFE_AREA.bottom,
        display: "flex",
        flexWrap: "wrap",
        gap: 12,
      }}
    >
      {chipLabels.map((variable) => (
        <div
          key={variable}
          style={{
            borderRadius: 999,
            border: `1px solid ${accent}8f`,
            background: `${accent}2e`,
            color: "white",
            fontFamily: monoFont,
            fontSize: 22,
            lineHeight: 1,
            padding: "12px 16px",
          }}
        >
          {variable}
        </div>
      ))}
    </div>
  );
};

const OutcomeCards: React.FC<{ accent: string; bullets: string[] }> = ({ accent, bullets }) => (
  <div
    style={{
      position: "absolute",
      left: SAFE_AREA.left,
      right: SAFE_AREA.right,
      bottom: SAFE_AREA.bottom,
      display: "grid",
      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
      gap: 14,
    }}
  >
    {bullets.map((bullet) => (
      <div
        key={bullet}
        style={{
          borderRadius: 18,
          border: "1px solid rgba(255,255,255,0.22)",
          background: "rgba(9,12,18,0.72)",
          color: "rgba(255,255,255,0.92)",
          fontFamily: bodyFont,
          fontSize: 24,
          lineHeight: 1.22,
          padding: "16px 18px",
          minHeight: 104,
        }}
      >
        <span style={{ color: accent, fontWeight: 700 }}>• </span>
        {bullet}
      </div>
    ))}
  </div>
);

const HookScene: React.FC<{ accent: string; story: StoryContent }> = ({ accent, story }) => {
  return (
    <AbsoluteFill>
      <FullFrameImage src={staticFile("ui/promptfill-collapsed-1280x720.png")} opacity={0.38} />
      <SceneHeader
        accent={accent}
        step={story.userLabel}
        title={story.goalLabel}
        subtitle="Turn rough asks into a reusable structure directly inside chat."
      />
      <PainCards points={story.beforePain} />
    </AbsoluteFill>
  );
};

const ExtractScene: React.FC<{ accent: string }> = ({ accent }) => {
  return (
    <AbsoluteFill>
      <FullFrameImage src={staticFile("ui/promptfill-inline-1280x720.png")} />
      <SceneHeader
        accent={accent}
        step="Step 1"
        title="Paste rough text. Extract fields."
        subtitle="Start with your rough draft. PromptFill maps it into fillable fields."
      />
    </AbsoluteFill>
  );
};

const FillScene: React.FC<{ accent: string; story: StoryContent }> = ({ accent, story }) => {
  return (
    <AbsoluteFill>
      <FullFrameImage src={staticFile("ui/promptfill-drawer-1280x720.png")} />
      <SceneHeader
        accent={accent}
        step="Step 2"
        title="Fill only what changes."
        subtitle="Update just the changing values while defaults keep structure stable."
      />
      <VariableChips accent={accent} variables={story.variables} />
    </AbsoluteFill>
  );
};

const InsertScene: React.FC<{ accent: string }> = ({ accent }) => {
  return (
    <AbsoluteFill>
      <FullFrameImage src={staticFile("ui/promptfill-inline-1280x720.png")} />
      <SceneHeader
        accent={accent}
        step="Step 3"
        title="Render and insert into chat."
        subtitle="One action returns the final prompt to your conversation so you keep momentum."
      />
      <div
        style={{
          position: "absolute",
          left: SAFE_AREA.left,
          bottom: SAFE_AREA.bottom,
          borderRadius: 999,
          border: `1px solid ${accent}88`,
          background: `${accent}22`,
          color: "white",
          fontFamily: bodyFont,
          fontWeight: 600,
          fontSize: 24,
          padding: "14px 20px",
        }}
      >
        Extract · Fill · Render · Insert
      </div>
    </AbsoluteFill>
  );
};

const OutcomeScene: React.FC<{ accent: string; story: StoryContent }> = ({ accent, story }) => {
  return (
    <AbsoluteFill>
      <FullFrameImage src={staticFile("ui/promptfill-share-1280x720.png")} opacity={0.46} />
      <SceneHeader
        accent={accent}
        step="Outcome"
        title={story.outcomeHeadline}
        subtitle="Save what works and rerun with predictable structure in seconds."
      />
      <OutcomeCards accent={accent} bullets={story.outcomeBullets} />
    </AbsoluteFill>
  );
};

export const PromptFillUserStory: React.FC<PromptFillUserStoryProps> = ({
  accent,
  productName,
  story,
}) => {
  const storyData = STORY_CONTENT[story];

  return (
    <AbsoluteFill style={{ fontFamily: bodyFont }}>
      <StoryBackdrop accent={accent} />
      <div
        style={{
          position: "absolute",
          right: SAFE_AREA.right,
          top: SAFE_AREA.top,
          borderRadius: 999,
          border: "1px solid rgba(255,255,255,0.22)",
          background: "rgba(0,0,0,0.46)",
          color: "rgba(255,255,255,0.92)",
          fontFamily: monoFont,
          fontSize: 20,
          lineHeight: 1,
          padding: "10px 14px",
        }}
      >
        {productName}
      </div>
      <Series>
        <Series.Sequence durationInFrames={STORY_SCENES.hook}>
          <HookScene accent={accent} story={storyData} />
        </Series.Sequence>
        <Series.Sequence durationInFrames={STORY_SCENES.extract}>
          <ExtractScene accent={accent} />
        </Series.Sequence>
        <Series.Sequence durationInFrames={STORY_SCENES.fill}>
          <FillScene accent={accent} story={storyData} />
        </Series.Sequence>
        <Series.Sequence durationInFrames={STORY_SCENES.insert}>
          <InsertScene accent={accent} />
        </Series.Sequence>
        <Series.Sequence durationInFrames={STORY_SCENES.outcome}>
          <OutcomeScene accent={accent} story={storyData} />
        </Series.Sequence>
      </Series>
    </AbsoluteFill>
  );
};
