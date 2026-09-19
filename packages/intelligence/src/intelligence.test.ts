import { describe, expect, it } from 'vitest';

import {
  analyzeRepositoryFiles,
  detectDependencies,
  detectLanguage,
  extractFileIntelligence,
  extractRelationships,
} from './index';

describe('code intelligence', () => {
  it('detects supported languages', () => {
    expect(detectLanguage('src/index.ts')).toBe('typescript');
    expect(detectLanguage('main.py')).toBe('python');
    expect(detectLanguage('unknown.txt')).toBeUndefined();
  });

  it('extracts symbols, imports, exports, and evidence with Tree-sitter', () => {
    const file = extractFileIntelligence(
      'src/index.ts',
      "import { helper } from './helper';\n\nexport function run(): string {\n  return helper();\n}\n",
      'commit-sha',
      'https://github.com/octocat/repo/blob/commit-sha/src/index.ts',
    );

    expect(file?.symbols.map((symbol) => symbol.name)).toContain('run');
    expect(file?.imports[0]?.source).toBe('./helper');
    expect(file?.exports.map((entry) => entry.name)).toContain('run');
    expect(file?.symbols[0]?.evidence.commitSha).toBe('commit-sha');
  });

  it('extracts import relationships and common dependencies', () => {
    const file = extractFileIntelligence(
      'src/index.ts',
      "import React from 'react';",
      'sha',
      'url',
    );
    expect(extractRelationships([file!])[0]?.type).toBe('imports');

    expect(
      detectDependencies([
        {
          path: 'package.json',
          content:
            '{"dependencies":{"next":"latest"},"devDependencies":{"vitest":"latest"}}',
        },
      ]),
    ).toEqual([
      { name: 'next', source: 'package.json', kind: 'framework' },
      { name: 'vitest', source: 'package.json', kind: 'devDependency' },
    ]);
  });

  it('analyzes repository files as a commit-pinned intelligence result', () => {
    const result = analyzeRepositoryFiles(
      [
        {
          path: 'src/index.ts',
          content: "import { helper } from './helper';",
          sha: 'file-sha',
          sourceUrl: 'https://github.com/octocat/repo/blob/sha/src/index.ts',
        },
      ],
      'sha',
    );

    expect(result.files).toHaveLength(1);
    expect(result.relationships[0]?.target).toBe('./helper');
    expect(result.files[0]?.imports[0]?.evidence.commitSha).toBe('sha');
  });
});
