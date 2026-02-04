import "./index.css";
import { Composition, Folder } from "remotion";
import { PromptFillDemo, PromptFillDemoProps } from "./PromptFillDemo";
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
