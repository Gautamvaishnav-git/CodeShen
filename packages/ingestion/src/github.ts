import { Octokit } from '@octokit/rest';

import type {
  GitHubRepositoryClient,
  GitHubRepositoryClient as RepositoryClient,
  GitHubTreeEntry,
  RepositoryReference,
  RepositoryMetadata,
} from './types';

export class OctokitRepositoryClient implements GitHubRepositoryClient {
  constructor(private readonly octokit: Octokit) {}

  private repositoryParameters(reference: RepositoryReference) {
    return { owner: reference.owner, repo: reference.name };
  }

  async getRepository(
    reference: RepositoryReference,
  ): Promise<RepositoryMetadata> {
    const response = await this.octokit.rest.repos.get(
      this.repositoryParameters(reference),
    );
    const repository = response.data;

    if (repository.private) {
      throw new Error('The repository must be public.');
    }

    return {
      githubId: repository.id,
      owner: reference.owner,
      name: reference.name,
      fullName: repository.full_name,
      githubUrl: repository.html_url,
      defaultBranch: repository.default_branch,
      description: repository.description,
    };
  }

  async getCommitSha(
    reference: RepositoryReference,
    branch: string,
  ): Promise<string> {
    const response = await this.octokit.rest.repos.getBranch({
      ...this.repositoryParameters(reference),
      branch,
    });
    return response.data.commit.sha;
  }

  async getTree(
    reference: RepositoryReference,
    commitSha: string,
  ): Promise<GitHubTreeEntry[]> {
    const response = await this.octokit.rest.git.getTree({
      ...this.repositoryParameters(reference),
      tree_sha: commitSha,
      recursive: 'true',
    });
    return response.data.tree;
  }

  async getFile(
    reference: RepositoryReference,
    path: string,
    commitSha: string,
  ) {
    const response = await this.octokit.rest.repos.getContent({
      ...this.repositoryParameters(reference),
      path,
      ref: commitSha,
    });
    const file = response.data;

    if (
      Array.isArray(file) ||
      file.type !== 'file' ||
      typeof file.content !== 'string'
    ) {
      throw new Error(`Expected a file response for ${path}.`);
    }

    return {
      sha: file.sha,
      size: file.size,
      content: Buffer.from(file.content, 'base64').toString('utf8'),
    };
  }
}

export function createGitHubClient(token?: string): RepositoryClient {
  return new OctokitRepositoryClient(
    new Octokit(token ? { auth: token } : undefined),
  );
}
