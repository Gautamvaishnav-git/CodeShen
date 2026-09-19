import type { AgentLogger } from './types';

export function createAgentLogger(
  requestId: string,
  repositoryId?: string,
): AgentLogger {
  const write = (
    level: 'info' | 'error',
    event: string,
    fields?: Record<string, unknown>,
  ) => {
    console[level](
      JSON.stringify({ requestId, repositoryId, event, ...fields }),
    );
  };

  return {
    info: (event, fields) => write('info', event, fields),
    error: (event, fields) => write('error', event, fields),
  };
}
