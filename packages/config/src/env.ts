import { z } from 'zod';

const envSchema = z.object({
  GITHUB_TOKEN: z.string().optional(),
  SANITY_PROJECT_ID: z.string().min(1),
  SANITY_DATASET: z.string().min(1),
  SANITY_API_VERSION: z.string().min(1),
  SANITY_API_TOKEN: z.string().optional(),
  SANITY_WRITE_TOKEN: z.string().optional(),
  SANITY_ORGANIZATION_ID: z.string().optional(),
  SANITY_ORGANIZATION_TOKEN: z.string().optional(),
  SANITY_CONTEXT_DATASET_URL: z.string().url().optional(),
  SANITY_CONTEXT_KB_URL: z.string().url().optional(),
  SANITY_KNOWLEDGE_BASE_ID: z.string().min(1).optional(),
  GOOGLE_GENERATIVE_AI_API_KEY: z.string().optional(),
  GOOGLE_GENERATIVE_AI_MODEL: z.string().min(1).optional(),
});

export function parseEnv(input: Record<string, string | undefined>) {
  return envSchema.parse(input);
}

export type AppEnv = z.infer<typeof envSchema>;
