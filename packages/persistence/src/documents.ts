import { detectLanguage } from '@codeshen/intelligence';
import type {
  CodeRelationship,
  CodeSymbol,
  DependencyInfo,
  FileIntelligence,
  SourceEvidence,
} from '@codeshen/intelligence';

import {
  architectureOverviewDocumentId,
  codeFileDocumentId,
  codeRelationshipDocumentId,
  codeSymbolDocumentId,
  knowledgeDocumentId,
  repositoryDocumentId,
} from './ids';
import { buildKnowledgeArtifacts } from './knowledge';
import type {
  AnalysisPersistenceInput,
  SanityDocument,
  SanityEvidence,
  SanityReference,
} from './types';

function repositoryReference(repositoryId: string): SanityReference {
  return { _type: 'reference', _ref: repositoryId };
}

function evidence(value: SourceEvidence): SanityEvidence {
  return { ...value };
}

function repositoryLanguages(files: FileIntelligence[]): string[] {
  return [...new Set(files.map((file) => file.language))].sort();
}

function frameworkNames(dependencies: DependencyInfo[]): string[] {
  return dependencies
    .filter((dependency) => dependency.kind === 'framework')
    .map((dependency) => dependency.name)
    .sort();
}

function fileDocument(
  input: AnalysisPersistenceInput,
  repositoryId: string,
  file: AnalysisPersistenceInput['ingested']['files'][number],
): SanityDocument {
  return {
    _id: codeFileDocumentId(repositoryId, input.ingested.commitSha, file.path),
    _type: 'codeFile',
    repository: repositoryReference(repositoryId),
    path: file.path,
    language: detectLanguage(file.path) ?? 'unknown',
    size: file.size,
    sha: file.sha,
    commitSha: input.ingested.commitSha,
    analysisId: input.analysisId,
    content: file.content,
    sourceUrl: file.sourceUrl,
  };
}

function symbolDocument(
  input: AnalysisPersistenceInput,
  repositoryId: string,
  file: FileIntelligence,
  symbol: CodeSymbol,
): SanityDocument {
  const fileId = codeFileDocumentId(
    repositoryId,
    input.ingested.commitSha,
    file.path,
  );
  return {
    _id: codeSymbolDocumentId(
      repositoryId,
      input.ingested.commitSha,
      file.path,
      symbol.name,
      symbol.startLine,
      symbol.endLine,
    ),
    _type: 'codeSymbol',
    repository: repositoryReference(repositoryId),
    file: { _type: 'reference', _ref: fileId },
    name: symbol.name,
    kind: symbol.kind,
    signature: symbol.signature,
    startLine: symbol.startLine,
    endLine: symbol.endLine,
    exported: symbol.exported,
    commitSha: input.ingested.commitSha,
    evidence: evidence(symbol.evidence),
  };
}

function relationshipDocument(
  input: AnalysisPersistenceInput,
  repositoryId: string,
  relationship: CodeRelationship,
): SanityDocument {
  return {
    _id: codeRelationshipDocumentId(
      repositoryId,
      input.ingested.commitSha,
      relationship.source,
      relationship.target,
      relationship.type,
      relationship.evidence,
    ),
    _type: 'codeRelationship',
    repository: repositoryReference(repositoryId),
    source: relationship.source,
    target: relationship.target,
    type: relationship.type,
    confidence: relationship.confidence,
    commitSha: input.ingested.commitSha,
    analysisId: input.analysisId,
    evidence: evidence(relationship.evidence),
  };
}

function architectureDocument(
  input: AnalysisPersistenceInput,
  repositoryId: string,
): SanityDocument {
  const { ingested, intelligence } = input;
  const evidenceItems = intelligence.files
    .flatMap((file) => [
      ...file.symbols.map((symbol) => symbol.evidence),
      ...file.imports.map((codeImport) => codeImport.evidence),
    ])
    .slice(0, 100);
  const dataFlows = intelligence.relationships
    .map(
      (relationship) =>
        `${relationship.source} --${relationship.type}--> ${relationship.target}`,
    )
    .join('\n');
  const frameworks = frameworkNames(intelligence.dependencies);

  return {
    _id: architectureOverviewDocumentId(repositoryId, ingested.commitSha),
    _type: 'architectureOverview',
    repository: repositoryReference(repositoryId),
    title: `${ingested.repository.fullName} architecture`,
    summary: `Deterministic analysis found ${intelligence.files.length} parsed files, ${intelligence.relationships.length} relationships, and ${intelligence.dependencies.length} dependencies at commit ${ingested.commitSha}.`,
    components: [...repositoryLanguages(intelligence.files), ...frameworks],
    dataFlows,
    setupInstructions: `Source-derived facts for ${ingested.repository.fullName} at commit ${ingested.commitSha}.`,
    limitations:
      'Generated from deterministic source analysis. No LLM-generated summary has been applied.',
    commitSha: ingested.commitSha,
    generatedBy: 'deterministic',
    sourceEvidence: evidenceItems.map(evidence),
  };
}

function knowledgeDocuments(
  input: AnalysisPersistenceInput,
  repositoryId: string,
): SanityDocument[] {
  return buildKnowledgeArtifacts(input.ingested, input.intelligence).map(
    (artifact) => ({
      _id: knowledgeDocumentId(
        repositoryId,
        input.ingested.commitSha,
        artifact.documentType,
      ),
      _type: 'knowledgeDocument',
      repository: repositoryReference(repositoryId),
      title: artifact.title,
      documentType: artifact.documentType,
      path: artifact.path,
      content: artifact.content,
      commitSha: artifact.commitSha,
      generatedAt: new Date().toISOString(),
      generatedBy: 'deterministic',
      source: 'deterministic-analysis',
      analysisId: input.analysisId,
      sourceEvidence: artifact.sourceEvidence.map(evidence),
    }),
  );
}

export function buildPersistenceDocuments(
  input: AnalysisPersistenceInput,
): SanityDocument[] {
  const repositoryId = repositoryDocumentId(input.ingested.repository.githubId);
  const repositoryDocument: SanityDocument = {
    _id: repositoryId,
    _type: 'repository',
    githubId: String(input.ingested.repository.githubId),
    owner: input.ingested.repository.owner,
    name: input.ingested.repository.name,
    fullName: input.ingested.repository.fullName,
    githubUrl: input.ingested.repository.githubUrl,
    defaultBranch: input.ingested.repository.defaultBranch,
    commitSha: input.ingested.commitSha,
    description: input.ingested.repository.description,
    languages: repositoryLanguages(input.intelligence.files),
    frameworks: frameworkNames(input.intelligence.dependencies),
    status: input.status,
    analysisId: input.analysisId,
    progress: input.progress,
    filesProcessed: input.filesProcessed,
    totalFiles: input.totalFiles,
    error: input.error,
    analyzedAt: new Date().toISOString(),
  };

  const fileDocuments = input.ingested.files.map((file) =>
    fileDocument(input, repositoryId, file),
  );
  const symbolDocuments = input.intelligence.files.flatMap((file) =>
    file.symbols.map((symbol) =>
      symbolDocument(input, repositoryId, file, symbol),
    ),
  );
  const relationshipDocuments = input.intelligence.relationships.map(
    (relationship) => relationshipDocument(input, repositoryId, relationship),
  );

  return [
    repositoryDocument,
    ...fileDocuments,
    ...symbolDocuments,
    ...relationshipDocuments,
    architectureDocument(input, repositoryId),
    ...knowledgeDocuments(input, repositoryId),
  ];
}
