import type {
  RepositoryCodeIntelligence,
  SourceEvidence,
} from '@codeshen/intelligence';

import type { IngestedRepository } from '@codeshen/ingestion';

export type KnowledgeArtifact = {
  path: string;
  title: string;
  documentType: 'repository-overview' | 'architecture' | 'source-evidence';
  commitSha: string;
  content: string;
  sourceEvidence: SourceEvidence[];
};

function evidenceLine(evidence: SourceEvidence): string {
  return `- ${evidence.filePath}:${evidence.startLine}-${evidence.endLine} (${evidence.sourceUrl})`;
}

function frontMatter(title: string, repository: IngestedRepository): string {
  return `---\ntitle: ${title}\nrepository: ${repository.repository.fullName}\ncommitSha: ${repository.commitSha}\nsource: deterministic-analysis\n---\n\n`;
}

export function buildKnowledgeArtifacts(
  repository: IngestedRepository,
  intelligence: RepositoryCodeIntelligence,
): KnowledgeArtifact[] {
  const files = intelligence.files;
  const dependencies = intelligence.dependencies
    .map((dependency) => `- ${dependency.name} (${dependency.kind})`)
    .join('\n');
  const relationships = intelligence.relationships
    .map(
      (relationship) =>
        `- ${relationship.source} --${relationship.type}--> ${relationship.target}\n  ${evidenceLine(relationship.evidence)}`,
    )
    .join('\n');
  const evidence = files
    .flatMap((file) => [
      ...file.symbols.map((symbol) => symbol.evidence),
      ...file.imports.map((codeImport) => codeImport.evidence),
    ])
    .slice(0, 100)
    .map(evidenceLine)
    .join('\n');
  const sourceEvidence = files.flatMap((file) => [
    ...file.symbols.map((symbol) => symbol.evidence),
    ...file.imports.map((codeImport) => codeImport.evidence),
  ]);

  return [
    {
      path: 'repository-overview.md',
      title: 'Repository Overview',
      documentType: 'repository-overview',
      commitSha: repository.commitSha,
      sourceEvidence: [],
      content: `${frontMatter('Repository Overview', repository)}# ${repository.repository.fullName}\n\n${repository.repository.description ?? 'No repository description was provided.'}\n\nAnalyzed commit: \`${repository.commitSha}\`.\n\nFiles analyzed: ${repository.files.length}.\n\nThis document contains deterministic source-derived facts only.\n`,
    },
    {
      path: 'architecture.md',
      title: 'Architecture',
      documentType: 'architecture',
      commitSha: repository.commitSha,
      sourceEvidence,
      content: `${frontMatter('Architecture', repository)}# Architecture\n\n## Languages\n\n${[
        ...new Set(files.map((file) => file.language)),
      ]
        .sort()
        .map((language) => `- ${language}`)
        .join(
          '\n',
        )}\n\n## Dependencies and frameworks\n\n${dependencies || '- None detected'}\n\n## Relationships\n\n${relationships || '- None detected'}\n\n## Provenance\n\nGenerated from deterministic analysis at commit \`${repository.commitSha}\`. It is not an LLM-generated summary.\n`,
    },
    {
      path: 'source-evidence.md',
      title: 'Source Evidence',
      documentType: 'source-evidence',
      commitSha: repository.commitSha,
      sourceEvidence,
      content: `${frontMatter('Source Evidence', repository)}# Source Evidence\n\nEvery entry below links to commit-pinned source.\n\n${evidence || '- No symbol or import evidence detected.'}\n`,
    },
  ];
}
