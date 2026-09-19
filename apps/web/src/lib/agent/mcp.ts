import {
  createMCPClient,
  type CallToolResult,
  type MCPClient,
} from '@ai-sdk/mcp';

import { parseEnv } from '@codeshen/config';

import type { AgentLogger } from './types';

export type ContextClients = {
  dataset: MCPClient;
  knowledgeBase: MCPClient;
};

export async function createContextClients(
  input: Record<string, string | undefined> = process.env,
): Promise<ContextClients> {
  const env = parseEnv(input);
  if (!env.SANITY_CONTEXT_DATASET_URL || !env.SANITY_CONTEXT_KB_URL) {
    throw new Error(
      'SANITY_CONTEXT_DATASET_URL and SANITY_CONTEXT_KB_URL are required for chat.',
    );
  }
  if (!env.SANITY_ORGANIZATION_TOKEN) {
    throw new Error('SANITY_ORGANIZATION_TOKEN is required for chat.');
  }

  const headers = { Authorization: `Bearer ${env.SANITY_ORGANIZATION_TOKEN}` };
  let dataset: MCPClient | undefined;
  try {
    dataset = await createMCPClient({
      clientName: 'codeshen-dataset-agent',
      transport: { type: 'http', url: env.SANITY_CONTEXT_DATASET_URL, headers },
    });
    const knowledgeBase = await createMCPClient({
      clientName: 'codeshen-knowledge-agent',
      transport: { type: 'http', url: env.SANITY_CONTEXT_KB_URL, headers },
    });
    return { dataset, knowledgeBase };
  } catch {
    if (dataset) await dataset.close().catch(() => undefined);
    throw new Error('Context MCP unavailable.');
  }
}

export async function closeContextClients(
  clients: ContextClients,
  logger: AgentLogger,
): Promise<void> {
  await Promise.allSettled([
    clients.dataset.close(),
    clients.knowledgeBase.close(),
  ]);
  logger.info('mcp_closed');
}

export async function callContextTool(
  client: MCPClient,
  name: string,
  args: Record<string, unknown>,
  logger: AgentLogger,
): Promise<CallToolResult> {
  const startedAt = Date.now();
  logger.info('mcp_tool_call', { tool: name });
  try {
    const result = await client.callTool({ name, arguments: args });
    if (result.isError) {
      throw new Error(`Context MCP returned an error for ${name}.`);
    }
    logger.info('mcp_tool_result', {
      tool: name,
      latencyMs: Date.now() - startedAt,
    });
    return result;
  } catch (error) {
    logger.error('mcp_tool_failure', {
      tool: name,
      latencyMs: Date.now() - startedAt,
      reason: error instanceof Error ? error.name : 'unknown error',
    });
    throw new Error(`MCP tool ${name} failed.`);
  }
}

export function contextText(result: CallToolResult): string {
  if (!Array.isArray(result.content)) return '';
  return result.content
    .flatMap((item: unknown) => {
      if (
        typeof item === 'object' &&
        item !== null &&
        'type' in item &&
        'text' in item &&
        item.type === 'text' &&
        typeof item.text === 'string'
      ) {
        return [item.text];
      }
      return [];
    })
    .join('\n');
}

export function contextDocuments(text: string): Record<string, unknown>[] {
  const documentBlocks = [
    ...text.matchAll(/<documents>([\s\S]*?)<\/documents>/g),
  ].flatMap((match) => {
    try {
      const parsed: unknown = JSON.parse(match[1] ?? '');
      return isRecord(parsed) ? [parsed] : [];
    } catch {
      return [];
    }
  });
  if (documentBlocks.length > 0) return documentBlocks;

  try {
    const parsed: unknown = JSON.parse(text);
    if (Array.isArray(parsed)) {
      return parsed.filter(isRecord);
    }
    if (isRecord(parsed)) {
      if (Array.isArray(parsed.result)) {
        return parsed.result.filter(isRecord);
      }
      if (isRecord(parsed.result)) {
        return [parsed.result];
      }
      if (Array.isArray(parsed.documents)) {
        return parsed.documents.filter(isRecord);
      }
    }
  } catch {
    return [];
  }
  return [];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
