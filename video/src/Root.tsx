import "./index.css";
import { Composition, Folder } from "remotion";
import { PromptFillDemo, PromptFillDemoProps } from "./PromptFillDemo";
import {
  AnimationPrinciples,
  AnimationPrinciplesProps,
} from "./AnimationPrinciples";
import {
  AnimationPrinciplesClassic,
  AnimationPrinciplesClassicProps,
} from "./AnimationPrinciplesClassic";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Folder name="Marketing">
        <Composition
          id="PromptFillDemo"
          component={PromptFillDemo}
          durationInFrames={60 * 30}
          fps={30}
          width={1280}
          height={720}
          defaultProps={
            {
              accent: "#22c55e",
              productName: "PromptFill",
            } satisfies PromptFillDemoProps
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
