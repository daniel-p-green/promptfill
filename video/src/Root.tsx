import "./index.css";
import { Composition, Folder } from "remotion";
import { PromptFillDemo, PromptFillDemoProps } from "./PromptFillDemo";
import {
  PROMPTFILL_FLAGSHIP_DURATION_IN_FRAMES,
  PromptFillFlagshipPromo,
  PromptFillFlagshipPromoProps,
} from "./PromptFillFlagshipPromo";
import {
  PROMPTFILL_USER_STORY_DURATION_IN_FRAMES,
  PromptFillUserStory,
  PromptFillUserStoryProps,
} from "./PromptFillUserStorySeries";
import {
  ANIMATION_PRINCIPLES_KC_JAZZ_DURATION_IN_FRAMES,
  AnimationPrinciplesKCJazz,
  AnimationPrinciplesKCJazzProps,
} from "./AnimationPrinciplesKCJazz";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Folder name="PromptFill-Ultimate-Demos">
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
              componentLabel: "Web App component",
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
              componentLabel: "ChatGPT Apps SDK component",
            } satisfies PromptFillFlagshipPromoProps
          }
        />
      </Folder>
      <Folder name="End-User-Series">
        <Composition
          id="PromptFillUserStoryEmail"
          component={PromptFillUserStory}
          durationInFrames={PROMPTFILL_USER_STORY_DURATION_IN_FRAMES}
          fps={30}
          width={1280}
          height={720}
          defaultProps={
            {
              accent: "#10a37f",
              productName: "PromptFill",
              story: "email",
            } satisfies PromptFillUserStoryProps
          }
        />
        <Composition
          id="PromptFillUserStorySummary"
          component={PromptFillUserStory}
          durationInFrames={PROMPTFILL_USER_STORY_DURATION_IN_FRAMES}
          fps={30}
          width={1280}
          height={720}
          defaultProps={
            {
              accent: "#10a37f",
              productName: "PromptFill",
              story: "summary",
            } satisfies PromptFillUserStoryProps
          }
        />
        <Composition
          id="PromptFillUserStorySupport"
          component={PromptFillUserStory}
          durationInFrames={PROMPTFILL_USER_STORY_DURATION_IN_FRAMES}
          fps={30}
          width={1280}
          height={720}
          defaultProps={
            {
              accent: "#10a37f",
              productName: "PromptFill",
              story: "support",
            } satisfies PromptFillUserStoryProps
          }
        />
        <Composition
          id="PromptFillUserStoryPRD"
          component={PromptFillUserStory}
          durationInFrames={PROMPTFILL_USER_STORY_DURATION_IN_FRAMES}
          fps={30}
          width={1280}
          height={720}
          defaultProps={
            {
              accent: "#10a37f",
              productName: "PromptFill",
              story: "prd",
            } satisfies PromptFillUserStoryProps
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
    </>
  );
};
