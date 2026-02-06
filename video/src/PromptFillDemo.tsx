import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { HIGHLIGHTS_1280x720 } from "./ui/highlights";

const grainSvg =
  "data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%221280%22 height=%22720%22%3E%3Cfilter id=%22n%22 x=%220%22 y=%220%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%222%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%221280%22 height=%22720%22 filter=%22url(%23n)%22 opacity=%220.25%22/%3E%3C/svg%3E";

export type PromptFillDemoProps = {
  productName: string;
  accent: string;
  componentLabel?: string;
};

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const fadeInOut = (frame: number, fadeInStart: number, fadeInEnd: number, fadeOutStart: number, fadeOutEnd: number) => {
  const i = interpolate(frame, [fadeInStart, fadeInEnd], [0, 1], clamp);
  const o = 1 - interpolate(frame, [fadeOutStart, fadeOutEnd], [0, 1], clamp);
  return i * o;
};

const StepPill: React.FC<{ label: string; accent: string; opacity: number }> = ({
  label,
  accent,
  opacity,
}) => (
  <div
    style={{
      position: "absolute",
      left: 58,
      top: 46,
      display: "inline-flex",
      alignItems: "center",
      gap: 10,
      padding: "10px 14px",
      borderRadius: 999,
      background: "rgba(0,0,0,0.55)",
      border: "1px solid rgba(255,255,255,0.12)",
      color: "rgba(255,255,255,0.9)",
      fontSize: 16,
      fontWeight: 650,
      opacity,
      backdropFilter: "blur(8px)",
    }}
  >
    <span
      style={{
        width: 8,
        height: 8,
        borderRadius: 999,
        background: accent,
        boxShadow: `0 0 18px ${accent}55`,
      }}
    />
    {label}
  </div>
);

const HighlightBox: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  accent: string;
  opacity: number;
}> = ({ x, y, w, h, label, accent, opacity }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: w,
      height: h,
      borderRadius: 22,
      border: `2px solid ${accent}AA`,
      boxShadow: `0 0 0 6px ${accent}1A, 0 12px 30px rgba(0,0,0,0.35)`,
      opacity,
      pointerEvents: "none",
    }}
  >
    <div
      style={{
        position: "absolute",
        left: 16,
        top: -16,
        padding: "8px 12px",
        borderRadius: 999,
        background: accent,
        color: "#0b0d10",
        fontSize: 14,
        fontWeight: 700,
        letterSpacing: -0.2,
      }}
    >
      {label}
    </div>
  </div>
);

