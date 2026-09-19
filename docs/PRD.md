# CodeShen — Product Requirements Document

## 1. Product

**Name:** CodeShen

**One-line description:**  
AI-powered engineering documentation agent that turns a public GitHub repository into structured engineering knowledge and lets developers understand it through grounded natural-language questions.

---

## 2. Problem

Developers lose substantial time understanding unfamiliar repositories.

Typical questions require navigating multiple files and relationships:

- Where is authentication implemented?
- What happens when an API endpoint is called?
- Which services depend on Redis?
- Where is the database connection created?
- How does a file upload flow work?
- How do I run the project locally?
- Which files are involved in a particular feature?

Traditional documentation may be incomplete or outdated. Generic RAG systems often retrieve text without understanding the relationships between modules, symbols, services, and infrastructure.

CodeShen should create repository-specific engineering knowledge from the source itself and use that knowledge to answer questions with evidence.

---

## 3. Product Goals

### Primary goals

1. Accept a public GitHub repository URL.
2. Analyze repository structure and source code.
3. Extract useful engineering entities and relationships.
4. Store structured repository knowledge in Sanity.
5. Build searchable repository documentation/knowledge.
6. Provide an AI agent that answers engineering questions using repository evidence.
7. Show source file and line references for important claims.
8. Provide a visual representation of repository architecture.

### Secondary goals

- Make onboarding to an unfamiliar codebase faster.
- Explain implementation and data flows in plain language.
- Create useful generated engineering documentation automatically.

---

## 4. Non-Goals for MVP

- Private repository access.
- Writing or modifying user repository code.
- Executing repository code.
- Running arbitrary build scripts from analyzed repositories.
- IDE plugins.
- Real-time repository synchronization.
- Complete language/framework coverage.
- Autonomous software development.
- Full static-analysis coverage equivalent to a compiler or IDE.

---

## 5. Target Users

- Developers onboarding to unfamiliar repositories.
- Open-source contributors.
- Engineers debugging existing systems.
- Developers reviewing architecture.
- Technical leads exploring software systems.
- Engineers maintaining large or legacy projects.

---

## 6. Core User Flow

```text
User
  ↓
Enter public GitHub repository URL
  ↓
Validate repository
  ↓
Analyze repository
  ↓
Extract code intelligence
  ↓
Generate repository knowledge
  ↓
Store structured content in Sanity
  ↓
Build / update Knowledge Base
  ↓
Repository becomes Ready
  ↓
User asks engineering questions
  ↓
AI agent retrieves repository context
  ↓
Grounded answer + source evidence
```

---

# 7. Product Capabilities

## 7.1 Repository Ingestion

Input:

```text
https://github.com/<owner>/<repository>
```

The system must:

- Validate the URL.
- Confirm the repository exists.
- Confirm it is public.
- Detect the default branch.
- Resolve a specific commit SHA.
- Fetch the repository tree.
- Filter supported files.
- Fetch supported file contents.
- Track analysis progress.

The analysis must be pinned to a commit SHA so that generated knowledge is reproducible.

---

## 7.2 Repository Analysis

Initial supported languages:

- TypeScript
- JavaScript
- Python
- Go

The analyzer should identify:

- Files.
- Directories.
- Programming languages.
- Frameworks.
- Important dependencies.
- Functions.
- Classes.
- Interfaces.
- Variables where useful.
- Exports.
- Imports.
- API routes.
- Entry points.
- Configuration files.
- Infrastructure files.
- Documentation files.

---

## 7.3 Relationship Extraction

Relationships are a core product feature.

Initial relationship types:

- imports
- calls
- extends
- implements
- depends_on
- defines_route
- contains
- reads_from
- writes_to
- publishes_to
- consumes_from

Relationships should include evidence and confidence where applicable.

Example:

```text
POST /users
    ↓
UserController.create()
    ↓
UserService.create()
    ↓
UserRepository.insert()
    ↓
PostgreSQL
```

---

## 7.4 Architecture Understanding

CodeShen should produce a repository-level architecture summary from deterministic analysis plus LLM enrichment.

Possible architectural concepts:

- Applications.
- Services.
- Modules.
- APIs.
- Databases.
- Queues.
- Caches.
- External services.
- Storage.
- Workers.

The system must distinguish verified source-derived facts from inferred architectural descriptions.

---

## 7.5 Knowledge Generation

Generate repository-specific engineering documents.

Minimum set:

