import "./index.css";
import { Composition, Folder } from "remotion";
import { PromptFillDemo, PromptFillDemoProps } from "./PromptFillDemo";
import {
  PROMPTFILL_FLAGSHIP_DURATION_IN_FRAMES,
  PromptFillFlagshipPromo,
  PromptFillFlagshipPromoProps,
} from "./PromptFillFlagshipPromo";
import {
  ANIMATION_PRINCIPLES_KC_JAZZ_DURATION_IN_FRAMES,
  AnimationPrinciplesKCJazz,
  AnimationPrinciplesKCJazzProps,
} from "./AnimationPrinciplesKCJazz";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Folder name="Marketing">
        <Composition
          id="PromptFillDemo"
          component={PromptFillDemo}
          durationInFrames={36 * 30}
          fps={30}
          width={1280}
          height={720}
          defaultProps={
            {
              accent: "#10a37f",
              productName: "PromptFill",
            } satisfies PromptFillDemoProps
          }
        />
        <Composition
          id="PromptFillFlagshipPromo"
          component={PromptFillFlagshipPromo}
          durationInFrames={PROMPTFILL_FLAGSHIP_DURATION_IN_FRAMES}
          fps={30}
          width={1280}
          height={720}
          defaultProps={
            {
              accent: "#10a37f",
              productName: "PromptFill",
            } satisfies PromptFillFlagshipPromoProps
          }
        />
      </Folder>
      <Folder name="Animation">
        <Composition
          id="AnimationPrinciplesKCJazzMarquee"
          component={AnimationPrinciplesKCJazz}
          durationInFrames={ANIMATION_PRINCIPLES_KC_JAZZ_DURATION_IN_FRAMES}
          fps={30}
          width={1280}
          height={720}
          defaultProps={
            {
              style: "marquee",
            } satisfies AnimationPrinciplesKCJazzProps
          }
        />
        <Composition
          id="AnimationPrinciplesKCJazzSheet"
          component={AnimationPrinciplesKCJazz}
          durationInFrames={ANIMATION_PRINCIPLES_KC_JAZZ_DURATION_IN_FRAMES}
          fps={30}
          width={1280}
          height={720}
          defaultProps={
            {
              style: "sheet",
            } satisfies AnimationPrinciplesKCJazzProps
          }
        />
        <Composition
          id="AnimationPrinciplesKCJazzMidnight"
          component={AnimationPrinciplesKCJazz}
          durationInFrames={ANIMATION_PRINCIPLES_KC_JAZZ_DURATION_IN_FRAMES}
          fps={30}
          width={1280}
          height={720}
          defaultProps={
            {
              style: "midnight",
            } satisfies AnimationPrinciplesKCJazzProps
          }
        />
      </Folder>
      <Folder name="Educational">
        <Composition
          id="AnimationPrinciples"
          component={AnimationPrinciples}
          durationInFrames={60 * 30}
          fps={30}
          width={1280}
          height={720}
          defaultProps={
            {
              accent: "#f59e0b",
            } satisfies AnimationPrinciplesProps
          }
        />
        <Composition
          id="AnimationPrinciplesClassic"
          component={AnimationPrinciplesClassic}
          durationInFrames={60 * 30}
          fps={30}
          width={1280}
          height={720}
          defaultProps={
            {
              accentWarm: "#b45309",
              accentCool: "#1e6091",
            } satisfies AnimationPrinciplesClassicProps
          }
        />
      </Folder>
    </>
  );
};
