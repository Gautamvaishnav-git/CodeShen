import { detectDependencies } from './dependencies';
import { extractFileIntelligence } from './extract';
import { extractRelationships } from './relationships';
import type {
  CodeRelationship,
  DependencyInfo,
  FileIntelligence,
} from './types';

export type AnalyzableFile = {
  path: string;
  content: string;
  sha: string;
  sourceUrl: string;
};

export type RepositoryCodeIntelligence = {
  files: FileIntelligence[];
  relationships: CodeRelationship[];
  dependencies: DependencyInfo[];
};

export function analyzeRepositoryFiles(
  files: AnalyzableFile[],
  commitSha: string,
): RepositoryCodeIntelligence {
  const analyzedFiles = files.flatMap((file) => {
    const intelligence = extractFileIntelligence(
      file.path,
      file.content,
      commitSha,
      file.sourceUrl,
    );
    return intelligence ? [intelligence] : [];
  });

  return {
    files: analyzedFiles,
    relationships: extractRelationships(analyzedFiles),
    dependencies: detectDependencies(files),
  };
}
