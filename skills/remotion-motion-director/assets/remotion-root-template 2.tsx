import React from "react";
import { AbsoluteFill, Composition, Sequence } from "remotion";
import { PremiumScene } from "./scene-template";

type StoryProps = {
  headline: string;
  proof: string;
  cta: string;
};

export const MotionDirectorStory: React.FC<StoryProps> = ({ headline, proof, cta }) => {
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={90}>
        <PremiumScene
          profile="calm"
          title={headline}
          subtitle="Clarity first. Motion as hierarchy."
        />
      </Sequence>
      <Sequence from={90} durationInFrames={90}>
        <PremiumScene
          profile="measured"
          title="Why it works"
          subtitle={proof}
        />
      </Sequence>
      <Sequence from={180} durationInFrames={60}>
        <PremiumScene
          profile="energetic"
          title={cta}
          subtitle="Built for outcomes, not visual noise."
        />
      </Sequence>
    </AbsoluteFill>
  );
};

export const MotionDirectorCompositions: React.FC = () => {
  return (
    <>
      <Composition
        id="MotionDirectorStory"
        component={MotionDirectorStory}
        width={1920}
        height={1080}
        fps={30}
        durationInFrames={240}
        defaultProps={{
          headline: "Your headline",
          proof: "Your strongest proof point.",
          cta: "Try PromptFill now",
        }}
      />
    </>
  );
};
