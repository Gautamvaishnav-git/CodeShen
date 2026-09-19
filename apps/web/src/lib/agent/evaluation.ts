export type AgentEvaluationCase = {
  category:
    | 'overview'
    | 'architecture'
    | 'file'
    | 'symbol'
    | 'dependency'
    | 'flow'
    | 'setup';
  question: string;
  expectedEvidence: string[];
};

export const codeShenEvaluationCases: AgentEvaluationCase[] = [
  {
    category: 'overview',
    question: 'Give me a short overview of this repository.',
    expectedEvidence: ['repository-overview.md'],
  },
  {
    category: 'architecture',
    question: 'Explain the architecture and major package boundaries.',
    expectedEvidence: ['architecture.md', 'packages/persistence/src'],
  },
  {
    category: 'file',
    question: 'Where is the analysis pipeline orchestrated?',
    expectedEvidence: ['apps/web/src/lib/analysis.ts'],
  },
  {
    category: 'symbol',
    question: 'Where is persistAnalysis defined?',
    expectedEvidence: ['packages/persistence/src/persist.ts'],
  },
  {
    category: 'dependency',
    question: 'Which module imports the persistence package?',
    expectedEvidence: ['apps/web/src/lib/analysis.ts', '@codeshen/persistence'],
  },
  {
    category: 'flow',
    question:
      'Trace a repository analysis from ingestion to Sanity persistence.',
    expectedEvidence: [
      'apps/web/src/lib/analysis.ts',
      'packages/ingestion/src/service.ts',
      'packages/persistence/src/persist.ts',
    ],
  },
  {
    category: 'setup',
    question: 'How do I start the web app and Sanity Studio locally?',
    expectedEvidence: ['package.json', 'apps/web/package.json'],
  },
];

export type EvaluationResult = {
  category: AgentEvaluationCase['category'];
  passed: boolean;
  missingEvidence: string[];
};

export function evaluateAnswerEvidence(
  evaluationCase: AgentEvaluationCase,
  answer: string,
): EvaluationResult {
  const normalized = answer.toLowerCase();
  const missingEvidence = evaluationCase.expectedEvidence.filter(
    (evidence) => !normalized.includes(evidence.toLowerCase()),
  );
  return {
    category: evaluationCase.category,
    passed: missingEvidence.length === 0,
    missingEvidence,
  };
}
