import React from "react";
import { loadFont as loadBodyFont } from "@remotion/google-fonts/Manrope";
import { loadFont as loadDisplayFont } from "@remotion/google-fonts/SpaceGrotesk";
import { loadFont as loadMonoFont } from "@remotion/google-fonts/IBMPlexMono";
import {
  AbsoluteFill,
  Easing,
  Img,
  Series,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { HIGHLIGHTS_1280x720, type HighlightRect } from "./ui/highlights";

const { fontFamily: displayFont } = loadDisplayFont("normal", {
  weights: ["500", "600", "700"],
  subsets: ["latin"],
});
const { fontFamily: bodyFont } = loadBodyFont("normal", {
  weights: ["400", "500", "600", "700"],
  subsets: ["latin"],
});
const { fontFamily: monoFont } = loadMonoFont("normal", {
  weights: ["400", "500"],
  subsets: ["latin"],
});

const HERO_FRAMES = 135;
const LIBRARY_FRAMES = 180;
const EXTRACTION_FRAMES = 180;
const FILL_FRAMES = 180;
const USE_CASES_FRAMES = 240;
const SHARE_FRAMES = 180;
const ONBOARDING_FRAMES = 165;
const CLOSING_FRAMES = 180;

export const PROMPTFILL_FLAGSHIP_DURATION_IN_FRAMES =
  HERO_FRAMES +
  LIBRARY_FRAMES +
  EXTRACTION_FRAMES +
  FILL_FRAMES +
  USE_CASES_FRAMES +
  SHARE_FRAMES +
  ONBOARDING_FRAMES +
  CLOSING_FRAMES;

export type PromptFillFlagshipPromoProps = {
  accent: string;
  productName: string;
};

type SceneProps = PromptFillFlagshipPromoProps & {
  durationInFrames: number;
};

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const grainSvg =
  "data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%221280%22 height=%22720%22%3E%3Cfilter id=%22n%22 x=%220%22 y=%220%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.78%22 numOctaves=%222%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%221280%22 height=%22720%22 filter=%22url(%23n)%22 opacity=%220.28%22/%3E%3C/svg%3E";

const fadeInOut = (frame: number, durationInFrames: number, fadeIn = 16, fadeOut = 20) => {
  const intro = interpolate(frame, [0, fadeIn], [0, 1], clamp);
  const outro = 1 - interpolate(frame, [durationInFrames - fadeOut, durationInFrames], [0, 1], clamp);
  return intro * outro;
};

const cardEntry = (frame: number, fps: number, delay = 0) =>
  spring({
    frame: frame - delay,
    fps,
    durationInFrames: 36,
    config: { damping: 200 },
  });

const CinematicBackdrop: React.FC<{ accent: string }> = ({ accent }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const driftA = interpolate(frame, [0, 48 * fps], [-80, 70], clamp);
  const driftB = interpolate(frame, [0, 48 * fps], [60, -50], clamp);
  const glowA = interpolate(frame, [0, 10 * fps, 22 * fps, 40 * fps], [0.55, 0.8, 0.62, 0.74], clamp);
  const glowB = interpolate(frame, [0, 16 * fps, 30 * fps, 48 * fps], [0.42, 0.68, 0.5, 0.66], clamp);

  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          background: "#06080d",
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(760px 420px at ${16 + driftA * 0.08}% ${18 + driftB * 0.03}%, ${accent}36, rgba(0,0,0,0) 74%)`,
          opacity: glowA,
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(900px 560px at ${79 - driftB * 0.09}% ${85 - driftA * 0.03}%, rgba(76, 120, 255, 0.22), rgba(0,0,0,0) 78%)`,
          opacity: glowB,
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "repeating-linear-gradient(90deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 58px)",
          opacity: 0.18,
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02) 22%, rgba(0,0,0,0) 52%, rgba(0,0,0,0.4))",
          opacity: 0.7,
        }}
      />
    </AbsoluteFill>
  );
};

