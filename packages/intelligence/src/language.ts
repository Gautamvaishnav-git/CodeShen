import type { SupportedLanguage } from './types';

const LANGUAGE_BY_EXTENSION: Record<string, SupportedLanguage> = {
  '.ts': 'typescript',
  '.tsx': 'typescript',
  '.js': 'javascript',
  '.jsx': 'javascript',
  '.py': 'python',
  '.go': 'go',
};

export function detectLanguage(path: string): SupportedLanguage | undefined {
  const extension = path.slice(path.lastIndexOf('.')).toLowerCase();
  return LANGUAGE_BY_EXTENSION[extension];
}
