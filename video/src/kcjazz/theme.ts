import { KCJAZZ_FONTS } from "./fonts";

export type KCJazzStyle = "marquee" | "sheet" | "midnight";

export type KCJazzTheme = {
  style: KCJazzStyle;
  colors: {
    bg0: string;
    bg1: string;
    panel: string;
    ink: string;
    paper: string;
    gold: string;
    teal: string;
    burgundy: string;
    mutedText: string;
  };
  font: {
    body: string;
    display: string;
  };
};

export const getKCJazzTheme = (style: KCJazzStyle): KCJazzTheme => {
  if (style === "sheet") {
    return {
      style,
      colors: {
        bg0: "#f6f1e6",
        bg1: "#efe7d8",
        panel: "rgba(255,255,255,0.72)",
        ink: "#141414",
        paper: "#ffffff",
        gold: "#b8832b",
        teal: "#0f766e",
        burgundy: "#7a1f2f",
        mutedText: "rgba(20,20,20,0.64)",
      },
      font: KCJAZZ_FONTS,
    };
  }

  if (style === "midnight") {
    return {
      style,
      colors: {
        bg0: "#050814",
        bg1: "#0b1230",
        panel: "rgba(255,255,255,0.06)",
        ink: "#f6f3ea",
        paper: "rgba(255,255,255,0.08)",
        gold: "#f6c86f",
        teal: "#2dd4bf",
        burgundy: "#8b2e41",
        mutedText: "rgba(246,243,234,0.70)",
      },
      font: KCJAZZ_FONTS,
    };
  }

  return {
    style: "marquee",
    colors: {
      bg0: "#070a15",
      bg1: "#0b1632",
      panel: "rgba(255,255,255,0.06)",
      ink: "#f6f3ea",
      paper: "rgba(255,255,255,0.08)",
      gold: "#f5c451",
      teal: "#34d399",
      burgundy: "#7a2033",
      mutedText: "rgba(246,243,234,0.72)",
    },
    font: KCJAZZ_FONTS,
  };
};