```text
Repository Overview
Architecture
Directory Structure
Setup / Local Development
Environment Configuration
API Overview
Important Modules
Service Dependencies
Database / Storage Overview
Feature / Flow Summaries
```

Generated documentation should include source evidence.

Example:

```markdown
# Authentication Flow

Authentication begins in `src/auth/auth.controller.ts`.

1. Request enters `AuthController.register()`.
2. Credentials are validated by `AuthService`.
3. User data is stored through `UserRepository`.
4. A token is created and returned.

Evidence:

- src/auth/auth.controller.ts:12-45
- src/auth/auth.service.ts:20-78
- src/users/user.repository.ts:8-32
```

---

# 8. AI Agent

## 8.1 Agent Purpose

The agent is a repository-specific engineering assistant.

It must answer using available repository knowledge and avoid inventing unsupported facts.

### Agent rules

1. Prefer verified repository evidence.
2. Never invent files, symbols, dependencies, or flows.
3. Distinguish facts from inference.
4. Cite relevant files and line ranges.
5. State when evidence is insufficient.
6. Prefer repository relationships over keyword similarity.
7. Do not answer unrelated questions as though they are repository facts.

---

## 8.2 Example Questions

```text
Explain the architecture of this project.

Where is authentication implemented?

Trace the request flow for user registration.

Which modules depend on Redis?

Where is the database connection created?

How does file upload work?

How do I run this project locally?

What would I need to change to replace Redis?
```

---

# 9. Technical Architecture

```text
                           ┌───────────────────┐
                           │      Next.js      │
                           │   Web Application │
                           └─────────┬─────────┘
                                     │
                         Repository / Chat APIs
                                     │
                                     ▼
                        ┌───────────────────────┐
                        │ Application Services  │
                        │                       │
                        │ GitHub Service        │
                        │ Analysis Service      │
                        │ Knowledge Service     │
                        │ Agent Service          │
                        └───────────┬───────────┘
                                    │
                 ┌──────────────────┼──────────────────┐
                 │                  │                  │
                 ▼                  ▼                  ▼
          GitHub API          Code Analyzer         LLM
          / Octokit           Tree-sitter       Gemini/Claude
                 │                  │
                 └──────────┬───────┘
                            ▼
                    Structured Knowledge
                            │
                   ┌────────┴────────┐
                   ▼                 ▼
             Sanity Dataset      Knowledge Base
                   │                 │
                   ▼                 ▼
             Context MCP #1     Context MCP #2
                   │                 │
                   └────────┬────────┘
                            ▼
                         AI Agent
```

### Architecture principles

- Sanity is the structured content and knowledge layer.
- Our application owns GitHub ingestion and code analysis.
- LLMs enrich and explain extracted facts; they do not replace deterministic analysis.
- Repository code must never be executed during ingestion.
- Raw repository content should not be unnecessarily duplicated.

---

# 10. Technology Stack

## Frontend

- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui

## Backend

- Next.js Route Handlers / server-side application services
- TypeScript
- Zod for input validation

## GitHub

- GitHub REST API
- Octokit

## Code Analysis

- Tree-sitter
- Language-specific Tree-sitter grammars

## AI

- Vercel AI SDK
- Gemini or Claude
- Sanity Context MCP

## Content / Knowledge

- Sanity Studio
- Sanity Content Lake
- Sanity Knowledge Bases
- Sanity Context MCP

## Deployment

- Vercel

## Optional infrastructure

Only introduce when required by scale:

- Redis + BullMQ for long-running analysis jobs.
- Object storage for large raw repository snapshots.
- Langfuse for observability.

The MVP should avoid these unless implementation requirements make them necessary.

---

# 11. Sanity Content Model

## Repository

```typescript
{
  _type: "repository",
  githubId,
  owner,
  name,
  fullName,
  githubUrl,
  defaultBranch,
  commitSha,
  description,
  languages[],
  frameworks[],
  status,
  analyzedAt
}
```

## Code File

```typescript
{
  _type: ('codeFile',
    repository,
    path,
    language,
    size,
    sha,
    summary,
    content,
    sourceUrl);
}
```

## Code Symbol

```typescript
{
  _type: ('codeSymbol',
    repository,
    file,
    name,
    kind,
    signature,
    startLine,
    endLine,
    exported,
    summary);
}
```

## Code Relationship

```typescript
{
  _type: ('codeRelationship',
    repository,
    source,
    target,
    type,
    confidence,
    evidence);
}
```

## Architecture Overview

