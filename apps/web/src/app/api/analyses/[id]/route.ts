import { NextResponse } from 'next/server';

import { analysisState } from '../../../../lib/analysis';

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const analysis = analysisState.get(id);

  if (!analysis) {
    return NextResponse.json({ error: 'Analysis not found.' }, { status: 404 });
  }

  return NextResponse.json(analysis);
}