const SceneHeader: React.FC<{
  accent: string;
  title: string;
  body: string;
  chip?: string;
  frame: number;
}> = ({ accent, title, body, chip, frame }) => {
  const { fps } = useVideoConfig();
  const reveal = cardEntry(frame, fps, 0);
  const y = interpolate(reveal, [0, 1], [20, 0], clamp);

  return (
    <div
      style={{
        position: "absolute",
        left: 56,
        top: 44,
        width: 640,
        opacity: reveal,
        transform: `translateY(${y}px)`,
      }}
    >
      {chip ? (
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            borderRadius: 999,
            padding: "8px 13px",
            background: "rgba(0,0,0,0.5)",
            border: `1px solid ${accent}66`,
            color: "rgba(255,255,255,0.88)",
            fontFamily: monoFont,
            fontWeight: 500,
            fontSize: 13,
            letterSpacing: 0.2,
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: 999,
              background: accent,
              boxShadow: `0 0 20px ${accent}66`,
            }}
          />
          {chip}
        </div>
      ) : null}
      <div
        style={{
          marginTop: chip ? 14 : 0,
          color: "white",
          fontFamily: displayFont,
          fontWeight: 700,
          letterSpacing: -1.05,
          fontSize: 49,
          lineHeight: 1.02,
          textWrap: "balance",
        }}
      >
        {title}
      </div>
      <div
        style={{
          marginTop: 14,
          color: "rgba(255,255,255,0.72)",
          fontFamily: bodyFont,
          fontSize: 21,
          lineHeight: 1.35,
          maxWidth: 620,
        }}
      >
        {body}
      </div>
    </div>
  );
};

const ShotFrame: React.FC<{
  src: string;
  frame: number;
  durationInFrames: number;
  children?: React.ReactNode;
}> = ({ src, frame, durationInFrames, children }) => {
  const { fps } = useVideoConfig();
  const opacity = fadeInOut(frame, durationInFrames, 18, 20);
  const rise = spring({
    frame: frame - 8,
    fps,
    durationInFrames: 40,
    config: { damping: 200 },
  });
  const scale = interpolate(rise, [0, 1], [0.95, 0.91], clamp);
  const y = interpolate(rise, [0, 1], [32, 0], clamp);

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity }}>
      <div
        style={{
          width: 1280,
          height: 720,
          position: "relative",
          transform: `translateY(${y}px) scale(${scale})`,
          transformOrigin: "center",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 28,
            overflow: "hidden",
            border: "1px solid rgba(255,255,255,0.12)",
            boxShadow: "0 44px 120px rgba(0,0,0,0.62)",
          }}
        >
          <Img src={src} style={{ width: "100%", height: "100%" }} />
        </div>
        {children}
      </div>
    </AbsoluteFill>
  );
};

const PulseHighlight: React.FC<{
  rect: HighlightRect;
  label: string;
  accent: string;
  frame: number;
  delay?: number;
}> = ({ rect, label, accent, frame, delay = 0 }) => {
  const appear = interpolate(frame, [delay, delay + 14], [0, 1], clamp);
  const pulse = 0.55 + 0.45 * Math.sin((frame - delay) * 0.22);

  return (
    <div
      style={{
        position: "absolute",
        left: rect.x,
        top: rect.y,
        width: rect.w,
        height: rect.h,
        borderRadius: 22,
        border: `2px solid ${accent}`,
        boxShadow: `0 0 0 ${3 + pulse * 6}px ${accent}1F, 0 12px 40px rgba(0,0,0,0.48)`,
        opacity: appear,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 14,
          top: -16,
          padding: "8px 12px",
          borderRadius: 999,
          background: "rgba(0,0,0,0.7)",
          border: `1px solid ${accent}66`,
          color: "rgba(255,255,255,0.92)",
          fontFamily: monoFont,
          fontWeight: 500,
          fontSize: 13,
        }}
      >
        {label}
      </div>
    </div>
  );
};

