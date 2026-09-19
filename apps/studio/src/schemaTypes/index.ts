import { architectureOverview } from './architectureOverview';
import { codeFile } from './codeFile';
import { codeRelationship } from './codeRelationship';
import { codeSymbol } from './codeSymbol';
import { knowledgeDocument } from './knowledgeDocument';
import { repository } from './repository';

export const schemaTypes = [
  repository,
  codeFile,
  codeSymbol,
  codeRelationship,
  architectureOverview,
  knowledgeDocument,
];
