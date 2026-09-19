import { randomUUID } from 'node:crypto';

import type { AnalysisProgress, AnalysisStatus } from './types';

export type AnalysisRecord = AnalysisProgress & {
  id: string;
  repositoryUrl: string;
  createdAt: string;
  updatedAt: string;
};

export class AnalysisStateStore {
  private readonly records = new Map<string, AnalysisRecord>();

  create(repositoryUrl: string): AnalysisRecord {
    const now = new Date().toISOString();
    const record: AnalysisRecord = {
      id: `analysis_${randomUUID()}`,
      repositoryUrl,
      status: 'queued',
      phase: 'validating',
      progress: 0,
      filesProcessed: 0,
      totalFiles: 0,
      createdAt: now,
      updatedAt: now,
    };

    this.records.set(record.id, record);
    return record;
  }

  update(
    id: string,
    update: Partial<AnalysisProgress>,
  ): AnalysisRecord | undefined {
    const record = this.records.get(id);
    if (!record) return undefined;

    const next = { ...record, ...update, updatedAt: new Date().toISOString() };
    this.records.set(id, next);
    return next;
  }

  get(id: string): AnalysisRecord | undefined {
    return this.records.get(id);
  }

  markFailed(id: string, error: unknown): AnalysisRecord | undefined {
    const message =
      error instanceof Error ? error.message : 'Repository analysis failed.';
    return this.update(id, {
      status: 'failed' satisfies AnalysisStatus,
      error: message,
    });
  }
}
