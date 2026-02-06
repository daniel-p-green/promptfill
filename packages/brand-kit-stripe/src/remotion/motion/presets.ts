import { interpolate, spring, type SpringConfig } from "remotion";

export type MotionEnergy = "subtle" | "medium" | "punchy";

type MotionPreset = {
  durationFrames: number;
  spring: SpringConfig;
  yOffset: number;
};

const PRESETS: Record<MotionEnergy, MotionPreset> = {
  subtle: {
    durationFrames: 18,
    spring: { damping: 28, stiffness: 110, mass: 0.9, overshootClamping: false },
    yOffset: 18,
  },
  medium: {
    durationFrames: 24,
    spring: { damping: 20, stiffness: 170, mass: 0.75, overshootClamping: false },
    yOffset: 30,
  },
  punchy: {
    durationFrames: 28,
    spring: { damping: 14, stiffness: 260, mass: 0.62, overshootClamping: false },
    yOffset: 42,
  },
};

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const resolveMotionPreset = (energy: MotionEnergy): MotionPreset => PRESETS[energy];

export const enterOpacity = (frame: number, startFrame: number, durationFrames: number): number => {
  return interpolate(frame, [startFrame, startFrame + durationFrames], [0, 1], clamp);
};

export const enterY = (
  frame: number,
  fps: number,
  startFrame: number,
  energy: MotionEnergy,
): number => {
  const preset = resolveMotionPreset(energy);
  const value = spring({
    frame: frame - startFrame,
    fps,
    config: preset.spring,
  });
  return interpolate(value, [0, 1], [preset.yOffset, 0], clamp);
};

export const staggerStart = (baseFrame: number, index: number, step = 6): number => {
  return baseFrame + index * step;
};
