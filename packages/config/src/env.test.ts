import { describe, expect, it } from 'vitest';

import { parseEnv } from './env';

describe('parseEnv', () => {
  it('accepts the required Sanity configuration', () => {
    const env = parseEnv({
      SANITY_PROJECT_ID: 'project',
      SANITY_DATASET: 'production',
      SANITY_API_VERSION: '2026-01-01',
    });

    expect(env.SANITY_DATASET).toBe('production');
  });

  it('rejects missing required configuration', () => {
    expect(() => parseEnv({})).toThrow();
  });
});
