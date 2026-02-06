import "./index.css";
import { Composition, Folder } from "remotion";
import { StripeBrandKitRoot } from "./brand-kits/stripe/Root";
import { PromptFillDemo, PromptFillDemoProps } from "./PromptFillDemo";

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
      <StripeBrandKitRoot />
    </>
  );
};
