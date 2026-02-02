import "./index.css";
import { Composition, Folder } from "remotion";
import { PromptFillDemo, PromptFillDemoProps } from "./PromptFillDemo";

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
    </>
  );
};
