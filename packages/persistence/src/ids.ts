import { createHash } from 'node:crypto';

function digest(value: string): string {
  return createHash('sha256').update(value).digest('hex').slice(0, 24);
}

export function repositoryDocumentId(githubId: number): string {
  return `repository-${githubId}`;
}

export function codeFileDocumentId(
  repositoryId: string,
  commitSha: string,
  path: string,
): string {
  return `codeFile-${digest(`${repositoryId}:${commitSha}:${path}`)}`;
}

export function codeSymbolDocumentId(
  repositoryId: string,
  commitSha: string,
  path: string,
  name: string,
  startLine: number,
  endLine: number,
): string {
  return `codeSymbol-${digest(`${repositoryId}:${commitSha}:${path}:${name}:${startLine}:${endLine}`)}`;
}

export function codeRelationshipDocumentId(
  repositoryId: string,
  commitSha: string,
  source: string,
  target: string,
  type: string,
  evidence: { filePath: string; startLine: number; endLine: number },
): string {
  return `codeRelationship-${digest(
    `${repositoryId}:${commitSha}:${source}:${target}:${type}:${evidence.filePath}:${evidence.startLine}:${evidence.endLine}`,
  )}`;
}

export function architectureOverviewDocumentId(
  repositoryId: string,
  commitSha: string,
): string {
  return `architectureOverview-${digest(`${repositoryId}:${commitSha}`)}`;
}
