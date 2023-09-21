export const isValidOpenAIKey = (candidate: string) => {
  return candidate.startsWith("sk-"); // SUPER robust validation™
}