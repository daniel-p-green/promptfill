import { z } from "zod";

const wordCount = (text: string): number =>
  text
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

const wordsBetween =
  (min: number, max: number) =>
  (value: string): boolean => {
    const words = wordCount(value);
    return words >= min && words <= max;
  };

const noStackedClaims = (value: string): boolean => {
  const normalized = value.toLowerCase();
  const risky = ["best", "fastest", "cheapest"];
  const hitCount = risky.filter((r) => normalized.includes(r)).length;
  return hitCount <= 1;
};

const hookSceneSchema = z.object({
  id: z.literal("hook"),
  hook: z
    .string()
    .trim()
    .min(1)
    .refine(wordsBetween(1, 8), "Hook must be 1-8 words"),
});

const problemSceneSchema = z.object({
  id: z.literal("problem"),
  bullets: z
    .array(
      z
        .string()
        .trim()
        .min(1)
        .refine(wordsBetween(2, 4), "Problem bullets must be 2-4 words"),
    )
    .min(1)
    .max(3),
});

const solutionSceneSchema = z.object({
  id: z.literal("solution"),
  claim: z
    .string()
    .trim()
    .min(1)
    .refine(wordsBetween(3, 12), "Claim must be 3-12 words")
    .refine(noStackedClaims, "Claim cannot stack best/fastest/cheapest language"),
  proof: z
    .string()
    .trim()
    .min(1)
    .refine(wordsBetween(4, 18), "Proof must be 4-18 words")
    .refine(noStackedClaims, "Proof cannot stack best/fastest/cheapest language"),
});

const ctaSceneSchema = z.object({
  id: z.literal("cta"),
  cta: z
    .string()
    .trim()
    .min(1)
    .refine(wordsBetween(2, 4), "CTA must be 2-4 words"),
  url: z.string().trim().url(),
  caption: z
    .string()
    .trim()
    .optional()
    .refine((value) => !value || wordsBetween(1, 14)(value), "Caption must be <= 14 words"),
});

export const brandScriptSchema = z.object({
  brandVoice: z.string().trim().min(1),
  audience: z.string().trim().min(1),
  offer: z.string().trim().min(1),
  scenes: z.tuple([hookSceneSchema, problemSceneSchema, solutionSceneSchema, ctaSceneSchema]),
});

export type BrandScript = z.infer<typeof brandScriptSchema>;
export type HookSceneSpec = z.infer<typeof hookSceneSchema>;
export type ProblemSceneSpec = z.infer<typeof problemSceneSchema>;
export type SolutionSceneSpec = z.infer<typeof solutionSceneSchema>;
export type CtaSceneSpec = z.infer<typeof ctaSceneSchema>;

export const parseBrandScript = (input: unknown): BrandScript => {
  return brandScriptSchema.parse(input);
};
