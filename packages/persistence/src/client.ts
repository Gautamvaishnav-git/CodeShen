import { createClient, type SanityClient } from '@sanity/client';

import { parseEnv, type AppEnv } from '@codeshen/config';

import type { SanityPersistenceClient } from './types';

export function createSanityServerClient(
  input: Record<string, string | undefined> = process.env,
): SanityClient & SanityPersistenceClient {
  const env: AppEnv = parseEnv(input);
  const token = env.SANITY_WRITE_TOKEN ?? env.SANITY_API_TOKEN;

  if (!token) {
    throw new Error(
      'SANITY_WRITE_TOKEN or SANITY_API_TOKEN is required for Sanity writes.',
    );
  }

  return createClient({
    projectId: env.SANITY_PROJECT_ID,
    dataset: env.SANITY_DATASET,
    apiVersion: env.SANITY_API_VERSION,
    token,
    useCdn: false,
  });
}

export async function queryRepositoryDocuments<T>(
  client: SanityPersistenceClient,
  repositoryId: string,
): Promise<T[]> {
  return client.fetch<T[]>(
    '*[_id == $repositoryId || references($repositoryId)] | order(_id asc)',
    { repositoryId },
  );
}
