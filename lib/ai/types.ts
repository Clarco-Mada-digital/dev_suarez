export type ChatCompletionMessageParam = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type AIAdviceResponse = {
  advice: string;
  plan?: string[];
  questions?: string[];
  tags?: string[];
};
