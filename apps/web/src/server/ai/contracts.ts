export type AiProviderKey = "openai" | "anthropic";

export type AiMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type AiCompletionInput = {
  model: string;
  messages: AiMessage[];
  temperature?: number;
};

export type AiCompletionResult = {
  content: string;
  model: string;
  inputTokens?: number;
  outputTokens?: number;
};

export interface AiProviderAdapter {
  readonly key: AiProviderKey;
  isConfigured(): boolean;
  complete(input: AiCompletionInput): Promise<AiCompletionResult>;
}
