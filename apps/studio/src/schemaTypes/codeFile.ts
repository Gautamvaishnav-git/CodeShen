import { defineField, defineType } from 'sanity';

export const codeFile = defineType({
  name: 'codeFile',
  title: 'Code File',
  type: 'document',
  fields: [
    defineField({
      name: 'repository',
      title: 'Repository',
      type: 'reference',
      to: [{ type: 'repository' }],
    }),
    defineField({ name: 'path', title: 'Path', type: 'string' }),
    defineField({ name: 'language', title: 'Language', type: 'string' }),
    defineField({ name: 'size', title: 'Size', type: 'number' }),
    defineField({ name: 'sha', title: 'SHA', type: 'string' }),
    defineField({ name: 'summary', title: 'Summary', type: 'text' }),
    defineField({ name: 'content', title: 'Content', type: 'text' }),
    defineField({ name: 'sourceUrl', title: 'Source URL', type: 'url' }),
  ],
});
