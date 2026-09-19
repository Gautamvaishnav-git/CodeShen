import { z } from 'zod';

import type { MCPClient } from '@ai-sdk/mcp';

import { callContextTool, contextDocuments, contextText } from './mcp';
import type { AgentLogger, RepositoryScope } from './types';

const MAX_RESULTS = 20;

export type RetrievalPlan = 'dataset' | 'knowledge-base' | 'both';

export function selectRetrievalPlan(question: string): RetrievalPlan {
  const normalized = question.toLowerCase();
  const datasetQuestion =
    /where|which|file|symbol|import|depend|redis|database connection|implemented|authentication|auth/.test(
      normalized,
    );
  const knowledgeQuestion =
    /architecture|how do i run|setup|flow|explain|overview/.test(normalized);
  if (datasetQuestion && knowledgeQuestion) return 'both';
  if (datasetQuestion) return 'dataset';
  return 'knowledge-base';
}

function groqString(value: string): string {
  return JSON.stringify(value);
}

export function buildRepositoryQuery(
  repositoryId: string,
  commitSha: string,
  kind: 'repository' | 'files' | 'symbols' | 'relationships' | 'all',
  search?: string,
  limit = MAX_RESULTS,
): string {
  const safeLimit = Math.max(1, Math.min(limit, MAX_RESULTS));
  const scope = `_id == ${groqString(repositoryId)} || references(${groqString(repositoryId)})`;
  const commitFilter = `_type == "repository" || commitSha == ${groqString(commitSha)}`;
  const typeFilter = {
    repository: `_type == "repository"`,
    files: `_type == "codeFile"`,
    symbols: `_type == "codeSymbol"`,
    relationships: `_type == "codeRelationship"`,
    all: `_type in ["repository", "codeFile", "codeSymbol", "codeRelationship", "architectureOverview"]`,
  }[kind];
  const term = search?.trim();
  const searchFilter = term
    ? ` && (path match ${groqString(`*${term}*`)} || name match ${groqString(`*${term}*`)} || source match ${groqString(`*${term}*`)} || target match ${groqString(`*${term}*`)})`
    : '';

  return `*[(${scope}) && (${typeFilter}) && (${commitFilter})${searchFilter}][0...${safeLimit}]{_id, _type, path, language, size, commitSha, name, kind, signature, startLine, endLine, exported, source, target, type, confidence, evidence, sourceUrl, summary}`;
}

export async function getRepositoryScope(
  client: MCPClient,
  repositoryId: string,
  logger: AgentLogger,
): Promise<RepositoryScope> {
  const query = `*[(_id == ${groqString(repositoryId)})][0]{_id, fullName, commitSha, status}`;
  const text = contextText(
    await callContextTool(client, 'groq_query', { query }, logger),
  );
  const repository = contextDocuments(text)[0];
  if (
    !repository ||
    typeof repository.fullName !== 'string' ||
    typeof repository.commitSha !== 'string'
  ) {
    throw new Error(
      `Repository ${repositoryId} was not found in Dataset Context.`,
    );
  }
  if (repository.status !== 'ready') {
    throw new Error(`Repository ${repositoryId} is not ready for chat.`);
  }
  return {
    repositoryId,
    fullName: repository.fullName,
    commitSha: repository.commitSha,
  };
}

export const datasetSearchInput = z.object({
  kind: z.enum(['repository', 'files', 'symbols', 'relationships', 'all']),
  search: z.string().trim().max(120).optional(),
  limit: z.number().int().min(1).max(MAX_RESULTS).optional(),
});

export async function searchDataset(
  client: MCPClient,
  scope: RepositoryScope,
  input: z.infer<typeof datasetSearchInput>,
  logger: AgentLogger,
): Promise<string> {
  const query = buildRepositoryQuery(
    scope.repositoryId,
    scope.commitSha,
    input.kind,
    input.search,
    input.limit,
  );
  const text = contextText(
    await callContextTool(client, 'groq_query', { query }, logger),
  );
  const documents = contextDocuments(text);
  if (
    documents.some(
      (document) =>
        document.commitSha && document.commitSha !== scope.commitSha,
    )
  ) {
    throw new Error('Dataset returned evidence from a mismatched commit.');
  }
  return JSON.stringify({
    repository: scope.fullName,
    commitSha: scope.commitSha,
    documents,
    citations: formatEvidenceCitations(documents),
  });
}

export function formatEvidenceCitations(
  documents: Record<string, unknown>[],
): string[] {
  return documents.flatMap((document) => {
    const evidence = document.evidence;
    if (typeof evidence === 'object' && evidence !== null) {
      const item = evidence as Record<string, unknown>;
      if (
        typeof item.filePath === 'string' &&
        typeof item.startLine === 'number' &&
        typeof item.endLine === 'number'
      ) {
        return [`${item.filePath}:${item.startLine}-${item.endLine}`];
      }
    }
    if (typeof document.path === 'string') return [document.path];
    return [];
  });
}

export function scopeKnowledgeEntries(
  text: string,
  scope: RepositoryScope,
): string[] {
  return text
    .split(/\n\s*---+\s*\n/)
    .filter(
      (entry) =>
        entry.includes(scope.fullName) && entry.includes(scope.commitSha),
    );
}

export const knowledgeReadInput = z.object({
  paths: z.array(z.string().trim().min(1).max(200)).min(1).max(10),
});

export async function readKnowledgeBase(
  client: MCPClient,
  knowledgeBaseId: string,
  scope: RepositoryScope,
  input: z.infer<typeof knowledgeReadInput>,
  logger: AgentLogger,
): Promise<string> {
  const result = await callContextTool(
    client,
    'knowledge_base_read',
    { knowledgeBase: knowledgeBaseId, paths: input.paths },
    logger,
  );
  const text = contextText(result);
  const entries = scopeKnowledgeEntries(text, scope);
  if (entries.length === 0) {
    return `No Knowledge Base evidence was returned for ${scope.fullName} at commit ${scope.commitSha}.`;
  }
  return JSON.stringify({
    repository: scope.fullName,
    commitSha: scope.commitSha,
    paths: input.paths,
    content: entries.join('\n---\n'),
  });
}
