import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';

import { sanityStudioBasePath } from '@codeshen/config';

import { schemaTypes } from './src/schemaTypes';

const projectId = process.env.SANITY_PROJECT_ID;
const dataset = process.env.SANITY_DATASET;

if (!projectId || !dataset) {
  throw new Error(
    'SANITY_PROJECT_ID and SANITY_DATASET are required to run Sanity Studio.',
  );
}

export default defineConfig({
  name: 'codeshen-studio',
  title: 'CodeShen',
  projectId,
  dataset,
  basePath: sanityStudioBasePath,
  plugins: [structureTool()],
  schema: {
    types: schemaTypes,
  },
});
