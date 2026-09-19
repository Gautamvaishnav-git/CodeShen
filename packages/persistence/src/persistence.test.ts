import { describe, expect, it } from 'vitest';

import { analyzeRepositoryFiles } from '@codeshen/intelligence';

import { buildPersistenceDocuments } from './documents';
import {
  codeFileDocumentId,
  knowledgeDocumentId,
  repositoryDocumentId,
} from './ids';
import { buildKnowledgeArtifacts } from './knowledge';
import { persistAnalysis } from './persist';
import type {
  AnalysisPersistenceInput,
  SanityDocument,
  SanityPersistenceClient,
  SanityTransaction,
} from './types';

class MemoryClient implements SanityPersistenceClient {
  readonly documents = new Map<string, SanityDocument>();
  commits = 0;

  transaction(): SanityTransaction {
    const pending: SanityDocument[] = [];
    return {
      createOrReplace: (document) => {
        pending.push(document);
        return this.transaction();
      },
      commit: async () => {
        for (const document of pending)
          this.documents.set(document._id, document);
        this.commits += 1;
      },
    };
  }

  async fetch<T>(): Promise<T> {
    return [...this.documents.values()] as T;
  }
}

function input(): AnalysisPersistenceInput {
  const ingested = {
    repository: {
      githubId: 1,
      owner: 'octocat',
      name: 'Hello-World',
      fullName: 'octocat/Hello-World',
      githubUrl: 'https://github.com/octocat/Hello-World',
      defaultBranch: 'main',
      description: 'Example',
    },
    commitSha: 'commit-sha',
    files: [
      {
        path: 'src/index.ts',
        sha: 'file-sha',
        size: 42,
        content:
          "import { helper } from './helper';\nexport function run() { return helper(); }",
        sourceUrl:
          'https://github.com/octocat/Hello-World/blob/commit-sha/src/index.ts',
      },
    ],
  };
  return {
    analysisId: 'analysis_test',
    status: 'ready',
    progress: 100,
    filesProcessed: 1,
    totalFiles: 1,
    ingested,
    intelligence: analyzeRepositoryFiles(ingested.files, ingested.commitSha),
  };
}

describe('Sanity persistence', () => {
  it('uses deterministic IDs for the same repository, commit, and path', () => {
    expect(repositoryDocumentId(1)).toBe(repositoryDocumentId(1));
    expect(
      codeFileDocumentId('repository-1', 'commit-sha', 'src/index.ts'),
    ).toBe(codeFileDocumentId('repository-1', 'commit-sha', 'src/index.ts'));
    expect(
      knowledgeDocumentId('repository-1', 'commit-sha', 'architecture'),
    ).toBe(knowledgeDocumentId('repository-1', 'commit-sha', 'architecture'));
  });

  it('builds source-derived documents with commit-pinned evidence', () => {
    const documents = buildPersistenceDocuments(input());
    const symbol = documents.find(
      (document) => document._type === 'codeSymbol',
    );
    const architecture = documents.find(
      (document) => document._type === 'architectureOverview',
    );

    expect(symbol?.commitSha).toBe('commit-sha');
    expect((symbol?.evidence as { sourceUrl: string }).sourceUrl).toContain(
      '/blob/commit-sha/',
    );
    expect(architecture?.generatedBy).toBe('deterministic');
    expect(
      documents.filter((document) => document._type === 'knowledgeDocument'),
    ).toHaveLength(3);
  });

  it('replaces the same document IDs on repeated persistence', async () => {
    const client = new MemoryClient();
    const first = await persistAnalysis(client, input());
    const second = await persistAnalysis(client, input());

    expect(second.documentIds).toEqual(first.documentIds);
    expect(client.documents.size).toBe(first.counts.total);
    expect(first.counts).toEqual({
      repository: 1,
      codeFile: 1,
      codeSymbol: 1,
      codeRelationship: 1,
      architectureOverview: 1,
      knowledgeDocument: 3,
      total: 8,
    });
  });

  it('rejects evidence from a different commit', async () => {
    const testInput = input();
    const symbol = testInput.intelligence.files[0]?.symbols[0];
    if (!symbol) throw new Error('Expected test symbol.');
    symbol.evidence.commitSha = 'different-commit';

    await expect(
      persistAnalysis(new MemoryClient(), testInput),
    ).rejects.toThrow('does not match the ingested repository commit');
  });

  it('creates predictable Knowledge Base artifacts with commit-pinned evidence', () => {
    const testInput = input();
    const artifacts = buildKnowledgeArtifacts(
      testInput.ingested,
      testInput.intelligence,
    );

    expect(artifacts.map((artifact) => artifact.path)).toEqual([
      'repository-overview.md',
      'architecture.md',
      'source-evidence.md',
    ]);
    expect(
      artifacts.every((artifact) => artifact.content.includes('commit-sha')),
    ).toBe(true);
    expect(
      artifacts.find((artifact) => artifact.path === 'source-evidence.md')
        ?.content,
    ).toContain('src/index.ts:1-1');
  });
});
