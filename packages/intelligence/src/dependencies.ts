import type { DependencyInfo } from './types';

const FRAMEWORKS = new Set([
  'next',
  'react',
  'express',
  'fastify',
  'nestjs',
  'django',
  'flask',
  'fastapi',
  'gin-gonic/gin',
]);

function addDependency(
  dependencies: DependencyInfo[],
  name: string,
  source: DependencyInfo['source'],
  kind: DependencyInfo['kind'],
) {
  if (
    !name ||
    dependencies.some(
      (dependency) => dependency.name === name && dependency.source === source,
    )
  )
    return;
  dependencies.push({
    name,
    source,
    kind: FRAMEWORKS.has(name) ? 'framework' : kind,
  });
}

export function detectDependencies(
  files: Array<{ path: string; content: string }>,
): DependencyInfo[] {
  const dependencies: DependencyInfo[] = [];
  const packageFile = files.find((file) => file.path === 'package.json');

  if (packageFile) {
    try {
      const packageJson: unknown = JSON.parse(packageFile.content);
      if (typeof packageJson === 'object' && packageJson !== null) {
        for (const section of ['dependencies', 'devDependencies'] as const) {
          const values = packageJson[section as keyof typeof packageJson];
          if (typeof values !== 'object' || values === null) continue;
          for (const name of Object.keys(values))
            addDependency(
              dependencies,
              name,
              'package.json',
              section === 'dependencies' ? 'dependency' : 'devDependency',
            );
        }
      }
    } catch {
      // Invalid manifests are left for a later analysis error/reporting stage.
    }
  }

  const requirements = files.find((file) => file.path === 'requirements.txt');
  if (requirements) {
    for (const line of requirements.content.split('\n')) {
      const name = line.trim().split(/[=<>!~]/)[0];
      if (name && !name.startsWith('#'))
        addDependency(dependencies, name, 'requirements.txt', 'dependency');
    }
  }

  const goMod = files.find((file) => file.path === 'go.mod');
  if (goMod) {
    for (const match of goMod.content.matchAll(/^\s*([\w./-]+)\s+v\S+/gm)) {
      addDependency(dependencies, match[1], 'go.mod', 'dependency');
    }
  }

  return dependencies;
}
