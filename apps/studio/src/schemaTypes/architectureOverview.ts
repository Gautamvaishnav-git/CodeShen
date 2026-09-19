import { defineField, defineType } from 'sanity';

export const architectureOverview = defineType({
  name: 'architectureOverview',
  title: 'Architecture Overview',
  type: 'document',
  fields: [
    defineField({
      name: 'repository',
      title: 'Repository',
      type: 'reference',
      to: [{ type: 'repository' }],
    }),
    defineField({ name: 'title', title: 'Title', type: 'string' }),
    defineField({ name: 'summary', title: 'Summary', type: 'text' }),
    defineField({
      name: 'components',
      title: 'Components',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({ name: 'dataFlows', title: 'Data Flows', type: 'text' }),
    defineField({
      name: 'setupInstructions',
      title: 'Setup Instructions',
      type: 'text',
    }),
    defineField({ name: 'limitations', title: 'Limitations', type: 'text' }),
  ],
});
