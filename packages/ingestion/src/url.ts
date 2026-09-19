import type { RepositoryReference } from './types';

const GITHUB_HOST = 'github.com';
const VALID_SEGMENT = /^[A-Za-z0-9_.-]+$/;

export function parsePublicRepositoryUrl(input: string): RepositoryReference {
  let parsed: URL;

  try {
    parsed = new URL(input);
  } catch {
    throw new Error('Repository URL must be a valid GitHub URL.');
  }

  const segments = parsed.pathname.split('/').filter(Boolean);
  const [owner, name] = segments;

  if (
    parsed.protocol !== 'https:' ||
    parsed.hostname !== GITHUB_HOST ||
    segments.length !== 2 ||
    !owner ||
    !name ||
    !VALID_SEGMENT.test(owner) ||
    !VALID_SEGMENT.test(name)
  ) {
    throw new Error(
      'Repository URL must point to a public github.com repository.',
    );
  }

  return {
    owner,
    name: name.replace(/\.git$/, ''),
    url: `https://${GITHUB_HOST}/${owner}/${name.replace(/\.git$/, '')}`,
  };
}
