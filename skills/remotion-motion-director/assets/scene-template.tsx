import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BRAND_TOKENS, getMotionProfile, type PacingProfile } from "./motion-tokens-template";

type SceneProps = {
  title: string;
  subtitle?: string;
  profile?: PacingProfile;
  delayFrames?: number;
};

export const PremiumScene: React.FC<SceneProps> = ({
  title,
  subtitle,
  profile = "measured",
  delayFrames = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const motion = getMotionProfile(profile);
  const localFrame = Math.max(frame - delayFrames, 0);

  const progress = spring({
    frame: localFrame,
    fps,
    config: motion.spring,
  });

  const opacity = interpolate(localFrame, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const translateY = interpolate(progress, [0, 1], [motion.entryDistancePx, 0]);

  return (
    <div
      style={{
        flex: 1,
        backgroundColor: BRAND_TOKENS.color.bgPrimary,
        color: BRAND_TOKENS.color.textPrimary,
        padding: BRAND_TOKENS.layout.safeMargin,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <h1
        style={{
          margin: 0,
          fontFamily: BRAND_TOKENS.typography.headingFamily,
          fontSize: BRAND_TOKENS.typography.scale.h1,
          lineHeight: BRAND_TOKENS.typography.lineHeight.heading,
          transform: `translateY(${translateY}px)`,
          opacity,
        }}
      >
        {title}
      </h1>
      {subtitle ? (
        <p
          style={{
            marginTop: BRAND_TOKENS.layout.spacing[3],
            fontFamily: BRAND_TOKENS.typography.bodyFamily,
            fontSize: BRAND_TOKENS.typography.scale.body,
            color: BRAND_TOKENS.color.textSecondary,
            maxWidth: 980,
            opacity,
          }}
        >
          {subtitle}
        </p>
      ) : null}
    </div>
  );
};
