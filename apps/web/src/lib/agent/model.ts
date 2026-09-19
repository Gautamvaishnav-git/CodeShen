import { createGoogle } from '@ai-sdk/google';
import type { LanguageModel } from 'ai';

import { parseEnv } from '@codeshen/config';

const DEFAULT_MODEL = 'gemini-2.5-flash';

export function createAgentModel(
  input: Record<string, string | undefined> = process.env,
): LanguageModel {
  const env = parseEnv(input);
  if (!env.GOOGLE_GENERATIVE_AI_API_KEY) {
    throw new Error('GOOGLE_GENERATIVE_AI_API_KEY is required for chat.');
  }

  const google = createGoogle({ apiKey: env.GOOGLE_GENERATIVE_AI_API_KEY });
  return google(env.GOOGLE_GENERATIVE_AI_MODEL ?? DEFAULT_MODEL);
}
