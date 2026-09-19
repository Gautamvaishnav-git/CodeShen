import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@codeshen/config'],
  serverExternalPackages: [
    '@codeshen/intelligence',
    '@codeshen/persistence',
    'tree-sitter',
    'tree-sitter-go',
    'tree-sitter-python',
    'tree-sitter-typescript',
  ],
};

export default nextConfig;
