# CodeShen Knowledge Base

The CodeShen Knowledge Base is backed by Sanity project `yh46v8u1`, dataset
`production`, and public Knowledge Base ID `kbeNb79lPHcq`.

## Source configuration

The dataset source is intentionally limited to generated knowledge documents:

```groq
*[_type == "knowledgeDocument"]
```

The source is configured with the Sanity CLI:

```sh
sanity context imports create kbeNb79lPHcq \
  --query '*[_type == "knowledgeDocument"]' \
  --sanity-project yh46v8u1 \
  --sanity-dataset production
sanity context build kbeNb79lPHcq --watch
```

Run these commands from a Sanity-authenticated environment. Re-running the
import should first remove or replace the existing dataset source in the
Context app; a single source is sufficient for this project.

## Context endpoints

The server-side environment config contains:

- `SANITY_CONTEXT_DATASET_URL` for live dataset GROQ access.
- `SANITY_CONTEXT_KB_URL` for Knowledge Base retrieval.
- `SANITY_ORGANIZATION_TOKEN` for server-side Context MCP authorization.

Never expose `SANITY_ORGANIZATION_TOKEN`, `SANITY_WRITE_TOKEN`, or
`SANITY_API_TOKEN` to browser code. The Knowledge Base endpoint should serve
only the `kbeNb79lPHcq` source.

## Generated documents

Each analyzed repository commit writes three deterministic records:

- `repository-overview.md`
- `architecture.md`
- `source-evidence.md`

Their Sanity IDs are scoped by repository, commit SHA, and document type, so a
repeat analysis replaces the same records. Evidence includes source paths,
line ranges, commit SHA, and commit-pinned GitHub URLs.
