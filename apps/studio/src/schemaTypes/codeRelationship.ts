import { defineField, defineType } from 'sanity';

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
    defineField({ name: 'evidence', title: 'Evidence', type: 'text' }),
  ],
});
