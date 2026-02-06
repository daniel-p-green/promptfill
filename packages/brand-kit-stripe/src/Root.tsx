import React from "react";
import { Composition, Folder } from "remotion";
import { stripeExampleScript } from "./copy/exampleScript";
import { CTAEndCard, type CTAEndCardProps } from "./templates/CTAEndCard";
import { FeatureList, type FeatureListProps } from "./templates/FeatureList";
import { HookScene, type HookSceneProps } from "./templates/HookScene";
import { ProblemSolution, type ProblemSolutionProps } from "./templates/ProblemSolution";
import {
  ScriptDrivenReel,
  scriptDurationInFrames,
  type ScriptDrivenReelProps,
} from "./starter/ScriptDrivenReel";

export const StripeBrandKitRoot: React.FC = () => {
  return (
    <Folder name="BrandKit">
      <Folder name="Stripe">
        <Composition
          id="StripeDemoReel9x16"
          component={ScriptDrivenReel}
          durationInFrames={scriptDurationInFrames("15s")}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={
            {
              script: stripeExampleScript,
              format: "reels-9x16",
              energy: "medium",
              lengthBucket: "15s",
              showSafeGuides: false,
            } satisfies ScriptDrivenReelProps
          }
        />

        <Composition
          id="StripeDemoReel16x9"
          component={ScriptDrivenReel}
          durationInFrames={scriptDurationInFrames("30s")}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={
            {
              script: stripeExampleScript,
              format: "youtube-16x9",
              energy: "subtle",
              lengthBucket: "30s",
              showSafeGuides: false,
            } satisfies ScriptDrivenReelProps
          }
        />

        <Composition
          id="StripeHookScene"
          component={HookScene}
          durationInFrames={180}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={
            {
              headline: "Move revenue faster with one brand system.",
              subheadline: "Generate scenes that stay consistent in motion, typography, and CTA clarity.",
              cta: "Start building",
              energy: "medium",
              showSafeGuides: false,
            } satisfies HookSceneProps
          }
        />

        <Composition
          id="StripeProblemSolution"
          component={ProblemSolution}
          durationInFrames={240}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={
            {
              problem: "Teams reuse prompts, but outputs drift in tone and structure.",
              solution: "Use one tokenized kit to enforce format, motion, and clear CTA rhythm.",
              energy: "medium",
              showSafeGuides: false,
            } satisfies ProblemSolutionProps
          }
        />

        <Composition
          id="StripeFeatureList"
          component={FeatureList}
          durationInFrames={240}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={
            {
              features: [
                "Tokenized color/type/spacing for every scene",
                "Reusable motion presets mapped to energy",
                "Template compositions for hook, proof, and CTA",
              ],
              energy: "medium",
              showSafeGuides: false,
            } satisfies FeatureListProps
          }
        />

        <Composition
          id="StripeCTAEndCard"
          component={CTAEndCard}
          durationInFrames={150}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={
            {
              headline: "Ship on-brand motion with less guesswork.",
              cta: "Get started",
              lowerThirdHeading: "Brand kit v1",
              lowerThirdSubheading: "Consistent tokens, templates, and pacing defaults.",
              energy: "medium",
              showSafeGuides: false,
            } satisfies CTAEndCardProps
          }
        />
      </Folder>
    </Folder>
  );
};
