import { randomUUID } from 'node:crypto';

import { streamText, stepCountIs, tool } from 'ai';
import type { LanguageModel } from 'ai';

import { parseEnv } from '@codeshen/config';

import { createAgentLogger } from './logger';
import {
  closeContextClients,
  callContextTool,
  contextText,
  createContextClients,
} from './mcp';
import { createAgentModel } from './model';
import {
  datasetSearchInput,
  getRepositoryScope,
  knowledgeReadInput,
  readKnowledgeBase,
  selectRetrievalPlan,
  searchDataset,
} from './retrieval';
import { buildAgentInstructions } from './prompt';
import type { AgentLogger, ChatRequest } from './types';

const DEFAULT_KNOWLEDGE_BASE_ID = 'kbeNb79lPHcq';

export type AgentDependencies = {
  createModel?: () => LanguageModel;
  createClients?: typeof createContextClients;
  logger?: AgentLogger;
  requestId?: string;
};

export async function streamRepositoryAnswer(
  request: ChatRequest,
  dependencies: AgentDependencies = {},
) {
  const requestId = dependencies.requestId ?? randomUUID();
  const logger =
    dependencies.logger ?? createAgentLogger(requestId, request.repositoryId);
  const env = parseEnv(process.env);
  const knowledgeBaseId =
    env.SANITY_KNOWLEDGE_BASE_ID ?? DEFAULT_KNOWLEDGE_BASE_ID;
  const startedAt = Date.now();
  const clients = await (dependencies.createClients ?? createContextClients)();
  let clientsClosed = false;
  const closeClients = async () => {
    if (clientsClosed) return;
    clientsClosed = true;
    await closeContextClients(clients, logger);
  };

  try {
    const scope = await getRepositoryScope(
      clients.dataset,
      request.repositoryId,
      logger,
    );
    const retrievalPlan = selectRetrievalPlan(request.message);
    const outline =
      retrievalPlan === 'dataset'
        ? ''
        : contextText(
            await callContextTool(
              clients.knowledgeBase,
              'initial_context',
              {},
              logger,
            ),
          );
    logger.info('agent_scope_ready', {
      repositoryId: scope.repositoryId,
      commitSha: scope.commitSha,
      retrievalPlan,
    });

    const result = streamText({
      model: (dependencies.createModel ?? createAgentModel)(),
      system: buildAgentInstructions(scope, outline),
      prompt: request.message,
      stopWhen: stepCountIs(5),
      activeTools:
        retrievalPlan === 'dataset'
          ? ['search_repository_dataset']
          : retrievalPlan === 'knowledge-base'
            ? ['read_repository_knowledge']
            : ['search_repository_dataset', 'read_repository_knowledge'],
      tools: {
        search_repository_dataset: tool({
          description:
            'Search only the selected repository in Dataset Context. Use for exact files, symbols, imports, relationships, and dependencies.',
          inputSchema: datasetSearchInput,
          execute: (input) =>
            searchDataset(clients.dataset, scope, input, logger),
        }),
        read_repository_knowledge: tool({
          description:
            'Read selected entries from the Knowledge Base. Use for architecture, implementation flows, setup, and generated documentation.',
          inputSchema: knowledgeReadInput,
          execute: (input) =>
            readKnowledgeBase(
              clients.knowledgeBase,
              knowledgeBaseId,
              scope,
              input,
              logger,
            ),
        }),
      },
      onError: ({ error }) => {
        logger.error('agent_failure', {
          latencyMs: Date.now() - startedAt,
          reason: error instanceof Error ? error.name : 'unknown error',
        });
        void closeClients();
      },
      onFinish: async ({ usage }) => {
        logger.info('agent_finished', {
          latencyMs: Date.now() - startedAt,
          inputTokens: usage.inputTokens,
          outputTokens: usage.outputTokens,
        });
        await closeClients();
      },
    });
    return result;
  } catch (error) {
    await closeClients();
    throw error;
  }
}

export { buildAgentInstructions } from './prompt';
export { codeShenEvaluationCases, evaluateAnswerEvidence } from './evaluation';
export {
  buildRepositoryQuery,
  datasetSearchInput,
  formatEvidenceCitations,
  knowledgeReadInput,
  scopeKnowledgeEntries,
  selectRetrievalPlan,
} from './retrieval';
export { chatRequestSchema } from './types';
