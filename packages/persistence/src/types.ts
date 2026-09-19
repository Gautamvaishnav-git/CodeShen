import type { IngestedRepository } from '@codeshen/ingestion';
import type { RepositoryCodeIntelligence } from '@codeshen/intelligence';

export type SanityReference = {
  _type: 'reference';
  _ref: string;
};

export type SanityEvidence = {
  filePath: string;
  startLine: number;
  endLine: number;
  commitSha: string;
  sourceUrl: string;
};

export type SanityDocument = {
  _id: string;
  _type: string;
  [key: string]: unknown;
};

export type SanityTransaction = {
  createOrReplace(document: SanityDocument): SanityTransaction;
  commit(options?: { transactionId?: string }): Promise<unknown>;
};

export type SanityPersistenceClient = {
  transaction(): SanityTransaction;
  fetch<T>(query: string, params?: Record<string, unknown>): Promise<T>;
};

export type AnalysisPersistenceInput = {
  analysisId: string;
  status: 'ready' | 'failed';
  progress: number;
  filesProcessed: number;
  totalFiles: number;
  error?: string;
  ingested: IngestedRepository;
  intelligence: RepositoryCodeIntelligence;
};

export type PersistedDocumentCounts = {
  repository: number;
  codeFile: number;
  codeSymbol: number;
  codeRelationship: number;
  architectureOverview: number;
  knowledgeDocument: number;
  total: number;
};

export type PersistenceResult = {
  repositoryId: string;
  commitSha: string;
  documentIds: string[];
  counts: PersistedDocumentCounts;
};