```typescript
{
  _type: "architectureOverview",
  repository,
  title,
  summary,
  components[],
  dataFlows,
  setupInstructions,
  limitations
}
```

Schema design must favor meaningful engineering entities and relationships over one document per token or line.

---

# 12. Knowledge Base Strategy

Use Sanity's two retrieval capabilities deliberately.

### Structured dataset

Use for:

- Repository metadata.
- Files.
- Symbols.
- Relationships.
- Architecture entities.
- Exact structured queries.

### Knowledge Base

Use for:

- Generated engineering documentation.
- Source-derived prose.
- Setup guides.
- Architecture explanations.
- Module explanations.
- Documentation spread across multiple sources.

Sanity Context has two retrieval modes: GROQ mode for live structured datasets and Knowledge Base mode for pre-built indexed material. A Context MCP endpoint containing a dataset source ignores Knowledge Base sources, so the implementation should use separate endpoints when both are required. citeturn650471search0turn650471search2

Knowledge Bases are currently opt-in early access/beta and their limits may change. citeturn650471search1turn650471search5

---

# 13. Context MCP Configuration

Create two Context MCP endpoints.

## Endpoint A — CodeShen Dataset

Purpose:

- Repository metadata.
- Code entities.
- Relationships.
- Structured queries.

Mode:

```text
GROQ
```

Source:

```text
<projectId>.<datasetName>
```

## Endpoint B — CodeShen Knowledge

Purpose:

- Generated documentation.
- Repository knowledge entries.

Mode:

```text
Knowledge Base
```

Source:

```text
<knowledge-base-id>
```

Context MCP is read-only and uses an organization API token with Context Viewer permission. Keep this token server-side. citeturn577915search2turn577915search3

---

# 14. API Contract

## Analyze repository

```http
POST /api/repositories/analyze
```

Request:

```json
{
  "url": "https://github.com/owner/repository"
}
```

Response:

```json
{
  "analysisId": "analysis_123",
  "status": "queued"
}
```

## Analysis status

```http
GET /api/analyses/:id
```

Response:

```json
{
  "status": "analyzing",
  "progress": 65,
  "filesProcessed": 130,
  "totalFiles": 200
}
```

## Chat

```http
POST /api/chat
```

Request:

```json
{
  "repositoryId": "repository_123",
  "message": "Explain the authentication flow"
}
```

## Architecture graph

```http
GET /api/repositories/:id/graph
```

Response:

```json
{
  "nodes": [],
  "edges": []
}
```

---

# 15. UI Requirements

## Repository Landing

Allow the user to:

- Enter a public GitHub URL.
- Start analysis.
- See validation errors.

## Analysis Progress

Show:

- Current status.
- Files processed.
- Total files.
- Current analysis phase.
- Errors if analysis fails.

## Repository Dashboard

Show:

- Repository name.
- Commit analyzed.
- Languages.
- Frameworks.
- Architecture summary.
- Important modules.
- Analysis metadata.

## AI Chat

Must support:

- Natural-language questions.
- Streaming responses.
- Source citations.
- Links to GitHub source locations.
- Clear indication when an answer is inferred.

## Architecture Explorer

Show:

- Components.
- Dependencies.
- Services.
- Data stores.
- Directional relationships.

Clicking an entity should allow navigation to its source or explanation.

## Source Explorer

Show:

- File path.
- Relevant source content.
- Symbol metadata.
- GitHub link.
- Line range.

---

# 16. Repository Safety

Repository content is untrusted input.

The system must:

- Never execute repository code.
- Never run package installation scripts from analyzed repositories.
- Never execute arbitrary Dockerfiles.
- Ignore `.env` files containing secrets.
- Ignore private keys and credential files.
- Redact obvious credentials before indexing.
- Enforce repository and file size limits.
- Validate all external URLs.
- Prevent SSRF through repository URL handling.
- Keep secrets out of client-side code.

Initial application limits:

```text
Maximum files: 2,000
Maximum file size: 500 KB
Maximum total source content: 50 MB
```

These limits are application-level defaults and may be adjusted after testing.

---

# 17. Repository Filtering

Initially include:

```text
.ts
.tsx
.js
.jsx
.py
.go
.md
.json
.yaml
.yml
.sql
```

Ignore:

```text
.git/
node_modules/
dist/
build/
.next/
coverage/
vendor/
```

Also ignore:

```text
.env
.env.*
*.pem
*.key
*.crt
credentials.*
secrets.*
service-account*.json
```

