import React from "react";
import { loadFont as loadBodyFont } from "@remotion/google-fonts/Manrope";
import { loadFont as loadDisplayFont } from "@remotion/google-fonts/SpaceGrotesk";
import { loadFont as loadMonoFont } from "@remotion/google-fonts/IBMPlexMono";
import {
  AbsoluteFill,
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

export const PROMPTFILL_CHATGPT_APP_DEMO_DURATION_IN_FRAMES = 24 * 30;

export type PromptFillChatGPTAppDemoProps = {
  accent: string;
  productName: string;
};

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const fadeInOut = (
  frame: number,
  fadeInStart: number,
  fadeInEnd: number,
  fadeOutStart: number,
  fadeOutEnd: number
) => {
  const intro = interpolate(frame, [fadeInStart, fadeInEnd], [0, 1], clamp);
  const outro = 1 - interpolate(frame, [fadeOutStart, fadeOutEnd], [0, 1], clamp);
  return intro * outro;
};

const StepChip: React.FC<{
  label: string;
  accent: string;
  active: boolean;
  x: number;
}> = ({ label, accent, active, x }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: 50,
      borderRadius: 999,
      padding: "8px 13px",
      border: `1px solid ${active ? accent : "rgba(255,255,255,0.24)"}`,
      background: active ? `${accent}28` : "rgba(4,8,13,0.7)",
      color: "rgba(255,255,255,0.9)",
      fontFamily: monoFont,
      fontSize: 13,
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
      boxShadow: active ? `0 0 24px ${accent}55` : "none",
    }}
  >
    {label}
  </div>
);

const Highlight: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  accent: string;
  label: string;
  opacity: number;
}> = ({ x, y, w, h, accent, label, opacity }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: w,
      height: h,
      borderRadius: 18,
      border: `2px solid ${accent}`,
      boxShadow: `0 0 0 5px ${accent}26, 0 18px 36px rgba(0,0,0,0.4)`,
      opacity,
    }}
  >
    <div
      style={{
        position: "absolute",
        left: 12,
        top: -16,
        borderRadius: 999,
        border: `1px solid ${accent}88`,
        background: "rgba(5,10,16,0.82)",
        color: "rgba(255,255,255,0.92)",
        fontFamily: monoFont,
        fontSize: 12,
        padding: "6px 10px",
      }}
    >
      {label}
    </div>
  </div>
);

