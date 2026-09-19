import { parseEnv } from '@codeshen/config';
import {
  AnalysisStateStore,
  createGitHubClient,
  RepositoryIngestionService,
  type AnalysisProgress,
} from '@codeshen/ingestion';
import { analyzeRepositoryFiles } from '@codeshen/intelligence';
import {
  createSanityServerClient,
  persistAnalysis,
} from '@codeshen/persistence';

export const analysisState = new AnalysisStateStore();

export function createIngestionService() {
  const env = parseEnv(process.env);
  return new RepositoryIngestionService(createGitHubClient(env.GITHUB_TOKEN));
}

export async function runAnalysis(
  repositoryUrl: string,
  analysisId: string,
  onProgress: (progress: AnalysisProgress) => void,
) {
  const ingested = await createIngestionService().ingest(
    repositoryUrl,
    onProgress,
  );
  onProgress({
    status: 'analyzing',
    phase: 'intelligence',
    progress: 90,
    filesProcessed: ingested.files.length,
    totalFiles: ingested.files.length,
  });

  const intelligence = analyzeRepositoryFiles(
    ingested.files,
    ingested.commitSha,
  );
  onProgress({
    status: 'analyzing',
    phase: 'persisting',
    progress: 95,
    filesProcessed: ingested.files.length,
    totalFiles: ingested.files.length,
  });

  const result = await persistAnalysis(createSanityServerClient(), {
    analysisId,
    status: 'ready',
    progress: 100,
    filesProcessed: ingested.files.length,
    totalFiles: ingested.files.length,
    ingested,
    intelligence,
  });

  onProgress({
    status: 'ready',
    phase: 'complete',
    progress: 100,
    filesProcessed: ingested.files.length,
    totalFiles: ingested.files.length,
  });

  return result;
}
