import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const Window: React.FC<{
  title: string;
  children: React.ReactNode;
  idx: number;
}> = ({ title, children, idx }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const start = idx * 12;
  const s = spring({ fps, frame: frame - start, config: { damping: 18 } });
  const o = interpolate(frame, [start, start + 10], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        borderRadius: 20,
        border: "1px solid rgba(255,255,255,0.12)",
        background: "rgba(255,255,255,0.04)",
        overflow: "hidden",
        transform: `translateY(${(1 - s) * 16}px)`,
        opacity: o,
        boxShadow: "0 30px 120px rgba(0,0,0,0.45)",
      }}
    >
      <div
        style={{
          height: 46,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 16px",
          borderBottom: "1px solid rgba(255,255,255,0.10)",
          background: "rgba(0,0,0,0.25)",
        }}
      >
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ width: 10, height: 10, borderRadius: 99, background: "#ff5f57" }} />
          <div style={{ width: 10, height: 10, borderRadius: 99, background: "#febc2e" }} />
          <div style={{ width: 10, height: 10, borderRadius: 99, background: "#28c840" }} />
        </div>
        <div style={{ color: "rgba(255,255,255,0.78)", fontSize: 14 }}>{title}</div>
        <div style={{ width: 40 }} />
      </div>
      <div style={{ padding: 22 }}>{children}</div>
    </div>
  );
};

const Pill: React.FC<{ text: string; accent: string }> = ({ text, accent }) => (
  <div
    style={{
      padding: "10px 12px",
      borderRadius: 999,
      border: "1px solid rgba(255,255,255,0.10)",
      background: "rgba(255,255,255,0.04)",
      color: "rgba(255,255,255,0.82)",
      fontSize: 14,
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
    }}
  >
    <span style={{ width: 6, height: 6, borderRadius: 99, background: accent }} />
    {text}
  </div>
);

export const FlowDemo: React.FC<{ accent: string; productName: string }> = ({
  accent,
  productName,
}) => {
  const frame = useCurrentFrame();
  const titleO = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ padding: 70, justifyContent: "center" }}>
      <div style={{ maxWidth: 1100, width: "100%" }}>
        <div style={{ opacity: titleO }}>
          <div style={{ color: "white", fontSize: 44, fontWeight: 650, letterSpacing: -0.6 }}>
            A quick run-through
          </div>
          <div style={{ marginTop: 12, color: "rgba(255,255,255,0.68)", fontSize: 20 }}>
            Library → Fill → Preview → Copy
          </div>
        </div>

        <div style={{ marginTop: 26, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
          <Window title={`${productName} · Library`} idx={0}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
              <Pill accent={accent} text="Search prompts" />
              <div
                style={{
                  padding: "10px 12px",
                  borderRadius: 12,
                  background: accent,
                  color: "#07110a",
                  fontWeight: 650,
                  fontSize: 14,
                }}
              >
                New prompt
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                "Summarize for Executives",
                "Rewrite in Friendly Tone",
                "Extract Action Items",
                "Generate SQL Query",
              ].map((t) => (
                <div
                  key={t}
                  style={{
                    padding: "12px 14px",
                    borderRadius: 14,
                    border: "1px solid rgba(255,255,255,0.10)",
                    background: "rgba(255,255,255,0.03)",
                    color: "rgba(255,255,255,0.82)",
                    fontSize: 16,
                  }}
                >
                  {t}
                </div>
              ))}
            </div>
          </Window>

          <Window title={`${productName} · Fill variables`} idx={1}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: 12, alignItems: "center" }}>
                <div style={{ color: "rgba(255,255,255,0.65)", fontSize: 14 }}>Audience</div>
                <div
                  style={{
                    padding: "10px 12px",
                    borderRadius: 12,
                    border: "1px solid rgba(255,255,255,0.10)",
                    background: "rgba(255,255,255,0.03)",
                    color: "white",
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  Executives <span style={{ color: "rgba(255,255,255,0.5)" }}>▾</span>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: 12, alignItems: "center" }}>
                <div style={{ color: "rgba(255,255,255,0.65)", fontSize: 14 }}>Tone</div>
                <div
                  style={{
                    padding: "10px 12px",
                    borderRadius: 12,
                    border: `1px solid ${accent}55`,
                    background: `${accent}14`,
                    color: "white",
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  Concise <span style={{ color: "rgba(255,255,255,0.6)" }}>▾</span>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: 12, alignItems: "center" }}>
                <div style={{ color: "rgba(255,255,255,0.65)", fontSize: 14 }}>Context</div>
                <div
                  style={{
                    padding: "10px 12px",
                    borderRadius: 12,
                    border: "1px solid rgba(255,255,255,0.10)",
                    background: "rgba(255,255,255,0.03)",
                    color: "rgba(255,255,255,0.7)",
                  }}
                >
                  Paste notes here…
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
                <div
                  style={{
                    padding: "10px 14px",
                    borderRadius: 12,
                    background: accent,
                    color: "#07110a",
                    fontWeight: 650,
                    fontSize: 14,
                  }}
                >
                  Render
                </div>
              </div>
            </div>
          </Window>

          <Window title={`${productName} · Preview`} idx={2}>
            <div
              style={{
                borderRadius: 14,
                border: "1px solid rgba(255,255,255,0.10)",
                background: "rgba(0,0,0,0.25)",
                padding: 16,
                color: "rgba(255,255,255,0.85)",
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                fontSize: 13,
                lineHeight: 1.5,
                whiteSpace: "pre-wrap",
              }}
            >
              {`Summarize the following for executives.\n\nTone: concise\n\nContext:\n• Q4 churn rose 1.2%\n• Top driver: onboarding drop-off\n\nOutput:\n- 3 bullets\n- One recommendation`}
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14 }}>
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: 12,
                  background: "rgba(255,255,255,0.08)",
                  border: `1px solid ${accent}55`,
                  color: "white",
                  fontWeight: 650,
                  fontSize: 14,
                }}
              >
                Copy
              </div>
            </div>
          </Window>

          <Window title={`${productName} · Export`} idx={3}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 18, fontWeight: 650 }}>
                Local-first, portable
              </div>
              <div style={{ color: "rgba(255,255,255,0.68)", fontSize: 16, lineHeight: 1.4 }}>
                Keep everything on your machine. Export your library as JSON whenever you want.
              </div>
              <div
                style={{
                  marginTop: 6,
                  padding: "12px 14px",
                  borderRadius: 14,
                  border: "1px solid rgba(255,255,255,0.10)",
                  background: "rgba(255,255,255,0.03)",
                  color: "rgba(255,255,255,0.75)",
                  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                  fontSize: 12,
                }}
              >
                {`GET /api/export\n{ prompts: [...], variables: [...], optionSets: [...] }`}
              </div>
            </div>
          </Window>
        </div>
      </div>
    </AbsoluteFill>
  );
};
