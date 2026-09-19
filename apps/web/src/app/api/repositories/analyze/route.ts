import { NextResponse } from 'next/server';
import { z } from 'zod';

import { parsePublicRepositoryUrl } from '@codeshen/ingestion';

import {
  analysisState,
  createIngestionService,
} from '../../../../lib/analysis';

const requestSchema = z.object({ url: z.string().trim().min(1) });

export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  const parsedBody = requestSchema.safeParse(body);

  if (!parsedBody.success) {
    return NextResponse.json(
      { error: 'Request body must include a repository URL.' },
      { status: 400 },
    );
  }

  try {
    const reference = parsePublicRepositoryUrl(parsedBody.data.url);
    const analysis = analysisState.create(reference.url);

    void createIngestionService()
      .ingest(reference.url, (progress) =>
        analysisState.update(analysis.id, progress),
      )
      .catch((error: unknown) => analysisState.markFailed(analysis.id, error));

    return NextResponse.json(
      { analysisId: analysis.id, status: analysis.status },
      { status: 202 },
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Unable to start repository analysis.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