const HeroScene: React.FC<SceneProps> = ({ accent, productName, durationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = fadeInOut(frame, durationInFrames, 16, 22);

  const headline = "A prompt becomes a form.";
  const charCount = Math.floor(interpolate(frame, [8, 84], [0, headline.length], clamp));
  const typed = headline.slice(0, charCount);
  const cursorVisible = charCount < headline.length && Math.floor(frame / 7) % 2 === 0;

  const pillars = ["Capture", "Structure", "Fill", "Share"];

  return (
    <AbsoluteFill style={{ padding: "76px 70px", opacity }}>
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 10,
          borderRadius: 999,
          padding: "10px 14px",
          border: `1px solid ${accent}66`,
          background: "rgba(0,0,0,0.48)",
          color: "rgba(255,255,255,0.9)",
          fontFamily: monoFont,
          fontWeight: 500,
          fontSize: 13,
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: 999,
            background: accent,
            boxShadow: `0 0 18px ${accent}66`,
          }}
        />
        PromptFill web app demo
      </div>
      <div
        style={{
          marginTop: 22,
          fontFamily: displayFont,
          fontSize: 74,
          fontWeight: 700,
          letterSpacing: -1.8,
          lineHeight: 0.98,
          color: "white",
          maxWidth: 980,
        }}
      >
        {productName}
        <br />
        {typed}
        {cursorVisible ? <span style={{ opacity: 0.8 }}>|</span> : null}
      </div>
      <div
        style={{
          marginTop: 20,
          color: "rgba(255,255,255,0.73)",
          fontFamily: bodyFont,
          fontSize: 23,
          lineHeight: 1.38,
          maxWidth: 930,
          opacity: interpolate(frame, [30, 76], [0, 1], clamp),
        }}
      >
        Save proven prompts as templates with variables and defaults. Fill only what changes and copy consistent
        output in seconds.
      </div>
      <div
        style={{
          marginTop: 42,
          display: "flex",
          gap: 14,
          alignItems: "center",
        }}
      >
        {pillars.map((pillar, index) => {
          const enter = cardEntry(frame, fps, 56 + index * 8);
          const y = interpolate(enter, [0, 1], [20, 0], clamp);
          return (
            <div
              key={pillar}
              style={{
                minWidth: 172,
                padding: "13px 16px",
                borderRadius: 14,
                border: "1px solid rgba(255,255,255,0.15)",
                background: "linear-gradient(135deg, rgba(255,255,255,0.09), rgba(255,255,255,0.02))",
                color: "rgba(255,255,255,0.95)",
                fontFamily: bodyFont,
                fontWeight: 600,
                fontSize: 20,
                opacity: enter,
                transform: `translateY(${y}px)`,
              }}
            >
              {pillar}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const LibraryScene: React.FC<SceneProps> = ({ accent, durationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const panelEnter = cardEntry(frame, fps, 24);
  const panelX = interpolate(panelEnter, [0, 1], [30, 0], clamp);

  return (
    <AbsoluteFill>
      <SceneHeader
        accent={accent}
        chip="Capture and discover"
        title="Start in the prompt library."
        body="Find reusable templates fast, start from proven use cases, and stop hunting through scattered snippets."
        frame={frame}
      />
      <ShotFrame src={staticFile("ui/promptfill-ui-1280x720.png")} frame={frame} durationInFrames={durationInFrames}>
        <PulseHighlight
          rect={HIGHLIGHTS_1280x720.ui.library}
          label="Search + starter templates"
          accent={accent}
          frame={frame}
          delay={30}
        />
        <PulseHighlight
          rect={HIGHLIGHTS_1280x720.ui.copyActions}
          label="Render + copy actions"
          accent={accent}
          frame={frame}
          delay={58}
        />
      </ShotFrame>
      <div
        style={{
          position: "absolute",
          right: 54,
          top: 182,
          width: 360,
          padding: 18,
          borderRadius: 18,
          border: "1px solid rgba(255,255,255,0.15)",
          background: "rgba(0,0,0,0.5)",
          backdropFilter: "blur(10px)",
          color: "rgba(255,255,255,0.88)",
          fontFamily: bodyFont,
          fontSize: 16,
          lineHeight: 1.4,
          opacity: panelEnter,
          transform: `translateX(${panelX}px)`,
        }}
      >
        <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>What users get</div>
        <div>Capture once, then fill and copy quickly every time the task comes back.</div>
      </div>
    </AbsoluteFill>
  );
};

const ExtractionScene: React.FC<SceneProps> = ({ accent, durationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sceneOpacity = fadeInOut(frame, durationInFrames, 16, 20);
  const inProgress = cardEntry(frame, fps, 14);
  const y = interpolate(inProgress, [0, 1], [28, 0], clamp);
  const scale = interpolate(inProgress, [0, 1], [0.96, 1], clamp);

  const notes = [
    "Found variables from both placeholders and plain text.",
    "Suggested dropdown fields for tone, audience, and format.",
    "Kept existing fields so nothing disappears by surprise.",
  ];
  const proposed = [
    { name: "audience", type: "enum", status: "added" },
    { name: "tone", type: "enum", status: "added" },
    { name: "context", type: "text", status: "added" },
    { name: "recipient_name", type: "string", status: "kept" },
    { name: "cta", type: "string", status: "kept" },
  ];

  return (
    <AbsoluteFill style={{ opacity: sceneOpacity }}>
      <SceneHeader
        accent={accent}
        chip="Structure safely"
        title="Review extraction before you apply."
        body="AI suggests variables and field types, then users approve each change so structure stays reliable."
        frame={frame}
      />
      <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 26 }}>
        <div
          style={{
            width: 992,
            height: 474,
            borderRadius: 28,
            border: "1px solid rgba(255,255,255,0.16)",
            background: "linear-gradient(180deg, rgba(9,11,16,0.96), rgba(6,8,12,0.94))",
            boxShadow: "0 48px 120px rgba(0,0,0,0.55)",
            overflow: "hidden",
            opacity: inProgress,
            transform: `translateY(${y}px) scale(${scale})`,
          }}
        >
          <div
            style={{
              height: 60,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 26px",
              borderBottom: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <div style={{ color: "white", fontFamily: bodyFont, fontWeight: 700, fontSize: 24 }}>
              Review extraction proposal
            </div>
            <div
              style={{
                fontFamily: monoFont,
                fontSize: 12,
                color: "rgba(255,255,255,0.7)",
                borderRadius: 999,
                border: `1px solid ${accent}66`,
                padding: "6px 10px",
              }}
            >
              source: AI extraction
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1.15fr 1fr", height: 414 }}>
            <div
              style={{
                borderRight: "1px solid rgba(255,255,255,0.08)",
                padding: "16px 24px",
              }}
            >
              <div
                style={{
                  color: "rgba(255,255,255,0.9)",
                  fontFamily: bodyFont,
                  fontWeight: 600,
                  fontSize: 16,
                  marginBottom: 10,
                }}
              >
                Proposed template
              </div>
              <div
                style={{
                  borderRadius: 16,
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: "rgba(255,255,255,0.03)",
                  padding: 14,
                  color: "rgba(255,255,255,0.86)",
                  fontFamily: monoFont,
                  lineHeight: 1.42,
                  fontSize: 13,
                  whiteSpace: "pre-wrap",
                }}
              >
                {"Write an email to {{recipient_name}} about {{topic}}.\n\n"}
                {"Audience: {{audience}}\nTone: {{tone}}\n\n"}
                {"Context:\n{{context}}\n\n"}
                {"Close with CTA: {{cta}}"}
              </div>
              <div style={{ marginTop: 14, display: "flex", gap: 8, flexWrap: "wrap" }}>
                {["no silent deletes", "diff before apply", "value preservation"].map((tag, index) => {
                  const pop = cardEntry(frame, fps, 50 + index * 8);
                  return (
                    <div
                      key={tag}
                      style={{
                        padding: "6px 10px",
                        borderRadius: 999,
                        border: "1px solid rgba(255,255,255,0.16)",
                        background: "rgba(255,255,255,0.04)",
                        color: "rgba(255,255,255,0.8)",
                        fontFamily: monoFont,
                        fontSize: 12,
                        opacity: pop,
                      }}
                    >
                      {tag}
                    </div>
                  );
                })}
              </div>
            </div>
            <div style={{ padding: "16px 22px" }}>
              <div style={{ color: "rgba(255,255,255,0.9)", fontFamily: bodyFont, fontWeight: 600, fontSize: 16 }}>
                Suggested variables
              </div>
              <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                {proposed.map((item, index) => {
                  const reveal = cardEntry(frame, fps, 34 + index * 7);
                  const shift = interpolate(reveal, [0, 1], [18, 0], clamp);
                  return (
                    <div
                      key={item.name}
                      style={{
                        borderRadius: 12,
                        padding: "8px 11px",
                        border: "1px solid rgba(255,255,255,0.12)",
                        background: "rgba(255,255,255,0.03)",
                        display: "flex",
                        justifyContent: "space-between",
                        color: "rgba(255,255,255,0.88)",
                        fontFamily: monoFont,
                        fontSize: 12.5,
                        opacity: reveal,
                        transform: `translateX(${shift}px)`,
                      }}
                    >
                      <span>{item.name}</span>
                      <span style={{ color: item.status === "added" ? accent : "rgba(255,255,255,0.65)" }}>
                        {item.type} · {item.status}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div style={{ marginTop: 16 }}>
                <div style={{ color: "rgba(255,255,255,0.9)", fontFamily: bodyFont, fontWeight: 600, fontSize: 15 }}>
                  Inference notes
                </div>
                <div style={{ marginTop: 7, display: "flex", flexDirection: "column", gap: 5 }}>
                  {notes.map((note, index) => {
                    const reveal = cardEntry(frame, fps, 78 + index * 8);
                    return (
                      <div
                        key={note}
                        style={{
                          color: "rgba(255,255,255,0.72)",
                          fontFamily: bodyFont,
                          fontSize: 13.5,
                          opacity: reveal,
                        }}
                      >
                        - {note}
                      </div>
                    );
                  })}
                </div>
              </div>
              <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end", gap: 8 }}>
                <div
                  style={{
                    borderRadius: 10,
                    border: "1px solid rgba(255,255,255,0.15)",
                    padding: "9px 12px",
                    color: "rgba(255,255,255,0.82)",
                    fontFamily: bodyFont,
                    fontWeight: 600,
                    fontSize: 13,
                  }}
                >
                  Cancel
                </div>
                <div
                  style={{
                    borderRadius: 10,
                    border: `1px solid ${accent}7f`,
                    background: `${accent}26`,
                    padding: "9px 12px",
                    color: "white",
                    fontFamily: bodyFont,
                    fontWeight: 700,
                    fontSize: 13,
                  }}
                >
                  Apply extraction
                </div>
              </div>
            </div>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const FillScene: React.FC<SceneProps> = ({ accent, durationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const panelEnter = cardEntry(frame, fps, 24);
  const panelY = interpolate(panelEnter, [0, 1], [24, 0], clamp);
  const promptShift = interpolate(frame, [0, durationInFrames], [0, -26], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.sin),
  });

  return (
    <AbsoluteFill>
      <SceneHeader
        accent={accent}
        chip="Fill fast"
        title="Typed controls make reuse reliable."
        body="Every variable gets the right input. Required fields, defaults, and keyboard-friendly entry keep reuse fast."
        frame={frame}
      />
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          transform: `translateX(${promptShift}px)`,
        }}
      >
        <ShotFrame src={staticFile("ui/promptfill-drawer-1280x720.png")} frame={frame} durationInFrames={durationInFrames}>
          <PulseHighlight
            rect={HIGHLIGHTS_1280x720.drawer.fields}
            label="string · text · enum · number · boolean"
            accent={accent}
            frame={frame}
            delay={34}
          />
        </ShotFrame>
      </AbsoluteFill>
      <div
        style={{
          position: "absolute",
          right: 54,
          top: 170,
          width: 360,
          borderRadius: 20,
          border: "1px solid rgba(255,255,255,0.15)",
          background: "rgba(0,0,0,0.5)",
          padding: 18,
          color: "rgba(255,255,255,0.87)",
          fontFamily: bodyFont,
          opacity: panelEnter,
          transform: `translateY(${panelY}px)`,
        }}
      >
        <div style={{ fontWeight: 700, fontSize: 19, marginBottom: 8 }}>Why this feels fast</div>
        <div style={{ fontSize: 15, lineHeight: 1.45 }}>
          - Required indicators and defaults reduce errors.
          <br />
          - Sensible tab order for rapid keyboard entry.
          <br />
          - Copy action stays one move away.
        </div>
        <div
          style={{
            marginTop: 12,
            padding: "9px 11px",
            borderRadius: 10,
            border: "1px dashed rgba(255,255,255,0.26)",
            fontFamily: monoFont,
            fontSize: 12,
            color: "rgba(255,255,255,0.72)",
          }}
        >
          Shortcut hint: Cmd+Shift+C to copy rendered prompt
        </div>
      </div>
    </AbsoluteFill>
  );
};

const useCaseRows = [
  "Write an email",
  "Rewrite with constraints",
  "Summarize notes",
  "Extract action items",
  "Create a PRD or brief",
  "Launch and social copy",
  "Support reply template",
  "Engineering review prompt",
  "SQL query generator",
  "Rubber duck thinking",
];

const UseCasesScene: React.FC<SceneProps> = ({ accent, durationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sceneOpacity = fadeInOut(frame, durationInFrames, 16, 20);
  const marqueeX = -((frame * 3.1) % 920);
  const featured = [
    { title: "Email outreach", vars: "recipient_name · topic · tone · cta" },
    { title: "Executive summary", vars: "notes · audience · format · length" },
    { title: "Support reply", vars: "customer_message · policy_context · tone" },
    { title: "PRD draft", vars: "context · audience · doc_type · constraints" },
  ];

  return (
    <AbsoluteFill style={{ opacity: sceneOpacity }}>
      <SceneHeader
        accent={accent}
        chip="Real use cases"
        title="Made for repeat writing tasks."
        body="Keep one structure for each job, then update only the changing values. Less rework, more consistent output."
        frame={frame}
      />
      <div style={{ position: "absolute", left: 0, right: 0, top: 304, overflow: "hidden" }}>
        <div
          style={{
            display: "flex",
            gap: 14,
            width: "max-content",
            transform: `translateX(${marqueeX}px)`,
          }}
        >
          {[...useCaseRows, ...useCaseRows].map((item, index) => (
            <div
              key={`${item}-${index}`}
              style={{
                borderRadius: 999,
                border: "1px solid rgba(255,255,255,0.16)",
                padding: "9px 14px",
                background: "rgba(255,255,255,0.04)",
                color: "rgba(255,255,255,0.9)",
                fontFamily: bodyFont,
                fontWeight: 600,
                fontSize: 15,
                whiteSpace: "nowrap",
              }}
            >
              {item}
            </div>
          ))}
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 56,
          right: 56,
          bottom: 56,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 14,
        }}
      >
        {featured.map((card, index) => {
          const reveal = cardEntry(frame, fps, 56 + index * 9);
          const y = interpolate(reveal, [0, 1], [20, 0], clamp);
          return (
            <div
              key={card.title}
              style={{
                borderRadius: 17,
                border: "1px solid rgba(255,255,255,0.16)",
                background: "linear-gradient(145deg, rgba(255,255,255,0.07), rgba(255,255,255,0.02))",
                padding: "14px 16px",
                opacity: reveal,
                transform: `translateY(${y}px)`,
              }}
            >
              <div
                style={{
                  color: "white",
                  fontFamily: bodyFont,
                  fontWeight: 700,
                  fontSize: 19,
                }}
              >
                {card.title}
              </div>
              <div
                style={{
                  marginTop: 8,
                  color: "rgba(255,255,255,0.73)",
                  fontFamily: monoFont,
                  fontSize: 12.5,
                }}
              >
                {card.vars}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const ShareScene: React.FC<SceneProps> = ({ accent, durationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const callout = cardEntry(frame, fps, 28);
  const x = interpolate(callout, [0, 1], [24, 0], clamp);

  return (
    <AbsoluteFill>
      <SceneHeader
        accent={accent}
        chip="Share and portability"
        title="Move prompts without losing structure."
        body="Share links, import payloads, and export your library while keeping variables, defaults, and options intact."
        frame={frame}
      />
      <ShotFrame src={staticFile("ui/promptfill-share-1280x720.png")} frame={frame} durationInFrames={durationInFrames}>
        <PulseHighlight
          rect={HIGHLIGHTS_1280x720.share.linkRow}
          label="Share link + import payload"
          accent={accent}
          frame={frame}
          delay={32}
        />
      </ShotFrame>
      <div
        style={{
          position: "absolute",
          right: 56,
          top: 188,
          width: 320,
          borderRadius: 18,
          border: "1px solid rgba(255,255,255,0.15)",
          background: "rgba(0,0,0,0.55)",
          padding: 18,
          opacity: callout,
          transform: `translateX(${x}px)`,
        }}
      >
        <div
          style={{
            color: "white",
            fontFamily: bodyFont,
            fontWeight: 700,
            fontSize: 19,
          }}
        >
          Local-first by default
        </div>
        <div
          style={{
            marginTop: 8,
            color: "rgba(255,255,255,0.74)",
            fontFamily: bodyFont,
            lineHeight: 1.42,
            fontSize: 15,
          }}
        >
          Export to JSON, re-import with safe merge behavior, and keep workflows resilient across machines.
        </div>
        <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 8 }}>
          {["share link", "import", "export json", "merge-safe"].map((tag) => (
            <div
              key={tag}
              style={{
                borderRadius: 999,
                border: `1px solid ${accent}66`,
                background: `${accent}1f`,
                color: "rgba(255,255,255,0.88)",
                fontFamily: monoFont,
                fontSize: 12,
                padding: "6px 10px",
              }}
            >
              {tag}
            </div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const onboardingSteps = [
  { title: "Explore your library", body: "Find a starter template and open it quickly." },
  { title: "Fill variables and render", body: "Type values once and preview updates live." },
  { title: "Shape the template", body: "Refine schema, defaults, and required fields." },
  { title: "Share or import", body: "Distribute prompt workflows with no drift." },
];

const OnboardingScene: React.FC<SceneProps> = ({ accent, durationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sceneOpacity = fadeInOut(frame, durationInFrames, 16, 18);
  const modal = cardEntry(frame, fps, 10);
  const modalScale = interpolate(modal, [0, 1], [0.96, 1], clamp);
  const modalY = interpolate(modal, [0, 1], [26, 0], clamp);

  const progress = interpolate(frame, [18, durationInFrames - 20], [5, 100], clamp);

  return (
    <AbsoluteFill style={{ opacity: sceneOpacity }}>
      <SceneHeader
        accent={accent}
        chip="Guided onboarding"
        title="Learn the workflow in under 90 seconds."
        body="A first-run walkthrough shows library, fill, build, and share so new users can reuse templates with confidence."
        frame={frame}
      />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div
          style={{
            width: 860,
            borderRadius: 24,
            border: "1px solid rgba(255,255,255,0.16)",
            background: "linear-gradient(180deg, rgba(10,12,17,0.94), rgba(7,9,13,0.94))",
            boxShadow: "0 38px 100px rgba(0,0,0,0.52)",
            padding: 24,
            opacity: modal,
            transform: `translateY(${modalY}px) scale(${modalScale})`,
          }}
        >
          <div style={{ color: "white", fontFamily: bodyFont, fontWeight: 700, fontSize: 27 }}>Guided walkthrough</div>
          <div style={{ marginTop: 8, color: "rgba(255,255,255,0.72)", fontFamily: bodyFont, fontSize: 16 }}>
            Learn PromptFill once. Reuse it every day.
          </div>
          <div
            style={{
              marginTop: 16,
              height: 8,
              borderRadius: 999,
              background: "rgba(255,255,255,0.1)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${progress}%`,
                height: "100%",
                borderRadius: 999,
                background: `linear-gradient(90deg, ${accent}, #7dc6ff)`,
              }}
            />
          </div>
          <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
            {onboardingSteps.map((step, index) => {
              const reveal = cardEntry(frame, fps, 26 + index * 10);
              const complete = interpolate(frame, [40 + index * 28, 58 + index * 28], [0, 1], clamp);
              const borderColor =
                complete > 0.98 ? `${accent}88` : "rgba(255,255,255,0.14)";
              const dotColor = complete > 0.98 ? accent : "rgba(255,255,255,0.34)";
              return (
                <div
                  key={step.title}
                  style={{
                    borderRadius: 14,
                    border: `1px solid ${borderColor}`,
                    background: complete > 0.98 ? `${accent}14` : "rgba(255,255,255,0.03)",
                    padding: "12px 14px",
                    opacity: reveal,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div
                      style={{
                        width: 14,
                        height: 14,
                        borderRadius: 999,
                        background: dotColor,
                        boxShadow: complete > 0.98 ? `0 0 18px ${accent}66` : "none",
                      }}
                    />
                    <div style={{ color: "white", fontFamily: bodyFont, fontWeight: 700, fontSize: 17 }}>
                      {index + 1}. {step.title}
                    </div>
                  </div>
                  <div
                    style={{
                      marginTop: 6,
                      marginLeft: 24,
                      color: "rgba(255,255,255,0.72)",
                      fontFamily: bodyFont,
                      fontSize: 14,
                    }}
                  >
                    {step.body}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const ClosingScene: React.FC<SceneProps> = ({ accent, productName, durationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sceneOpacity = fadeInOut(frame, durationInFrames, 16, 26);
  const cards = [
    {
      title: "Consistent output",
      body: "Reusable structure keeps tone and details stable.",
    },
    {
      title: "Faster drafting",
      body: "Fill variables and copy without rebuilding prompts.",
    },
    {
      title: "Team-ready sharing",
      body: "Share and import templates without losing structure.",
    },
  ];

  return (
    <AbsoluteFill style={{ padding: "72px 58px", opacity: sceneOpacity }}>
      <div
        style={{
          color: "white",
          fontFamily: displayFont,
          fontWeight: 700,
          fontSize: 67,
          lineHeight: 1,
          letterSpacing: -1.3,
          maxWidth: 920,
          textWrap: "balance",
        }}
      >
        {productName}
        <br />
        reusable prompts for real work.
      </div>
      <div
        style={{
          marginTop: 18,
          color: "rgba(255,255,255,0.72)",
          fontFamily: bodyFont,
          fontSize: 23,
          lineHeight: 1.35,
          maxWidth: 860,
        }}
      >
        Capture, structure, fill, preview, and share in one simple system your team can trust.
      </div>
      <div
        style={{
          marginTop: 34,
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: 12,
        }}
      >
        {cards.map((card, index) => {
          const reveal = cardEntry(frame, fps, 30 + index * 9);
          const rise = interpolate(reveal, [0, 1], [22, 0], clamp);
          return (
            <div
              key={card.title}
              style={{
                borderRadius: 16,
                border: "1px solid rgba(255,255,255,0.16)",
                background: "linear-gradient(145deg, rgba(255,255,255,0.07), rgba(255,255,255,0.01))",
                padding: "15px 16px",
                opacity: reveal,
                transform: `translateY(${rise}px)`,
              }}
            >
              <div style={{ color: "white", fontFamily: bodyFont, fontWeight: 700, fontSize: 21 }}>{card.title}</div>
              <div
                style={{
                  marginTop: 6,
                  color: "rgba(255,255,255,0.74)",
                  fontFamily: bodyFont,
                  lineHeight: 1.42,
                  fontSize: 15,
                }}
              >
                {card.body}
              </div>
            </div>
          );
        })}
      </div>
      <div
        style={{
          marginTop: 28,
          display: "inline-flex",
          alignItems: "center",
          gap: 10,
          borderRadius: 999,
          border: `1px solid ${accent}77`,
          background: `${accent}24`,
          color: "white",
          fontFamily: monoFont,
          fontSize: 14,
          padding: "9px 13px",
        }}
      >
        promptfill.app · web app
      </div>
    </AbsoluteFill>
  );
};

const FilmGrain: React.FC = () => (
  <AbsoluteFill style={{ mixBlendMode: "overlay", opacity: 0.14 }}>
    <Img src={grainSvg} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
  </AbsoluteFill>
);

export const PromptFillFlagshipPromo: React.FC<PromptFillFlagshipPromoProps> = ({ accent, productName }) => {
  return (
    <AbsoluteFill
      style={{
        fontFamily: bodyFont,
      }}
    >
      <CinematicBackdrop accent={accent} />
      <Series>
        <Series.Sequence durationInFrames={HERO_FRAMES}>
          <HeroScene accent={accent} productName={productName} durationInFrames={HERO_FRAMES} />
        </Series.Sequence>
        <Series.Sequence durationInFrames={LIBRARY_FRAMES}>
          <LibraryScene accent={accent} productName={productName} durationInFrames={LIBRARY_FRAMES} />
        </Series.Sequence>
        <Series.Sequence durationInFrames={EXTRACTION_FRAMES}>
          <ExtractionScene accent={accent} productName={productName} durationInFrames={EXTRACTION_FRAMES} />
        </Series.Sequence>
        <Series.Sequence durationInFrames={FILL_FRAMES}>
          <FillScene accent={accent} productName={productName} durationInFrames={FILL_FRAMES} />
        </Series.Sequence>
        <Series.Sequence durationInFrames={USE_CASES_FRAMES}>
          <UseCasesScene accent={accent} productName={productName} durationInFrames={USE_CASES_FRAMES} />
        </Series.Sequence>
        <Series.Sequence durationInFrames={SHARE_FRAMES}>
          <ShareScene accent={accent} productName={productName} durationInFrames={SHARE_FRAMES} />
        </Series.Sequence>
        <Series.Sequence durationInFrames={ONBOARDING_FRAMES}>
          <OnboardingScene accent={accent} productName={productName} durationInFrames={ONBOARDING_FRAMES} />
        </Series.Sequence>
        <Series.Sequence durationInFrames={CLOSING_FRAMES}>
          <ClosingScene accent={accent} productName={productName} durationInFrames={CLOSING_FRAMES} />
        </Series.Sequence>
      </Series>
      <FilmGrain />
    </AbsoluteFill>
  );
};
