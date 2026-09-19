import { randomUUID } from 'node:crypto';

import { NextResponse } from 'next/server';

import {
  streamRepositoryAnswer,
  chatRequestSchema,
} from '../../../lib/agent/agent';
import { createAgentLogger } from '../../../lib/agent/logger';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const requestId = randomUUID();
  const logger = createAgentLogger(requestId);

  try {
    const body: unknown = await request.json().catch(() => undefined);
    const parsed = chatRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid chat request.', requestId },
        { status: 400 },
      );
    }

    const scopedLogger = createAgentLogger(requestId, parsed.data.repositoryId);

    const result = await streamRepositoryAnswer(parsed.data, {
      logger: scopedLogger,
      requestId,
    });
    return result.toTextStreamResponse({
      headers: {
        'Cache-Control': 'no-cache',
        'X-Request-ID': requestId,
      },
    });
  } catch (error) {
    logger.error('chat_request_failed', {
      reason: error instanceof Error ? error.message : 'unknown error',
    });
    const message =
      error instanceof Error ? error.message : 'Chat request failed.';
    const status = message.includes('was not found')
      ? 404
      : message.includes('not ready')
        ? 409
        : 503;
    const publicMessage =
      status === 503 ? 'Chat service unavailable.' : message;
    return NextResponse.json({ error: publicMessage, requestId }, { status });
  }
}
