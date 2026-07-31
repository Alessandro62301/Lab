import "server-only";
import type {
  AiCompletionInput,
  AiCompletionResult,
  AiProviderAdapter,
  AiProviderKey,
} from "./contracts";

class DisabledProvider implements AiProviderAdapter {
  constructor(
    public readonly key: AiProviderKey,
    private readonly environmentKey: string,
  ) {}

  isConfigured() {
    return Boolean(process.env[this.environmentKey]);
  }

  async complete(_input: AiCompletionInput): Promise<AiCompletionResult> {
    void _input;
    throw new Error(
      `O provedor ${this.key} está preparado, mas chamadas reais permanecem desativadas nesta etapa.`,
    );
  }
}

export const aiProviders: Record<AiProviderKey, AiProviderAdapter> = {
  openai: new DisabledProvider("openai", "OPENAI_API_KEY"),
  anthropic: new DisabledProvider("anthropic", "ANTHROPIC_API_KEY"),
};
