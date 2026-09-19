import { defineField } from 'sanity';

export const evidenceFields = [
  defineField({ name: 'filePath', title: 'File Path', type: 'string' }),
  defineField({ name: 'startLine', title: 'Start Line', type: 'number' }),
  defineField({ name: 'endLine', title: 'End Line', type: 'number' }),
  defineField({ name: 'commitSha', title: 'Commit SHA', type: 'string' }),
  defineField({ name: 'sourceUrl', title: 'Source URL', type: 'url' }),
];
