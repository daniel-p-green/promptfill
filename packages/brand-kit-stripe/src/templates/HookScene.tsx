import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { BrandProvider, useBrand } from "../remotion/BrandProvider";
import { Badge } from "../remotion/components/Badge";
import { CTAButton } from "../remotion/components/CTAButton";
import { Subtitle } from "../remotion/components/Subtitle";
import { Title } from "../remotion/components/Title";
import { enterOpacity, enterY, type MotionEnergy } from "../remotion/motion/presets";
import { createBaseStyles, safeZoneStyle } from "../remotion/styles";

export type HookSceneProps = {
  headline: string;
  subheadline: string;
  cta: string;
  energy?: MotionEnergy;
  showSafeGuides?: boolean;
};

const HookSceneInner: React.FC<Omit<HookSceneProps, "energy"> & { energy: MotionEnergy }> = ({
  headline,
  subheadline,
  cta,
  energy,
  showSafeGuides = false,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const { tokens } = useBrand();
  const styles = createBaseStyles(tokens);
  const opacity = enterOpacity(frame, 4, 18);
  const y = enterY(frame, fps, 4, energy);

  return (
    <AbsoluteFill style={styles.frame}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <Img src={staticFile("brand/stripe/logo.svg")} style={{ width: 140, height: 40 }} />
        <Badge label="Brand Hook" />
      </div>

      <div style={{ marginTop: tokens.spacing.lg, opacity, transform: `translateY(${y}px)` }}>
        <Title>{headline}</Title>
      </div>

      <div style={{ marginTop: tokens.spacing.md, opacity }}>
        <Subtitle>{subheadline}</Subtitle>
      </div>

      <div style={{ marginTop: tokens.spacing.xl, opacity }}>
        <CTAButton label={cta} />
      </div>

      {showSafeGuides ? <div style={safeZoneStyle(width, height)} /> : null}
    </AbsoluteFill>
  );
};

export const HookScene: React.FC<HookSceneProps> = ({ energy = "medium", ...props }) => {
  return (
    <BrandProvider energy={energy}>
      <HookSceneInner energy={energy} {...props} />
    </BrandProvider>
  );
};
