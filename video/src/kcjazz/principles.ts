export type KCJazzDemoId =
  | "squash"
  | "anticipation"
  | "staging"
  | "pose"
  | "follow"
  | "slow"
  | "arcs"
  | "secondary"
  | "timing"
  | "exaggeration"
  | "solid"
  | "appeal";

export type KCJazzPrinciple = {
  number: number;
  name: string;
  subtitle: string;
  explanation: string[];
  watch: string;
  jazz: string;
  demo: KCJazzDemoId;
};

export const KCJAZZ_PRINCIPLES: KCJazzPrinciple[] = [
  {
    number: 1,
    name: "Squash & Stretch",
    subtitle: "Weight, flexibility, and life.",
    explanation: [
      "Push shape at extremes to show impact and momentum.",
      "Keep the volume consistent, even as the silhouette changes.",
    ],
    watch: "Watch for: stretch on speed, squash on impact.",
    jazz: "Jazz parallel: a bent note stays the same note—just more alive.",
    demo: "squash",
  },
  {
    number: 2,
    name: "Anticipation",
    subtitle: "Prepare the audience for the action.",
    explanation: [
      "Before a big move, show a smaller, readable setup.",
      "Anticipation makes motion feel intentional instead of accidental.",
    ],
    watch: "Watch for: a clear wind‑up before the hit.",
    jazz: "Jazz parallel: the pickup note tells your ear what’s coming.",
    demo: "anticipation",
  },
  {
    number: 3,
    name: "Staging",
    subtitle: "Clarity of idea through composition.",
    explanation: [
      "Arrange poses, lighting, and timing so the point reads instantly.",
      "One strong idea beats three competing ones.",
    ],
    watch: "Watch for: a single focal point and clean silhouette.",
    jazz: "Jazz parallel: let the solo sit in the spotlight—support stays supportive.",
    demo: "staging",
  },
  {
    number: 4,
    name: "Straight Ahead / Pose to Pose",
    subtitle: "Two ways to build motion.",
    explanation: [
      "Straight ahead: draw through the action for spontaneity.",
      "Pose to pose: plan key moments, then refine the in‑betweens.",
    ],
    watch: "Watch for: flowing sketch vs. planned beats.",
    jazz: "Jazz parallel: improv vs. chart—both can swing when the intent is clear.",
    demo: "pose",
  },
  {
    number: 5,
    name: "Follow Through & Overlap",
    subtitle: "Parts don’t stop at once.",
    explanation: [
      "When the main body stops, loose parts keep moving and settle later.",
      "Offset timing between parts to avoid stiffness.",
    ],
    watch: "Watch for: delayed tail and staggered settling.",
    jazz: "Jazz parallel: the last vibration after the cymbal hit sells the moment.",
    demo: "follow",
  },
  {
    number: 6,
    name: "Slow In & Slow Out",
    subtitle: "Easing makes motion feel physical.",
    explanation: [
      "Most movement accelerates and decelerates—rarely perfectly linear.",
      "Spacing between positions tells the speed story.",
    ],
    watch: "Watch for: tighter spacing at starts/ends, wider in the middle.",
    jazz: "Jazz parallel: swing lives in the spaces between the beats.",
    demo: "slow",
  },
  {
    number: 7,
    name: "Arcs",
    subtitle: "Natural motion travels in curves.",
    explanation: [
      "Limbs and thrown objects typically follow arcing paths.",
      "Arcs keep motion organic and readable.",
    ],
    watch: "Watch for: a visible trajectory—not a zig‑zag.",
    jazz: "Jazz parallel: melodic lines arc—they don’t teleport from note to note.",
    demo: "arcs",
  },
  {
    number: 8,
    name: "Secondary Action",
    subtitle: "Support the main action with a smaller one.",
    explanation: [
      "Add a complementary motion to enrich the primary idea.",
      "Secondary action should never steal focus from the main action.",
    ],
    watch: "Watch for: the accent that supports, not distracts.",
    jazz: "Jazz parallel: the comping pattern lifts the solo without competing.",
    demo: "secondary",
  },
  {
    number: 9,
    name: "Timing",
    subtitle: "Speed communicates weight and mood.",
    explanation: [
      "Fewer frames feels snappy and light; more frames feels heavy and deliberate.",
      "Timing is the easiest lever for emotion.",
    ],
    watch: "Watch for: the same action feeling different at different speeds.",
    jazz: "Jazz parallel: lay back or push ahead—timing changes everything.",
    demo: "timing",
  },
  {
    number: 10,
    name: "Exaggeration",
    subtitle: "Push what matters; keep it believable.",
    explanation: [
      "Amplify the idea to make it readable and fun.",
      "Exaggeration works best when grounded in a clear base.",
    ],
    watch: "Watch for: a strong contrast between normal and pushed.",
    jazz: "Jazz parallel: a bold bend lands because the groove stays true.",
    demo: "exaggeration",
  },
  {
    number: 11,
    name: "Solid Drawing",
    subtitle: "Form, perspective, and balance.",
    explanation: [
      "Think in 3D: weight, volume, and believable construction.",
      "A solid foundation makes stylization feel intentional.",
    ],
    watch: "Watch for: consistent perspective and stable mass.",
    jazz: "Jazz parallel: good tone comes from solid technique—then you break rules on purpose.",
    demo: "solid",
  },
  {
    number: 12,
    name: "Appeal",
    subtitle: "Design that invites attention.",
    explanation: [
      "Appeal is clarity, rhythm, and pleasing shapes—not just “cute.”",
      "Strong silhouettes and proportions make a character readable.",
    ],
    watch: "Watch for: simple shapes with personality.",
    jazz: "Jazz parallel: one great phrase can say more than a hundred notes.",
    demo: "appeal",
  },
];

