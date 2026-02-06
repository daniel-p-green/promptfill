import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { BrandProvider, useBrand } from "../remotion/BrandProvider";
import { Card } from "../remotion/components/Card";
import { Subtitle } from "../remotion/components/Subtitle";
import { Title } from "../remotion/components/Title";
import { enterOpacity, enterY, type MotionEnergy } from "../remotion/motion/presets";
import { createBaseStyles, safeZoneStyle } from "../remotion/styles";

export type ProblemSolutionProps = {
  problem: string;
  solution: string;
  energy?: MotionEnergy;
  showSafeGuides?: boolean;
};

const ProblemSolutionInner: React.FC<Required<ProblemSolutionProps>> = ({
  problem,
  solution,
  energy,
  showSafeGuides,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const { tokens } = useBrand();
  const styles = createBaseStyles(tokens);
  const opacity = enterOpacity(frame, 2, 18);
  const y = enterY(frame, fps, 2, energy);

  return (
    <AbsoluteFill style={styles.frame}>
      <div style={{ maxWidth: 900, opacity, transform: `translateY(${y}px)` }}>
        <Title>From friction to flow</Title>
      </div>
      <div style={{ marginTop: tokens.spacing.md, opacity }}>
        <Subtitle>Show the pain quickly, then resolve with one clear product motion beat.</Subtitle>
      </div>

      <div
        style={{
          marginTop: tokens.spacing.xl,
          display: "flex",
          gap: tokens.spacing.md,
        }}
      >
        <Card title="Problem" body={problem} />
        <Card title="Solution" body={solution} accent />
      </div>

      {showSafeGuides ? <div style={safeZoneStyle(width, height)} /> : null}
    </AbsoluteFill>
  );
};

export const ProblemSolution: React.FC<ProblemSolutionProps> = ({
  energy = "medium",
  showSafeGuides = false,
  problem,
  solution,
}) => {
  return (
    <BrandProvider energy={energy}>
      <ProblemSolutionInner
        energy={energy}
        showSafeGuides={showSafeGuides}
        problem={problem}
        solution={solution}
      />
    </BrandProvider>
  );
};
