export const wordCount = (text: string): number =>
  text
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

export const clipWords = (text: string, maxWords: number): string => {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) {
    return text.trim();
  }
  return `${words.slice(0, maxWords).join(" ")}...`;
};
