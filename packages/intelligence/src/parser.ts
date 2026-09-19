import Parser from 'tree-sitter';
import Go from 'tree-sitter-go';
import Python from 'tree-sitter-python';
import TypeScript from 'tree-sitter-typescript';

import { detectLanguage } from './language';
import type { SupportedLanguage } from './types';

export type ParsedSource = {
  language: SupportedLanguage;
  tree: Parser.Tree;
};

const grammars: Record<SupportedLanguage, Parser.Language> = {
  typescript: TypeScript.typescript,
  javascript: TypeScript.tsx,
  python: Python,
  go: Go,
};

export function parseSource(
  path: string,
  content: string,
): ParsedSource | undefined {
  const language = detectLanguage(path);
  if (!language) return undefined;

  const parser = new Parser();
  parser.setLanguage(grammars[language]);
  return { language, tree: parser.parse(content) };
}