export const PromptFillChatGPTAppDemo: React.FC<PromptFillChatGPTAppDemoProps> = ({
  accent,
  productName,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const heroEnd = 6 * fps;
  const middleEnd = 18 * fps;
  const total = PROMPTFILL_CHATGPT_APP_DEMO_DURATION_IN_FRAMES;

  const heroOpacity = fadeInOut(frame, 0, 18, heroEnd - 14, heroEnd + 2);
  const stageOpacity = fadeInOut(frame, heroEnd - 10, heroEnd + 16, total - 24, total - 2);
  const cardRise = spring({
    fps,
    frame: frame - heroEnd,
    durationInFrames: 30,
    config: { damping: 180 },
  });
  const cardScale = interpolate(cardRise, [0, 1], [0.97, 0.92], clamp);
  const cardY = interpolate(cardRise, [0, 1], [28, 0], clamp);

  const step1Active = frame < heroEnd + 90;
  const step2Active = frame >= heroEnd + 90 && frame < middleEnd;
  const step3Active = frame >= middleEnd;

  const fieldsGlow = fadeInOut(frame, heroEnd + 16, heroEnd + 34, heroEnd + 152, heroEnd + 172);
  const copyGlow = fadeInOut(frame, middleEnd + 6, middleEnd + 20, total - 22, total - 6);

  return (
    <AbsoluteFill style={{ backgroundColor: "#05080e" }}>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(840px 480px at 20% 18%, rgba(16,163,127,0.24), rgba(0,0,0,0) 62%)",
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(120deg, rgba(4,9,15,0.92), rgba(4,8,13,0.72) 48%, rgba(4,8,13,0.55))",
        }}
      />

      <AbsoluteFill style={{ padding: "56px 56px 0 56px", opacity: heroOpacity }}>
        <div
          style={{
            color: "rgba(255,255,255,0.9)",
            fontFamily: monoFont,
            fontSize: 14,
            letterSpacing: 0.1,
          }}
        >
          {productName} · ChatGPT app
        </div>
        <div
          style={{
            marginTop: 16,
            color: "white",
            fontFamily: displayFont,
            fontWeight: 700,
            fontSize: 74,
            lineHeight: 0.96,
            letterSpacing: -1.2,
            maxWidth: 960,
            textWrap: "balance",
          }}
        >
          Structure and reuse prompts without leaving chat.
        </div>
        <div
          style={{
            marginTop: 14,
            color: "rgba(255,255,255,0.8)",
            fontFamily: bodyFont,
            fontSize: 28,
            lineHeight: 1.2,
            maxWidth: 900,
            textWrap: "balance",
          }}
        >
          Extract fields, fill only what changes, then send the final prompt back into the conversation.
        </div>
      </AbsoluteFill>

      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: stageOpacity }}>
        <div
          style={{
            width: 1280,
            height: 720,
            transform: `translateY(${cardY}px) scale(${cardScale})`,
            transformOrigin: "center",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 30,
              overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.16)",
              boxShadow: "0 42px 120px rgba(0,0,0,0.55)",
            }}
          >
            <Img
              src={staticFile("ui/promptfill-inline-1280x720.png")}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
          <AbsoluteFill
            style={{
              background:
                "linear-gradient(180deg, rgba(4,8,13,0.06) 0%, rgba(4,8,13,0.38) 72%, rgba(4,8,13,0.58) 100%)",
              borderRadius: 30,
            }}
          />

          <StepChip label="1 · Extract fields" accent={accent} active={step1Active} x={44} />
          <StepChip label="2 · Fill and render" accent={accent} active={step2Active} x={316} />
          <StepChip label="3 · Send to chat" accent={accent} active={step3Active} x={564} />

          <Highlight
            x={838}
            y={96}
            w={390}
            h={446}
            accent={accent}
            label="Fill variables in card"
            opacity={fieldsGlow}
          />
          <Highlight
            x={1066}
            y={614}
            w={170}
            h={52}
            accent={accent}
            label="Send back to chat"
            opacity={copyGlow}
          />
        </div>
      </AbsoluteFill>

      <div
        style={{
          position: "absolute",
          left: 62,
          right: 62,
          bottom: 42,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
          opacity: stageOpacity,
        }}
      >
        <div
          style={{
            borderRadius: 18,
            border: "1px solid rgba(255,255,255,0.16)",
            background: "rgba(5,10,16,0.8)",
            padding: "14px 16px",
          }}
        >
          <div
            style={{
              color: "white",
              fontFamily: bodyFont,
              fontWeight: 700,
              fontSize: 20,
            }}
          >
            Same flow, fewer retries
          </div>
          <div
            style={{
              marginTop: 6,
              color: "rgba(255,255,255,0.82)",
              fontFamily: bodyFont,
              fontSize: 16,
              lineHeight: 1.28,
            }}
          >
            Keep structure stable while values change turn to turn.
          </div>
        </div>
        <div
          style={{
            borderRadius: 18,
            border: "1px solid rgba(255,255,255,0.16)",
            background: "rgba(5,10,16,0.8)",
            padding: "14px 16px",
          }}
        >
          <div
            style={{
              color: "white",
              fontFamily: bodyFont,
              fontWeight: 700,
              fontSize: 20,
            }}
          >
            Conversation-first card
          </div>
          <div
            style={{
              marginTop: 6,
              color: "rgba(255,255,255,0.82)",
              fontFamily: bodyFont,
              fontSize: 16,
              lineHeight: 1.28,
            }}
          >
            Two quick actions: open when needed, or copy and keep going.
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
