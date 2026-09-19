# AGENTS.md

## Project

- Build the Engineering Documentation Agent as a clean, modular TypeScript project.
- Treat Sanity as the structured content and agent-context layer; keep external infrastructure minimal.

## Git Workflow

- Initialize a Git repository before starting implementation.
- Commit changes regularly in small, logical commits.
- Keep each commit focused on one meaningful change.
- Do not rewrite or destroy Git history unless explicitly requested.

## Code Structure

- Follow a clear, predictable project structure.
- Keep modules focused on one responsibility.
- Reuse existing functions, classes, utilities, and types before creating new ones.
- Avoid duplicate logic.
- Do not add abstractions unless they solve a real, repeated problem.
- Keep business logic separate from UI, infrastructure, and external-service integrations.

## Code Quality

- Write ultra-clean, readable code.
- Prefer the simplest correct implementation.
- Do not write unnecessary code.
- Avoid unnecessary dependencies and abstractions.
- Keep control flow straightforward and avoid accidental complexity.
- Avoid magic numbers and magic strings; use named constants or configuration.
- Use strong TypeScript types; avoid `any` unless there is a justified reason.
- Handle errors explicitly and at the correct boundary.

## Comments

- Write comments only where they improve understanding.
- Keep comments short, simple, and factual.
- Prefer clear code over explanatory comments.
- Do not write verbose comments that restate the code.

## Changes

- Inspect existing code and patterns before modifying anything.
- Make the smallest complete change that solves the task.
- Do not modify unrelated files or behavior.
- Remove dead code introduced by a change.

## Validation

- Run the relevant formatter, linter, type checker, and tests after meaningful changes.
- Fix errors before considering the work complete.
