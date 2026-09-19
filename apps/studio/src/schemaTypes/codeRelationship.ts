import { defineField, defineType } from 'sanity';

import { evidenceFields } from './evidence';

export const codeRelationship = defineType({
  name: 'codeRelationship',
  title: 'Code Relationship',
  type: 'document',
  fields: [
    defineField({
      name: 'repository',
      title: 'Repository',
      type: 'reference',
      to: [{ type: 'repository' }],
    }),
    defineField({ name: 'source', title: 'Source', type: 'string' }),
    defineField({ name: 'target', title: 'Target', type: 'string' }),
    defineField({ name: 'type', title: 'Type', type: 'string' }),
    defineField({ name: 'confidence', title: 'Confidence', type: 'number' }),
    defineField({ name: 'commitSha', title: 'Commit SHA', type: 'string' }),
    defineField({ name: 'analysisId', title: 'Analysis ID', type: 'string' }),
    defineField({
      name: 'evidence',
      title: 'Evidence',
      type: 'object',
      fields: evidenceFields,
    }),
  ],
});
