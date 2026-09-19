import { defineField, defineType } from 'sanity';

export const codeSymbol = defineType({
  name: 'codeSymbol',
  title: 'Code Symbol',
  type: 'document',
  fields: [
    defineField({
      name: 'repository',
      title: 'Repository',
      type: 'reference',
      to: [{ type: 'repository' }],
    }),
    defineField({
      name: 'file',
      title: 'File',
      type: 'reference',
      to: [{ type: 'codeFile' }],
    }),
    defineField({ name: 'name', title: 'Name', type: 'string' }),
    defineField({ name: 'kind', title: 'Kind', type: 'string' }),
    defineField({ name: 'signature', title: 'Signature', type: 'text' }),
    defineField({ name: 'startLine', title: 'Start Line', type: 'number' }),
    defineField({ name: 'endLine', title: 'End Line', type: 'number' }),
    defineField({ name: 'exported', title: 'Exported', type: 'boolean' }),
    defineField({ name: 'summary', title: 'Summary', type: 'text' }),
  ],
});
