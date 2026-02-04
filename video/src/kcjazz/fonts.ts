import { loadFont as loadFraunces } from "@remotion/google-fonts/Fraunces";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";

const inter = loadInter("normal", {
  weights: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
});

const fraunces = loadFraunces("normal", {
  weights: ["600", "700", "800"],
  subsets: ["latin"],
});

export const KCJAZZ_FONTS = {
  body: inter.fontFamily,
  display: fraunces.fontFamily,
};

