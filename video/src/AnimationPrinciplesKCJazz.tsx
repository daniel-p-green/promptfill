import React from "react";
import { AbsoluteFill, Series } from "remotion";
import { KCJazzIntro } from "./kcjazz/KCJazzIntro";
import { KCJazzOutro } from "./kcjazz/KCJazzOutro";
import { KCJazzPrincipleScene } from "./kcjazz/KCJazzPrincipleScene";
import { KCJAZZ_PRINCIPLES } from "./kcjazz/principles";
import { getKCJazzTheme, KCJazzStyle } from "./kcjazz/theme";

export type AnimationPrinciplesKCJazzProps = {
  style: KCJazzStyle;
};

const fps = 30;

const introSeconds = 12;
const outroSeconds = 12;
const secondsPerPrinciple = 12;
const introFrames = introSeconds * fps;
const outroFrames = outroSeconds * fps;
const principleFrames = secondsPerPrinciple * fps;

export const ANIMATION_PRINCIPLES_KC_JAZZ_DURATION_IN_FRAMES =
  introFrames + outroFrames + principleFrames * KCJAZZ_PRINCIPLES.length;

export const AnimationPrinciplesKCJazz: React.FC<AnimationPrinciplesKCJazzProps> = ({
  style,
}) => {
  const theme = getKCJazzTheme(style);

  return (
    <AbsoluteFill>
      <Series>
        <Series.Sequence durationInFrames={introFrames}>
          <KCJazzIntro theme={theme} durationInFrames={introFrames} />
        </Series.Sequence>
        {KCJAZZ_PRINCIPLES.map((principle) => (
          <Series.Sequence key={principle.number} durationInFrames={principleFrames}>
            <KCJazzPrincipleScene
              theme={theme}
              principle={principle}
              durationInFrames={principleFrames}
              totalPrinciples={KCJAZZ_PRINCIPLES.length}
            />
          </Series.Sequence>
        ))}
        <Series.Sequence durationInFrames={outroFrames}>
          <KCJazzOutro theme={theme} durationInFrames={outroFrames} />
        </Series.Sequence>
      </Series>
    </AbsoluteFill>
  );
};
