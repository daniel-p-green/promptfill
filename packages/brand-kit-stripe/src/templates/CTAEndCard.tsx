import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { BrandProvider, useBrand } from "../remotion/BrandProvider";
import { CTAButton } from "../remotion/components/CTAButton";
import { LowerThird } from "../remotion/components/LowerThird";
import { Title } from "../remotion/components/Title";
import { enterOpacity, enterY, type MotionEnergy } from "../remotion/motion/presets";
import { createBaseStyles, safeZoneStyle } from "../remotion/styles";

export type CTAEndCardProps = {
  headline: string;
  cta: string;
  lowerThirdHeading: string;
  lowerThirdSubheading: string;
  energy?: MotionEnergy;
  showSafeGuides?: boolean;
};

const CTAEndCardInner: React.FC<Required<CTAEndCardProps>> = ({
  headline,
  cta,
  lowerThirdHeading,
  lowerThirdSubheading,
  energy,
  showSafeGuides,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const { tokens } = useBrand();
  const styles = createBaseStyles(tokens);
  const opacity = enterOpacity(frame, 2, 16);

  return (
    <AbsoluteFill style={styles.frame}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <Img src={staticFile("brand/stripe/logo.svg")} style={{ width: 120, height: 34 }} />
      </div>

      <div style={{ marginTop: tokens.spacing.xl, opacity, transform: `translateY(${enterY(frame, fps, 2, energy)}px)` }}>
        <Title maxWidth={760}>{headline}</Title>
      </div>

      <div style={{ marginTop: tokens.spacing.lg, opacity }}>
        <CTAButton label={cta} />
      </div>

      <LowerThird heading={lowerThirdHeading} subheading={lowerThirdSubheading} />
      {showSafeGuides ? <div style={safeZoneStyle(width, height)} /> : null}
    </AbsoluteFill>
  );
};

export const CTAEndCard: React.FC<CTAEndCardProps> = ({
  energy = "medium",
  showSafeGuides = false,
  ...props
}) => {
  return (
    <BrandProvider energy={energy}>
      <CTAEndCardInner energy={energy} showSafeGuides={showSafeGuides} {...props} />
    </BrandProvider>
  );
};
