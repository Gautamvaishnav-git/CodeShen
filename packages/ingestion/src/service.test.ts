import { describe, expect, it } from 'vitest';

import { RepositoryIngestionService } from './service';
import type { GitHubRepositoryClient } from './types';

const client: GitHubRepositoryClient = {
  getRepository: async () => ({
    githubId: 1,
    owner: 'octocat',
    name: 'Hello-World',
    fullName: 'octocat/Hello-World',
    githubUrl: 'https://github.com/octocat/Hello-World',
    defaultBranch: 'main',
    description: 'Example repository',
  }),
  getCommitSha: async () => 'commit-sha',
  getTree: async () => [
    { path: 'src/index.ts', type: 'blob', sha: 'file-sha', size: 12 },
    { path: '.env', type: 'blob', sha: 'secret-sha', size: 8 },
  ],
  getFile: async () => ({ sha: 'file-sha', size: 12, content: 'export {};\n' }),
};

describe('RepositoryIngestionService', () => {
  it('pins ingested files to the resolved commit', async () => {
    const progress: number[] = [];
    const result = await new RepositoryIngestionService(client).ingest(
      'https://github.com/octocat/Hello-World',
      (update) => {
        progress.push(update.progress);
      },
    );

    expect(result.commitSha).toBe('commit-sha');
    expect(result.files[0]?.sourceUrl).toContain(
      '/blob/commit-sha/src/index.ts',
    );
    expect(progress.at(-1)).toBe(100);
  });
});
