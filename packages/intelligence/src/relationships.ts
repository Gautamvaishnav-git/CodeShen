import type {
  CodeRelationship,
  FileIntelligence,
  SourceEvidence,
} from './types';

export function extractRelationships(
  files: FileIntelligence[],
): CodeRelationship[] {
  const relationships: CodeRelationship[] = [];

  for (const file of files) {
    for (const codeImport of file.imports) {
      relationships.push({
        source: file.path,
        target: codeImport.source,
        type: 'imports',
        confidence: 1,
        evidence: codeImport.evidence,
      });
    }
  }

  return relationships;
}

export function relationshipEvidence(
  relationship: CodeRelationship,
): SourceEvidence {
  return relationship.evidence;
}
