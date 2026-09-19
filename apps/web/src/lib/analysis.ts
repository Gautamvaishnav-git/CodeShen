import { parseEnv } from '@codeshen/config';
import {
  AnalysisStateStore,
  createGitHubClient,
  RepositoryIngestionService,
} from '@codeshen/ingestion';

export const analysisState = new AnalysisStateStore();

export function createIngestionService() {
  const env = parseEnv(process.env);
  return new RepositoryIngestionService(createGitHubClient(env.GITHUB_TOKEN));
}
