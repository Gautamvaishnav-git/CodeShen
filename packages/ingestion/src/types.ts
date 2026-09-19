export const ANALYSIS_STATUSES = [
  'queued',
  'analyzing',
  'ready',
  'failed',
] as const;
export type AnalysisStatus = (typeof ANALYSIS_STATUSES)[number];

export type AnalysisPhase =
  | 'validating'
  | 'metadata'
  | 'tree'
  | 'filtering'
  | 'contents'
  | 'intelligence'
  | 'persisting'
  | 'complete';

export type AnalysisProgress = {
  status: AnalysisStatus;
  phase: AnalysisPhase;
  progress: number;
  filesProcessed: number;
  totalFiles: number;
  error?: string;
};

export type RepositoryReference = {
  owner: string;
  name: string;
  url: string;
};

export type RepositoryMetadata = {
  githubId: number;
  owner: string;
  name: string;
  fullName: string;
  githubUrl: string;
  defaultBranch: string;
  description: string | null;
};

export type RepositoryFile = {
  path: string;
  sha: string;
  size: number;
  content: string;
  sourceUrl: string;
};

export type IngestedRepository = {
  repository: RepositoryMetadata;
  commitSha: string;
  files: RepositoryFile[];
};

export type GitHubTreeEntry = {
  path?: string;
  mode?: string;
  type?: string;
  sha?: string;
  size?: number;
};

export type GitHubRepositoryClient = {
  getRepository(reference: RepositoryReference): Promise<RepositoryMetadata>;
  getCommitSha(reference: RepositoryReference, branch: string): Promise<string>;
  getTree(
    reference: RepositoryReference,
    commitSha: string,
  ): Promise<GitHubTreeEntry[]>;
  getFile(
    reference: RepositoryReference,
    path: string,
    commitSha: string,
  ): Promise<{
    sha: string;
    size: number;
    content: string;
  }>;
};
