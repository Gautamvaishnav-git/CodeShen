import { appName } from '@codeshen/config';

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-4 px-6">
      <p className="text-sm font-medium text-slate-500">Foundation workspace</p>
      <h1 className="text-4xl font-semibold tracking-tight">{appName}</h1>
      <p className="max-w-xl text-lg text-slate-600">
        An engineering documentation agent for understanding public GitHub
        repositories.
      </p>
    </main>
  );
}
