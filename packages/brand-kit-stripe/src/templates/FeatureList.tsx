import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { BrandProvider, useBrand } from "../remotion/BrandProvider";
import { Card } from "../remotion/components/Card";
import { Subtitle } from "../remotion/components/Subtitle";
import { Title } from "../remotion/components/Title";
import {
  enterOpacity,
  enterY,
  staggerStart,
  type MotionEnergy,
} from "../remotion/motion/presets";
import { createBaseStyles, safeZoneStyle } from "../remotion/styles";

export type FeatureListProps = {
  features: [string, string, string];
  energy?: MotionEnergy;
  showSafeGuides?: boolean;
};

const FeatureListInner: React.FC<Required<FeatureListProps>> = ({
  features,
  energy,
  showSafeGuides,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const { tokens } = useBrand();
  const styles = createBaseStyles(tokens);

  return (
    <AbsoluteFill style={styles.frame}>
      <div style={{ opacity: enterOpacity(frame, 0, 16), transform: `translateY(${enterY(frame, fps, 0, energy)}px)` }}>
        <Title>Three consistent value beats</Title>
      </div>
      <div style={{ marginTop: tokens.spacing.md, opacity: enterOpacity(frame, 4, 16) }}>
        <Subtitle>Keep spacing, card style, and timing systematic so every edit feels on-brand.</Subtitle>
      </div>

      <div
        style={{
          marginTop: tokens.spacing.xl,
          display: "flex",
          gap: tokens.spacing.md,
        }}
      >
        {features.map((feature, i) => {
          const start = staggerStart(8, i, 7);
          const opacity = enterOpacity(frame, start, 18);
          const y = enterY(frame, fps, start, energy);
          return (
            <div key={feature} style={{ flex: 1, opacity, transform: `translateY(${y}px)` }}>
              <Card
                title={`Feature ${i + 1}`}
                body={feature}
                accent={i === 1}
              />
            </div>
          );
        })}
      </div>

      {showSafeGuides ? <div style={safeZoneStyle(width, height)} /> : null}
    </AbsoluteFill>
  );
};

export const FeatureList: React.FC<FeatureListProps> = ({
  energy = "medium",
  showSafeGuides = false,
  features,
}) => {
  return (
    <BrandProvider energy={energy}>
      <FeatureListInner energy={energy} showSafeGuides={showSafeGuides} features={features} />
    </BrandProvider>
  );
};
