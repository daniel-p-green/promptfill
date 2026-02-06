import React from "react";
import { AbsoluteFill, Img, Sequence, staticFile } from "remotion";
import { BrandProvider, useBrand } from "../remotion/BrandProvider";
import { CTAButton } from "../remotion/components/CTAButton";
import { Card } from "../remotion/components/Card";
import { LowerThird } from "../remotion/components/LowerThird";
import { SafeZoneFrame } from "../remotion/components/layout/SafeZoneFrame";
import { BodyText } from "../remotion/components/typography/BodyText";
import { CaptionText } from "../remotion/components/typography/CaptionText";
import { ClaimText } from "../remotion/components/typography/ClaimText";
import { HookText } from "../remotion/components/typography/HookText";
import { type MotionEnergy } from "../remotion/motion/presets";
import type { SceneFormat } from "../remotion/types";
import { parseBrandScript, type BrandScript } from "../copy/schema";

type LengthBucket = "15s" | "30s";

export type ScriptDrivenReelProps = {
  script: BrandScript;
  format: SceneFormat;
  energy?: MotionEnergy;
  lengthBucket?: LengthBucket;
  showSafeGuides?: boolean;
};

const sceneDurations = (length: LengthBucket) => {
  if (length === "30s") {
    return {
      hook: 210,
      problem: 210,
      solution: 240,
      cta: 240,
    };
  }
  return {
    hook: 100,
    problem: 110,
    solution: 120,
    cta: 120,
  };
};

const HookBeat: React.FC<{ script: BrandScript; format: SceneFormat; showSafeGuides: boolean }> = ({
  script,
  format,
  showSafeGuides,
}) => {
  const { tokens } = useBrand();
  return (
    <SafeZoneFrame format={format} showGuides={showSafeGuides}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Img src={staticFile("brand/stripe/logo.svg")} style={{ width: 128, height: 36 }} />
      </div>
      <HookText text={script.scenes[0].hook} />
      <BodyText text={`${script.offer}. Built for ${script.audience}.`} />
      <div
        style={{
          marginTop: tokens.spacing.sm,
          width: 12,
          height: 12,
          borderRadius: 999,
          background: tokens.colors.accentAlt,
          boxShadow: `0 0 20px ${tokens.colors.accentAlt}88`,
        }}
      />
    </SafeZoneFrame>
  );
};

const ProblemBeat: React.FC<{ script: BrandScript; format: SceneFormat; showSafeGuides: boolean }> = ({
  script,
  format,
  showSafeGuides,
}) => {
  return (
    <SafeZoneFrame format={format} showGuides={showSafeGuides}>
      <ClaimText text="The current workflow is leaking focus" />
      <BodyText text="One scene, one job: name the friction clearly." />
      <div style={{ display: "flex", gap: 20 }}>
        {script.scenes[1].bullets.map((bullet) => (
          <Card key={bullet} title="Problem" body={bullet} />
        ))}
      </div>
    </SafeZoneFrame>
  );
};

const SolutionBeat: React.FC<{ script: BrandScript; format: SceneFormat; showSafeGuides: boolean }> = ({
  script,
  format,
  showSafeGuides,
}) => {
  const solution = script.scenes[2];
  return (
    <SafeZoneFrame format={format} showGuides={showSafeGuides}>
      <ClaimText text={solution.claim} />
      <BodyText text={solution.proof} />
      <Card title="Proof" body={solution.proof} accent />
    </SafeZoneFrame>
  );
};

const CtaBeat: React.FC<{ script: BrandScript; format: SceneFormat; showSafeGuides: boolean }> = ({
  script,
  format,
  showSafeGuides,
}) => {
  const ctaScene = script.scenes[3];
  return (
    <SafeZoneFrame format={format} showGuides={showSafeGuides}>
      <ClaimText text="Ready to ship this workflow?" />
      <CTAButton label={ctaScene.cta} />
      {ctaScene.caption ? <CaptionText text={ctaScene.caption} /> : null}
      <LowerThird heading={ctaScene.url} subheading={script.brandVoice} />
    </SafeZoneFrame>
  );
};

const ScriptDrivenReelInner: React.FC<Required<ScriptDrivenReelProps>> = ({
  script,
  format,
  lengthBucket,
  showSafeGuides,
}) => {
  const normalized = parseBrandScript(script);
  const durations = sceneDurations(lengthBucket);

  const hookFrom = 0;
  const problemFrom = hookFrom + durations.hook;
  const solutionFrom = problemFrom + durations.problem;
  const ctaFrom = solutionFrom + durations.solution;

  return (
    <AbsoluteFill>
      <Sequence from={hookFrom} durationInFrames={durations.hook}>
        <HookBeat script={normalized} format={format} showSafeGuides={showSafeGuides} />
      </Sequence>
      <Sequence from={problemFrom} durationInFrames={durations.problem}>
        <ProblemBeat script={normalized} format={format} showSafeGuides={showSafeGuides} />
      </Sequence>
      <Sequence from={solutionFrom} durationInFrames={durations.solution}>
        <SolutionBeat script={normalized} format={format} showSafeGuides={showSafeGuides} />
      </Sequence>
      <Sequence from={ctaFrom} durationInFrames={durations.cta}>
        <CtaBeat script={normalized} format={format} showSafeGuides={showSafeGuides} />
      </Sequence>
    </AbsoluteFill>
  );
};

export const ScriptDrivenReel: React.FC<ScriptDrivenReelProps> = ({
  energy = "medium",
  lengthBucket = "15s",
  showSafeGuides = false,
  ...props
}) => {
  return (
    <BrandProvider energy={energy}>
      <ScriptDrivenReelInner
        {...props}
        energy={energy}
        lengthBucket={lengthBucket}
        showSafeGuides={showSafeGuides}
      />
    </BrandProvider>
  );
};

export const scriptDurationInFrames = (lengthBucket: LengthBucket): number => {
  const durations = sceneDurations(lengthBucket);
  return durations.hook + durations.problem + durations.solution + durations.cta;
};
