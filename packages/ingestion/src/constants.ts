export const INGESTION_LIMITS = {
  maxFiles: 2_000,
  maxFileSize: 500 * 1024,
  maxTotalSourceContent: 50 * 1024 * 1024,
} as const;

export const SUPPORTED_EXTENSIONS = [
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.py',
  '.go',
  '.md',
  '.json',
  '.yaml',
  '.yml',
  '.sql',
] as const;

export const IGNORED_DIRECTORY_NAMES = new Set([
  '.git',
  'node_modules',
  'dist',
  'build',
  '.next',
  'coverage',
  'vendor',
]);

export const IGNORED_FILE_PATTERNS = [
  /^\.env(?:\.|$)/,
  /\.(?:pem|key|crt)$/i,
  /^credentials\./i,
  /^secrets\./i,
  /^service-account.*\.json$/i,
] as const;
