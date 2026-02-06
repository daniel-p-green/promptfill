import {Easing, interpolate, spring} from 'remotion';

export const timing = {
  micro: 8,
  quick: 14,
  normal: 24,
  emphasis: 36,
  slow: 48,
};

export const easing = {
  standard: Easing.bezier(0.2, 0.0, 0.0, 1.0),
  exit: Easing.bezier(0.4, 0.0, 1.0, 1.0),
  overshoot: Easing.bezier(0.2, 0.9, 0.2, 1.0),
};

export const springs = {
  gentle: {damping: 30, stiffness: 120, mass: 0.8},
  snappy: {damping: 18, stiffness: 220, mass: 0.6},
};

export const transitions = {
  sceneInFrames: 18,
  sceneOutFrames: 14,
};

export const enter = (frame: number, start: number, duration: number) => {
  return interpolate(frame, [start, start + duration], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: easing.standard,
  });
};

export const exit = (frame: number, start: number, duration: number) => {
  return interpolate(frame, [start, start + duration], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: easing.exit,
  });
};

export const emphasize = (frame: number, fps: number, start = 0) => {
  return spring({
    frame: frame - start,
    fps,
    config: springs.snappy,
  });
};
