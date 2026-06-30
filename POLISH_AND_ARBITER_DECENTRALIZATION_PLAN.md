# Polish And Arbiter Language Plan

This tracks the two remaining judge-facing weaknesses after the CoralOS arbiter alignment work:

1. Some older docs/comments contain mojibake, mostly from copied arrows/dashes.
2. The arbiter is a single trusted keypair, so the repo language must not overclaim.

## Priority

| Priority | Issue | Why It Matters | Fix |
|---|---|---|---|
| P0 | Mojibake in docs/comments | It makes the repo look rushed even when the system is strong. | Normalize docs and comments to clean ASCII or valid UTF-8. |
| P1 | Centralized arbiter language | A sharp judge can challenge overbroad settlement claims. | Make language precise and consistent. |

## P0: Mojibake Cleanup

**Goal:** the repo should read cleanly in GitHub, terminals, and IDEs.

**Scope:**

- Markdown docs
- `coral-agent.toml` descriptions
- Source comments and log strings
- README snippets and diagrams

**Likely search patterns:**

```sh
rg -n "[^\\x00-\\x7F]" README.md LLM.md coral-agents examples/txodds packages scripts
```

**Rules:**

- Prefer ASCII in docs and comments unless a file is already intentionally Unicode-clean.
- Replace mojibake arrows with `->`.
- Replace mojibake em dashes with `-`.
- Replace curly quotes with straight quotes.
- Replace box drawing diagrams with fenced ASCII diagrams.
- Do not touch generated lockfiles or binary assets.

**Acceptance Criteria:**

- `rg -n "[^\\x00-\\x7F]" ...` returns no meaningful repo-authored docs/comments.
- Main READMEs render cleanly on GitHub.
- No behavior changes.
- Typechecks still pass.

## P1: Arbiter Language Tightening

**Current truth:** the arbiter makes settlement fairer between buyer and seller, but it is still a trusted
neutral keypair. The repo should say that directly.

**Approved language:**

- "arbiter-gated escrow"
- "buyer cannot unilaterally claw back after delivery"
- "trusted neutral arbiter"
- "trusted neutral arbiter"

**Avoid:**

- Any wording that implies arbitration has no trusted keypair.
- Any wording that implies the system has no trusted neutral party.
- Any wording that says both sides are fully protected without naming the arbiter trust assumption.

**Files to audit:**

- `README.md`
- `examples/txodds/README.md`
- `examples/txodds/coral/README.md`
- `examples/txodds/escrow/README.md`
- `examples/txodds/web/app.js`
- `coral-agents/**/*.md`
- `coral-agents/**/*.toml`

**Acceptance Criteria:**

- Every settlement claim is qualified.
- The trusted-arbiter assumption is visible before any judge reaches the contract section.
- README clearly says the arbiter is trusted/centralized in this demo.

## Recommended Path

1. Do P0 mojibake cleanup immediately.
2. Do P1 language tightening immediately.

## Verification Checklist

```sh
rg -n "[^\\x00-\\x7F]" README.md LLM.md coral-agents examples/txodds packages scripts
npm run typecheck --prefix packages/agent-runtime
npm run typecheck --prefix coral-agents/buyer-agent
npm run typecheck --prefix coral-agents/seller-agent
npm run typecheck --prefix examples/txodds
```

If only docs/comments change, tests are optional but typechecks should remain green.
