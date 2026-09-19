import { describe, expect, it } from 'vitest';

import { isSupportedRepositoryPath, selectRepositoryFiles } from './filter';

describe('repository file filtering', () => {
  it('includes supported source and documentation files', () => {
    expect(isSupportedRepositoryPath('src/index.ts')).toBe(true);
    expect(isSupportedRepositoryPath('docs/README.md')).toBe(true);
  });

  it('excludes generated, dependency, and secret files', () => {
    expect(isSupportedRepositoryPath('node_modules/pkg/index.js')).toBe(false);
    expect(isSupportedRepositoryPath('.env')).toBe(false);
    expect(isSupportedRepositoryPath('certs/server.pem')).toBe(false);
  });

  it('selects only blobs and enforces the file limit', () => {
    const entries = [
      { path: 'b.ts', type: 'blob', sha: 'b' },
      { path: 'a.ts', type: 'blob', sha: 'a' },
      { path: 'src', type: 'tree', sha: 'src' },
    ];

    expect(
      selectRepositoryFiles(entries, 1).map((entry) => entry.path),
    ).toEqual(['a.ts']);
  });
});
