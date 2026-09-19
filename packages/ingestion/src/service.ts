import { INGESTION_LIMITS } from './constants';
import { selectRepositoryFiles } from './filter';
import { parsePublicRepositoryUrl } from './url';
import type {
  AnalysisProgress,
  GitHubRepositoryClient,
  IngestedRepository,
  RepositoryReference,
} from './types';

type ProgressCallback = (progress: AnalysisProgress) => void;

export class RepositoryIngestionService {
  constructor(private readonly client: GitHubRepositoryClient) {}

  async ingest(
    repositoryUrl: string,
    onProgress?: ProgressCallback,
  ): Promise<IngestedRepository> {
    const reference = parsePublicRepositoryUrl(repositoryUrl);
    return this.ingestReference(reference, onProgress);
  }

  private async ingestReference(
    reference: RepositoryReference,
    onProgress?: ProgressCallback,
  ): Promise<IngestedRepository> {
    onProgress?.({
      status: 'analyzing',
      phase: 'metadata',
      progress: 10,
      filesProcessed: 0,
      totalFiles: 0,
    });
    const repository = await this.client.getRepository(reference);
    const commitSha = await this.client.getCommitSha(
      reference,
      repository.defaultBranch,
    );

    onProgress?.({
      status: 'analyzing',
      phase: 'tree',
      progress: 25,
      filesProcessed: 0,
      totalFiles: 0,
    });
    const tree = await this.client.getTree(reference, commitSha);
    const selectedFiles = selectRepositoryFiles(
      tree,
      INGESTION_LIMITS.maxFiles,
    );

    onProgress?.({
      status: 'analyzing',
      phase: 'filtering',
      progress: 35,
      filesProcessed: 0,
      totalFiles: selectedFiles.length,
    });

    const files = [];
    let totalContentSize = 0;

    for (const [index, entry] of selectedFiles.entries()) {
      const path = entry.path!;
      const size = entry.size ?? 0;

      if (
        size > INGESTION_LIMITS.maxFileSize ||
        totalContentSize + size > INGESTION_LIMITS.maxTotalSourceContent
      ) {
        continue;
      }

      const file = await this.client.getFile(reference, path, commitSha);
      totalContentSize += file.content.length;
      files.push({
        ...file,
        path,
        size: file.size,
        sourceUrl: `${repository.githubUrl}/blob/${commitSha}/${path}`,
      });

      onProgress?.({
        status: 'analyzing',
        phase: 'contents',
        progress: 35 + Math.round(((index + 1) / selectedFiles.length) * 60),
        filesProcessed: index + 1,
        totalFiles: selectedFiles.length,
      });
    }

    onProgress?.({
      status: 'ready',
      phase: 'complete',
      progress: 100,
      filesProcessed: files.length,
      totalFiles: selectedFiles.length,
    });

    return { repository, commitSha, files };
  }
}
