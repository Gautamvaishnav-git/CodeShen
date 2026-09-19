import { describe, expect, it } from 'vitest';

import { parsePublicRepositoryUrl } from './url';

describe('parsePublicRepositoryUrl', () => {
  it('normalizes a public GitHub URL', () => {
    expect(
      parsePublicRepositoryUrl('https://github.com/octocat/Hello-World.git'),
    ).toEqual({
      owner: 'octocat',
      name: 'Hello-World',
      url: 'https://github.com/octocat/Hello-World',
    });
  });

  it.each([
    'http://github.com/octocat/Hello-World',
    'https://gitlab.com/octocat/Hello-World',
    'https://github.com/octocat',
  ])('rejects %s', (url) => {
    expect(() => parsePublicRepositoryUrl(url)).toThrow();
  });
});