The filtering system should be configurable rather than hard-coded throughout the application.

---

# 18. Code Analysis Rules

Use deterministic parsing before LLM enrichment.

### Deterministic phase

Extract:

- Syntax structures.
- Symbols.
- Imports.
- Exports.
- Routes.
- File relationships.
- Configuration.
- Dependencies.

### LLM enrichment phase

Generate:

- File summaries.
- Module summaries.
- Architecture explanation.
- Data-flow explanations.
- Setup documentation.
- Higher-level engineering descriptions.

The LLM must receive extracted facts and source evidence rather than being asked to infer the entire repository from an unconstrained prompt.

---

# 19. Source Evidence Model

Every important generated claim should be traceable to source evidence.

Evidence should contain:

```typescript
{
  filePath: string,
  startLine: number,
  endLine: number,
  commitSha: string,
  sourceUrl: string
}
```

Example GitHub URL:

```text
https://github.com/owner/repo/blob/<commitSha>/src/auth/service.ts#L20-L78
```

Use commit-pinned URLs where possible.

---

# 20. Analysis Pipeline

```text
1. Parse GitHub URL
2. Validate public repository
3. Resolve default branch
4. Resolve commit SHA
5. Fetch repository tree
6. Filter files
7. Fetch file contents
8. Detect languages/frameworks
9. Parse source with Tree-sitter
10. Extract symbols
11. Resolve imports
12. Build relationships
13. Detect architectural components
14. Generate structured Sanity documents
15. Generate engineering documentation
16. Populate Knowledge Base
17. Mark repository ready
```

Failures must be isolated by stage and persisted with useful error information.

---

# 21. Data Consistency

Every analysis is associated with:

```text
repositoryId
commitSha
analysisId
```

A new repository analysis must not silently mix entities from different commits.

Re-analysis should produce a new analysis state and replace or version the repository's active knowledge deliberately.

---

# 22. Git Workflow

The repository must start as a Git repository.

Required practices:

- Initialize Git before implementation.
- Commit meaningful changes regularly.
- Use focused commits.
- Keep commit messages descriptive.
- Do not commit secrets.
- Do not commit generated repository snapshots.
- Keep the working tree clean at meaningful milestones.

These rules are also defined in `AGENTS.md`.

---

# 23. Codex Development Environment

## Required Codex permissions

For autonomous local development:

- Workspace write access.
- Command execution.
- Internet access sufficient for package installation, GitHub API access, and Sanity development.
- Approval policy configured so routine operations do not pause for manual confirmation.

Codex supports workspace-scoped configuration and MCP configuration through `config.toml`; its standard workspace-write mode allows file edits and routine commands, while approval settings determine when it pauses for approval. citeturn423886search0turn423886search9

Do not grant unrestricted host access unless necessary.

---

# 24. MCP / External Access Required for Codex

## A. GitHub MCP — REQUIRED for autonomous GitHub operations

Use GitHub's official remote MCP server:

```text
https://api.githubcopilot.com/mcp/
```

Codex can authenticate with OAuth or a GitHub PAT. GitHub recommends least-privilege scopes. citeturn430180search0turn430180search1

For CodeShen development:

### Minimum

- Repository read access.
- Repository write access if Codex must push commits or branches.

### Optional

- `workflow` only if Codex will manage GitHub Actions.
- `read:org` only if organization resources are required.

GitHub's MCP server also supports read-only and toolset restrictions, so unnecessary capabilities should be disabled. citeturn430180search4

## B. Sanity MCP — REQUIRED for autonomous Sanity setup

Use Sanity's write-capable MCP server:

```text
https://mcp.sanity.io
```

It allows an agent to work with Sanity projects, query content, manage schema-related work, and perform document operations. Authentication supports OAuth or token-based access. citeturn577915search0turn577915search1

For this project, give Codex access to the CodeShen Sanity project with the minimum project permissions required for:

- Schema management.
- Dataset management.
- Document creation/update.
- Configuration required during setup.

Prefer OAuth during local development.

## C. Sanity Context MCP — REQUIRED by the application, NOT as the primary write tool for Codex

The deployed CodeShen agent uses Context MCP for read-only repository knowledge.

Requirements:

- Context enabled for the organization.
- Organization API token with Context Viewer permission.
- Dataset Context endpoint.
- Knowledge Base Context endpoint.

Sanity explicitly requires an organization-level Context Viewer token; a project token is not accepted. citeturn577915search2

## D. Vercel — OPTIONAL for autonomous deployment

