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
import {
  AnimationPrinciples,
  AnimationPrinciplesProps,
} from "./AnimationPrinciples";
import {
  AnimationPrinciplesClassic,
  AnimationPrinciplesClassicProps,
} from "./AnimationPrinciplesClassic";
import {
  PROMPTFILL_USER_STORY_DURATION_IN_FRAMES,
  PromptFillUserStory,
  PromptFillUserStoryProps,
} from "./PromptFillUserStorySeries";
import {
  PROMPTFILL_CHATGPT_APP_DEMO_DURATION_IN_FRAMES,
  PromptFillChatGPTAppDemo,
  PromptFillChatGPTAppDemoProps,
} from "./PromptFillChatGPTAppDemo";

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
        <Composition
          id="PromptFillChatGPTAppDemo"
          component={PromptFillChatGPTAppDemo}
          durationInFrames={PROMPTFILL_CHATGPT_APP_DEMO_DURATION_IN_FRAMES}
          fps={30}
          width={1280}
          height={720}
          defaultProps={
            {
              accent: "#10a37f",
              productName: "PromptFill",
            } satisfies PromptFillChatGPTAppDemoProps
          }
        />
      </Folder>
      <Folder name="UserStories">
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
              variant: "email",
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
              variant: "summary",
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
              variant: "support",
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
              variant: "prd",
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