const Shot: React.FC<{
  src: string;
  opacity: number;
  scale: number;
  children?: React.ReactNode;
}> = ({ src, opacity, scale, children }) => (
  <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity }}>
    <div
      style={{
        width: 1280,
        height: 720,
        transform: `scale(${scale})`,
        transformOrigin: "center",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 32,
          overflow: "hidden",
          boxShadow: "0 40px 140px rgba(0,0,0,0.55)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <Img src={src} style={{ width: "100%", height: "100%" }} />
      </div>
      {children}
    </div>
  </AbsoluteFill>
);

export const PromptFillDemo: React.FC<PromptFillDemoProps> = ({
  productName,
  accent,
  componentLabel = "Web App component",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const uiStart = 4 * fps; // 4s
  const drawerStart = 14 * fps; // 14s
  const shareStart = 24 * fps; // 24s
  const closingStart = 32 * fps; // 32s
  const totalFrames = 36 * fps; // 36s

  /**
   * Highlight boxes are based on Playwright-measured DOM bounding boxes at a
   * 1280x720 viewport. If the UI layout changes, re-capture and update.
   */
  const uiLibraryBox = HIGHLIGHTS_1280x720.ui.library;
  const uiCopyBox = HIGHLIGHTS_1280x720.ui.copyActions;
  const drawerFieldsBox = HIGHLIGHTS_1280x720.drawer.fields;
  const shareLinkBox = HIGHLIGHTS_1280x720.share.linkRow;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0b0d10",
      }}
    >
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(900px 520px at 55% 18%, rgba(255,255,255,0.08), rgba(0,0,0,0) 62%)",
        }}
      />
      <AbsoluteFill
        style={{
          background:
            `radial-gradient(900px 560px at 14% 32%, ${accent}18, rgba(0,0,0,0) 55%)`,
          opacity: 0.9,
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0) 30%)",
          opacity: 0.4,
        }}
      />

      {/* Hero */}
      <AbsoluteFill style={{ padding: 72 }}>
        <div
          style={{
            opacity: fadeInOut(frame, 0, 18, uiStart - 18, uiStart),
            transform: `translateY(${interpolate(frame, [0, uiStart], [12, 0], clamp)}px)`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: 999,
                background: accent,
                boxShadow: `0 0 22px ${accent}66`,
              }}
            />
            <div style={{ fontSize: 18, fontWeight: 700, color: "rgba(255,255,255,0.92)" }}>
              {productName}
            </div>
            <div style={{ fontSize: 15, fontWeight: 600, color: "rgba(255,255,255,0.66)" }}>
              {componentLabel}
            </div>
          </div>

          <div
            style={{
              marginTop: 18,
              fontSize: 54,
              fontWeight: 760,
              letterSpacing: -1.2,
              color: "white",
              lineHeight: 1.02,
              maxWidth: 980,
            }}
          >
            Design in web.
            <br />
            Prototype the full workflow.
          </div>
          <div
            style={{
              marginTop: 16,
              fontSize: 22,
              color: "rgba(255,255,255,0.70)",
              maxWidth: 900,
              lineHeight: 1.35,
            }}
          >
            Use the web surface as the fast lab for library UX, variable controls, and rendering polish before native
            ChatGPT handoff.
          </div>
        </div>
      </AbsoluteFill>

      {/* UI */}
      {(() => {
        const opacity = fadeInOut(frame, uiStart - 12, uiStart + 10, drawerStart - 14, drawerStart);
        const pop = spring({ fps, frame: frame - uiStart, config: { damping: 16, mass: 0.7 } });
        const scale = interpolate(pop, [0, 1], [0.975, 0.92], clamp);
        const highlightOpacity = fadeInOut(frame, uiStart + 12, uiStart + 26, drawerStart - 24, drawerStart - 10);
        return (
          <>
            <Shot src={staticFile("ui/promptfill-ui-1280x720.png")} opacity={opacity} scale={scale}>
              <StepPill label="1 · Choose a prompt" accent={accent} opacity={highlightOpacity} />
              <HighlightBox
                x={uiLibraryBox.x}
                y={uiLibraryBox.y}
                w={uiLibraryBox.w}
                h={uiLibraryBox.h}
                label="Library"
                accent={accent}
                opacity={highlightOpacity}
              />
              <HighlightBox
                x={uiCopyBox.x}
                y={uiCopyBox.y}
                w={uiCopyBox.w}
                h={uiCopyBox.h}
                label="Copy anywhere"
                accent={accent}
                opacity={highlightOpacity}
              />
            </Shot>
          </>
        );
      })()}

      {/* Drawer */}
      {(() => {
        const opacity = fadeInOut(frame, drawerStart - 12, drawerStart + 10, shareStart - 14, shareStart);
        const pop = spring({ fps, frame: frame - drawerStart, config: { damping: 16, mass: 0.7 } });
        const scale = interpolate(pop, [0, 1], [0.975, 0.92], clamp);
        const highlightOpacity = fadeInOut(frame, drawerStart + 12, drawerStart + 26, shareStart - 24, shareStart - 10);
        return (
          <Shot src={staticFile("ui/promptfill-drawer-1280x720.png")} opacity={opacity} scale={scale}>
            <StepPill label="2 · Fill variables" accent={accent} opacity={highlightOpacity} />
            <HighlightBox
              x={drawerFieldsBox.x}
              y={drawerFieldsBox.y}
              w={drawerFieldsBox.w}
              h={drawerFieldsBox.h}
              label="Dropdowns, text, booleans"
              accent={accent}
              opacity={highlightOpacity}
            />
          </Shot>
        );
      })()}

      {/* Share */}
      {(() => {
        const opacity = fadeInOut(frame, shareStart - 12, shareStart + 10, closingStart - 14, closingStart);
        const pop = spring({ fps, frame: frame - shareStart, config: { damping: 16, mass: 0.7 } });
        const scale = interpolate(pop, [0, 1], [0.975, 0.92], clamp);
        const highlightOpacity = fadeInOut(frame, shareStart + 12, shareStart + 26, closingStart - 24, closingStart - 10);
        return (
          <Shot src={staticFile("ui/promptfill-share-1280x720.png")} opacity={opacity} scale={scale}>
            <StepPill label="3 · Share and reuse" accent={accent} opacity={highlightOpacity} />
            <HighlightBox
              x={shareLinkBox.x}
              y={shareLinkBox.y}
              w={shareLinkBox.w}
              h={shareLinkBox.h}
              label="Send a link"
              accent={accent}
              opacity={highlightOpacity}
            />
          </Shot>
        );
      })()}

      {/* Closing */}
      <AbsoluteFill style={{ justifyContent: "center", padding: 72 }}>
        <div
          style={{
            opacity: fadeInOut(frame, closingStart - 10, closingStart + 10, totalFrames - 20, totalFrames),
          }}
        >
          <div style={{ fontSize: 44, fontWeight: 760, letterSpacing: -0.9, color: "white" }}>
            {componentLabel}
          </div>
          <div style={{ marginTop: 14, fontSize: 20, color: "rgba(255,255,255,0.68)", maxWidth: 820 }}>
            Design and validate prompt-library interactions quickly, then ship the best loop to the native ChatGPT
            surface.
          </div>
          <div
            style={{
              marginTop: 26,
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              padding: "12px 16px",
              borderRadius: 999,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.14)",
              color: "rgba(255,255,255,0.88)",
              fontSize: 16,
              fontWeight: 650,
            }}
          >
            <span style={{ color: accent }}>{productName}</span>
            <span style={{ color: "rgba(255,255,255,0.55)" }}>·</span>
            Design/prototyping lab for the full project.
          </div>
        </div>
      </AbsoluteFill>

      {/* film grain */}
      <AbsoluteFill
        style={{
          mixBlendMode: "overlay",
          opacity: 0.12,
        }}
      >
        <Img
          src={grainSvg}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
