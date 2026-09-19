import { z } from 'zod';

export const chatRequestSchema = z.object({
  repositoryId: z
    .string()
    .regex(/^repository-[A-Za-z0-9_-]+$/, 'Invalid repository ID.'),
  message: z.string().trim().min(1).max(4000),
});

export type ChatRequest = z.infer<typeof chatRequestSchema>;

export type RepositoryScope = {
  repositoryId: string;
  fullName: string;
  commitSha: string;
};

export type AgentLogger = {
  info(event: string, fields?: Record<string, unknown>): void;
  error(event: string, fields?: Record<string, unknown>): void;
};
