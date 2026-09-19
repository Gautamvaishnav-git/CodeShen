import { defineField, defineType } from 'sanity';

export const repository = defineType({
  name: 'repository',
  title: 'Repository',
  type: 'document',
  fields: [
    defineField({ name: 'githubId', title: 'GitHub ID', type: 'string' }),
    defineField({ name: 'owner', title: 'Owner', type: 'string' }),
    defineField({ name: 'name', title: 'Name', type: 'string' }),
    defineField({ name: 'fullName', title: 'Full Name', type: 'string' }),
    defineField({ name: 'githubUrl', title: 'GitHub URL', type: 'url' }),
    defineField({
      name: 'defaultBranch',
      title: 'Default Branch',
      type: 'string',
    }),
    defineField({ name: 'commitSha', title: 'Commit SHA', type: 'string' }),
    defineField({ name: 'description', title: 'Description', type: 'text' }),
    defineField({
      name: 'languages',
      title: 'Languages',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'frameworks',
      title: 'Frameworks',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: { list: ['queued', 'analyzing', 'ready', 'failed'] },
    }),
    defineField({ name: 'analyzedAt', title: 'Analyzed At', type: 'datetime' }),
  ],
});
