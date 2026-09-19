import {
  IGNORED_DIRECTORY_NAMES,
  IGNORED_FILE_PATTERNS,
  SUPPORTED_EXTENSIONS,
} from './constants';
import type { GitHubTreeEntry } from './types';

export function isSupportedRepositoryPath(path: string): boolean {
  const segments = path.split('/');
  const filename = segments.at(-1) ?? '';
  const extension = filename.slice(filename.lastIndexOf('.')).toLowerCase();

  return (
    !segments.some((segment) => IGNORED_DIRECTORY_NAMES.has(segment)) &&
    !IGNORED_FILE_PATTERNS.some((pattern) => pattern.test(filename)) &&
    SUPPORTED_EXTENSIONS.includes(
      extension as (typeof SUPPORTED_EXTENSIONS)[number],
    )
  );
}

export function selectRepositoryFiles(
  entries: GitHubTreeEntry[],
  maxFiles: number,
): GitHubTreeEntry[] {
  return entries
    .filter(
      (entry) =>
        entry.type === 'blob' &&
        entry.path &&
        isSupportedRepositoryPath(entry.path),
    )
    .sort((left, right) => left.path!.localeCompare(right.path!))
    .slice(0, maxFiles);
}
