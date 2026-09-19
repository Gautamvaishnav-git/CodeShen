import type Parser from 'tree-sitter';

import { parseSource } from './parser';
import type {
  CodeExport,
  CodeImport,
  CodeSymbol,
  CodeSymbolKind,
  FileIntelligence,
  SourceEvidence,
} from './types';

const SYMBOL_KINDS: Record<string, CodeSymbolKind> = {
  class_declaration: 'class',
  class_definition: 'class',
  function_declaration: 'function',
  function_definition: 'function',
  generator_function_declaration: 'function',
  method_definition: 'method',
  method_declaration: 'method',
  interface_declaration: 'interface',
  type_alias_declaration: 'type',
  type_declaration: 'type',
  lexical_declaration: 'variable',
  var_declaration: 'variable',
};

const IMPORT_NODE_TYPES = new Set([
  'import_statement',
  'import_declaration',
  'import_from_statement',
  'import_specification',
]);

const EXPORT_NODE_TYPES = new Set(['export_statement', 'export_declaration']);

function walk(
  node: Parser.SyntaxNode,
  visit: (node: Parser.SyntaxNode) => void,
): void {
  visit(node);
  for (const child of node.namedChildren) walk(child, visit);
}

function evidenceFor(
  node: Parser.SyntaxNode,
  filePath: string,
  commitSha: string,
  sourceUrl: string,
): SourceEvidence {
  return {
    filePath,
    startLine: node.startPosition.row + 1,
    endLine: node.endPosition.row + 1,
    commitSha,
    sourceUrl,
  };
}

function namedChildText(
  node: Parser.SyntaxNode,
  names: string[],
): string | undefined {
  for (const name of names) {
    const child = node.childForFieldName(name);
    if (child) return child.text;
  }
  return node.namedChildren.find((child) =>
    /^[A-Za-z_$][\w$]*$/.test(child.text),
  )?.text;
}

function isExported(node: Parser.SyntaxNode): boolean {
  return (
    node.parent?.type === 'export_statement' ||
    node.parent?.type === 'export_declaration'
  );
}

function extractSymbol(
  node: Parser.SyntaxNode,
  evidence: SourceEvidence,
): CodeSymbol | undefined {
  const kind = SYMBOL_KINDS[node.type];
  if (!kind) return undefined;

  const name = namedChildText(node, ['name', 'declarator', 'left']);
  if (!name) return undefined;

  return {
    name,
    kind,
    signature: node.text.split('\n')[0].trim(),
    startLine: evidence.startLine,
    endLine: evidence.endLine,
    exported: isExported(node),
    evidence,
  };
}

function extractImport(
  node: Parser.SyntaxNode,
  evidence: SourceEvidence,
): CodeImport | undefined {
  if (!IMPORT_NODE_TYPES.has(node.type) || node.type === 'import_specification')
    return undefined;

  const sourceNode =
    node.childForFieldName('source') ?? node.namedChildren.at(-1);
  if (!sourceNode) return undefined;

  return {
    source: sourceNode.text.replace(/^['"]|['"]$/g, ''),
    importedNames: node.namedChildren
      .filter((child) => child !== sourceNode)
      .map((child) => child.text),
    evidence,
  };
}

function extractExport(
  node: Parser.SyntaxNode,
  evidence: SourceEvidence,
): CodeExport | undefined {
  if (!EXPORT_NODE_TYPES.has(node.type)) return undefined;
  const declaration =
    node.childForFieldName('declaration') ?? node.namedChildren.at(-1);
  if (!declaration) return undefined;

  const name =
    namedChildText(declaration, ['name', 'declarator', 'left']) ??
    declaration.text.split(/\s+/)[1];
  if (!name) return undefined;
  return { name, evidence };
}

export function extractFileIntelligence(
  filePath: string,
  content: string,
  commitSha: string,
  sourceUrl: string,
): FileIntelligence | undefined {
  const parsed = parseSource(filePath, content);
  if (!parsed) return undefined;

  const symbols: CodeSymbol[] = [];
  const imports: CodeImport[] = [];
  const exports: CodeExport[] = [];

  walk(parsed.tree.rootNode, (node) => {
    const evidence = evidenceFor(node, filePath, commitSha, sourceUrl);
    const symbol = extractSymbol(node, evidence);
    if (symbol) symbols.push(symbol);

    const codeImport = extractImport(node, evidence);
    if (codeImport) imports.push(codeImport);

    const codeExport = extractExport(node, evidence);
    if (codeExport) exports.push(codeExport);
  });

  return {
    path: filePath,
    language: parsed.language,
    symbols,
    imports,
    exports,
  };
}
