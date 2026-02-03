export type HighlightRect = {
  x: number;
  y: number;
  w: number;
  h: number;
};

/**
 * Highlight boxes for the explainer video.
 *
 * IMPORTANT:
 * These are measured against the screenshots in `video/public/ui/*-1280x720.png`
 * (captured at a 1280x720 viewport). If the UI changes, re-capture and update.
 */
export const HIGHLIGHTS_1280x720 = {
  ui: {
    // Library pane (search + prompt list) in expanded mode.
    library: { x: 8, y: 71, w: 303, h: 489 } satisfies HighlightRect,
    // "Variables / Copy / Copy Markdown" action group.
    copyActions: { x: 938, y: 287, w: 313, h: 58 } satisfies HighlightRect,
  },
  drawer: {
    // Variable field cards in the fill drawer.
    fields: { x: 851, y: 99, w: 419, h: 444 } satisfies HighlightRect,
  },
  share: {
    // Share link input row in the share modal.
    linkRow: { x: 378, y: 183, w: 524, h: 59 } satisfies HighlightRect,
  },
} as const;
