import { buildPersistenceDocuments } from './documents';
import { repositoryDocumentId } from './ids';
import type {
  AnalysisPersistenceInput,
  PersistedDocumentCounts,
  PersistenceResult,
  SanityDocument,
  SanityPersistenceClient,
} from './types';

const PERSISTENCE_BATCH_SIZE = 100;

function assertCommitConsistency(input: AnalysisPersistenceInput): void {
  const expectedCommit = input.ingested.commitSha;
  const evidence = input.intelligence.files.flatMap((file) => [
    ...file.symbols.map((symbol) => symbol.evidence),
    ...file.imports.map((codeImport) => codeImport.evidence),
  ]);
  evidence.push(
    ...input.intelligence.relationships.map(
      (relationship) => relationship.evidence,
    ),
  );

  if (evidence.some((item) => item.commitSha !== expectedCommit)) {
    throw new Error(
      'Analysis evidence commit SHA does not match the ingested repository commit.',
    );
  }
}

function countDocuments(documents: SanityDocument[]): PersistedDocumentCounts {
  const count = (type: string) =>
    documents.filter((document) => document._type === type).length;
  const repository = count('repository');
  const codeFile = count('codeFile');
  const codeSymbol = count('codeSymbol');
  const codeRelationship = count('codeRelationship');
  const architectureOverview = count('architectureOverview');
  return {
    repository,
    codeFile,
    codeSymbol,
    codeRelationship,
    architectureOverview,
    total:
      repository +
      codeFile +
      codeSymbol +
      codeRelationship +
      architectureOverview,
  };
}

export async function persistAnalysis(
  client: SanityPersistenceClient,
  input: AnalysisPersistenceInput,
): Promise<PersistenceResult> {
  assertCommitConsistency(input);
  const documents = buildPersistenceDocuments(input);

  for (
    let offset = 0;
    offset < documents.length;
    offset += PERSISTENCE_BATCH_SIZE
  ) {
    const batch = documents.slice(offset, offset + PERSISTENCE_BATCH_SIZE);
    const transaction = client.transaction();
    for (const document of batch) transaction.createOrReplace(document);
    await transaction.commit();
  }

  return {
    repositoryId: repositoryDocumentId(input.ingested.repository.githubId),
    commitSha: input.ingested.commitSha,
    documentIds: documents.map((document) => document._id),
    counts: countDocuments(documents),
  };
}
