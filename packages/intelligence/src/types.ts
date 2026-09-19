export type SupportedLanguage = 'typescript' | 'javascript' | 'python' | 'go';

export type SourceEvidence = {
  filePath: string;
  startLine: number;
  endLine: number;
  commitSha: string;
  sourceUrl: string;
};

export type CodeSymbolKind =
  'function' | 'class' | 'interface' | 'type' | 'variable' | 'method';

export type CodeSymbol = {
  name: string;
  kind: CodeSymbolKind;
  signature: string;
  startLine: number;
  endLine: number;
  exported: boolean;
  evidence: SourceEvidence;
};

export type CodeImport = {
  source: string;
  importedNames: string[];
  evidence: SourceEvidence;
};

export type CodeExport = {
  name: string;
  evidence: SourceEvidence;
};

export type FileIntelligence = {
  path: string;
  language: SupportedLanguage;
  symbols: CodeSymbol[];
  imports: CodeImport[];
  exports: CodeExport[];
};

export type DependencyInfo = {
  name: string;
  source: 'package.json' | 'requirements.txt' | 'go.mod';
  kind: 'dependency' | 'devDependency' | 'framework';
};

export type RelationshipType = 'imports' | 'defines_route' | 'depends_on';

export type CodeRelationship = {
  source: string;
  target: string;
  type: RelationshipType;
  confidence: number;
  evidence: SourceEvidence;
};