No Vercel MCP is required.

Codex can deploy through the Vercel CLI when credentials and project configuration are available. Environment variables should remain in Vercel rather than source control. citeturn345635search0turn345635search5

---

# 25. Credentials / Environment Variables

Expected runtime configuration should include names similar to:

```text
GITHUB_TOKEN
SANITY_PROJECT_ID
SANITY_DATASET
SANITY_API_VERSION
SANITY_WRITE_TOKEN
SANITY_ORGANIZATION_TOKEN
SANITY_CONTEXT_DATASET_URL
SANITY_CONTEXT_KB_URL

AI_PROVIDER_API_KEY
```

Optional deployment variables may be added later.

Secrets must:

- Exist only in environment configuration.
- Never be committed.
- Never be sent to the browser.
- Never appear in logs.

---

# 26. Development Setup Order

Codex should follow this order:

```text
1. Initialize Git
2. Read AGENTS.md
3. Read PROJECT-OVERVIEW.md
4. Create repository structure
5. Set up Next.js application
6. Set up Sanity Studio
7. Configure schemas
8. Validate Sanity connection
9. Implement GitHub ingestion
10. Implement code analysis
11. Persist structured knowledge
12. Generate documentation
13. Configure Knowledge Base
14. Connect Context MCP
15. Implement AI agent
16. Implement repository UI
17. Implement architecture graph
18. Add tests
19. Add validation / security checks
20. Deploy
```

Do not start with the UI before the ingestion and knowledge model are stable.

---

# 27. Testing Strategy

## Unit tests

Test:

- GitHub URL parsing.
- Repository validation.
- File filtering.
- Language detection.
- AST extraction.
- Import resolution.
- Relationship creation.
- Evidence generation.

## Integration tests

Test:

- GitHub API ingestion.
- Sanity writes.
- Sanity queries.
- Context MCP connection.
- Agent retrieval.
- End-to-end analysis.

## Evaluation tests

Create a fixed question set for each test repository.

For each question, define expected source evidence.

Example:

```text
Question:
Where is authentication implemented?

Expected:
src/auth/auth.controller.ts
src/auth/auth.service.ts
```

The agent should be evaluated for:

- Retrieval correctness.
- Evidence correctness.
- Hallucination rate.
- Relationship accuracy.

---

# 28. Acceptance Criteria

The MVP is complete when:

### Repository ingestion

- User can submit a valid public GitHub repository.
- Repository metadata is detected correctly.
- Repository analysis is pinned to a commit SHA.
- Supported files are analyzed without executing repository code.

### Code intelligence

- Symbols are extracted.
- Imports are extracted.
- Relationships are created.
- Languages/frameworks are detected.
- Architecture summary is generated.

### Sanity

- Structured entities exist in Sanity.
- Knowledge documents are available.
- Context MCP can read the repository knowledge.
- Repository-specific scoping works correctly.

### Agent

- User can ask engineering questions.
- Answers use repository knowledge.
- Answers cite source evidence.
- Unsupported claims are clearly identified.
- Agent can answer architecture and code-flow questions.

### UI

- Repository analysis progress is visible.
- Repository dashboard is available.
- Chat is functional.
- Architecture graph is functional.
- Source evidence is navigable.

### Quality

- No secrets are committed.
- Relevant automated tests pass.
- Type checking passes.
- Linting passes.
- Production build succeeds.

---

# 29. Initial Demo Repository

Use a medium-sized open-source TypeScript repository with multiple modules and meaningful architectural relationships.

The first demo repository should contain enough complexity to demonstrate:

- APIs.
- Services/modules.
- Database or persistence.
- External dependencies.
- Meaningful import relationships.

Avoid extremely large monorepos during initial development.

---

# 30. Future Scope

Potential future versions:

- Private repository support.
- GitHub App integration.
- Repository synchronization.
- Pull-request understanding.
- Change-impact analysis.
- Architecture drift detection.
- Multi-repository/system analysis.
- IDE integration.
- Code-review assistant.
- Documentation freshness monitoring.

---

# 31. Definition of Done

CodeShen should feel like a developer has gained an engineer who has already read the repository.

The system succeeds when a developer can provide an unfamiliar public repository and, without manually reading hundreds of files, understand:

```text
What this project is
        ↓
How it is structured
        ↓
How its components interact
        ↓
Where important behavior is implemented
        ↓
How important flows work
        ↓
Where to look next
```

The product should prioritize **grounded engineering understanding over generic AI conversation**.
