import { describe, expect, it } from 'vitest';

import {
  buildRepositoryQuery,
  chatRequestSchema,
  formatEvidenceCitations,
  scopeKnowledgeEntries,
  selectRetrievalPlan,
  codeShenEvaluationCases,
  evaluateAnswerEvidence,
} from './agent';
import { contextDocuments } from './mcp';

describe('CodeShen agent', () => {
  it('validates repository-scoped chat input', () => {
    expect(
      chatRequestSchema.safeParse({
        repositoryId: 'repository-123',
        message: 'Explain the architecture',
      }).success,
    ).toBe(true);
    expect(
      chatRequestSchema.safeParse({
        repositoryId: 'other-repository',
        message: 'Explain the architecture',
      }).success,
    ).toBe(false);
  });

  it('builds dataset queries scoped to the selected repository', () => {
    const query = buildRepositoryQuery(
      'repository-123',
      'commit-abc',
      'symbols',
      'helper',
    );
    expect(query).toContain('_id == "repository-123"');
    expect(query).toContain('references("repository-123")');
    expect(query).toContain('_type == "codeSymbol"');
    expect(query).toContain('commitSha == "commit-abc"');
    expect(query).toContain('helper');
  });

  it('does not allow search text to escape the GROQ string literal', () => {
    const query = buildRepositoryQuery(
      'repository-123',
      'commit-abc',
      'files',
      'foo" || _type == "repository',
    );
    expect(query).toContain('foo\\" || _type == \\"repository');
  });

  it('selects retrieval sources for representative questions', () => {
    expect(selectRetrievalPlan('Which modules import Redis?')).toBe('dataset');
    expect(selectRetrievalPlan('Explain the architecture')).toBe(
      'knowledge-base',
    );
    expect(selectRetrievalPlan('Explain the authentication flow')).toBe('both');
  });

  it('formats source evidence citations', () => {
    expect(
      formatEvidenceCitations([
        {
          path: 'src/auth.ts',
          evidence: { filePath: 'src/auth.ts', startLine: 4, endLine: 12 },
        },
      ]),
    ).toEqual(['src/auth.ts:4-12']);
  });

  it('parses structured Context MCP document blocks', () => {
    expect(
      contextDocuments('<documents>{"_id":"codeFile-1"}</documents>'),
    ).toEqual([{ _id: 'codeFile-1' }]);
  });

  it('parses Sanity Context GROQ JSON responses', () => {
    expect(
      contextDocuments(
        JSON.stringify({
          meta: { resultCount: 1 },
          result: [{ _id: 'codeSymbol-1', name: 'persistAnalysis' }],
        }),
      ),
    ).toEqual([{ _id: 'codeSymbol-1', name: 'persistAnalysis' }]);
    expect(
      contextDocuments(
        JSON.stringify({
          meta: { resultCount: 1 },
          result: { _id: 'repository-1', fullName: 'octocat/repo' },
        }),
      ),
    ).toEqual([{ _id: 'repository-1', fullName: 'octocat/repo' }]);
  });

  it('does not mix Knowledge Base entries from other repositories or commits', () => {
    const scope = {
      repositoryId: 'repository-1',
      fullName: 'octocat/Hello-World',
      commitSha: 'commit-current',
    };
    const entries = scopeKnowledgeEntries(
      '# Current\noctocat/Hello-World commit-current\n\n---\n\n# Other\nother/repo commit-current\n\n---\n\n# Old\noctocat/Hello-World commit-old',
      scope,
    );
    expect(entries).toHaveLength(1);
    expect(entries[0]).toContain('# Current');
  });

  it('checks the seven repository evidence evaluations', () => {
    expect(codeShenEvaluationCases).toHaveLength(7);
    for (const evaluationCase of codeShenEvaluationCases) {
      const answer = `Verified sources: ${evaluationCase.expectedEvidence.join(', ')}`;
      expect(evaluateAnswerEvidence(evaluationCase, answer).passed).toBe(true);
    }
    expect(
      evaluateAnswerEvidence(codeShenEvaluationCases[0]!, 'No evidence.')
        .passed,
    ).toBe(false);
  });
});
