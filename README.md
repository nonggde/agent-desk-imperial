# Agent Desk

> A paid task-spec compiler for autonomous agents, settled and receipted on Solana.

[Proof console](https://agent-desk-imperial.a13553776411.workers.dev) ·
[Devnet settlement](https://explorer.solana.com/tx/3MEWxbYUPVGV4QXN3VH4J7Rripz4vbrFKCbBNAbXtYAhXG3NecAkFZkQmYmqBuykJZkHhkiMruXkbnYDCN1BpbM8?cluster=devnet) ·
[Submission notes](SUBMISSION.md) ·
[Five-slide pitch](docs/imperial-pitch.md)

Agent Desk lets an AI buyer purchase clarity before it purchases expensive work. The first paid skill,
`agent-desk-brief`, compiles an ambiguous goal into a machine-readable work contract containing:

- a normalized objective and task classification;
- named deliverables with explicit done states;
- four acceptance gates and the evidence required for each;
- risks, dependencies, and stop conditions;
- a copy-ready worker prompt; and
- a canonical SHA-256 delivery receipt.

The buyer receives an HTTP `402 Payment Required` quote, enforces a code-level budget, pays a
reference-bound Solana transfer on devnet, and retries with the transaction signature. The seller
validates the exact signature, recipient, amount, and reference before releasing the contract.

## Why an agent pays

Autonomous workers fail expensively when the request is vague: they produce the wrong artifact, claim
completion without proof, or discover a blocked credential after spending model and tool budget. Agent
Desk turns that ambiguity into an acceptance contract for `0.0001 SOL` before downstream execution.

The customer can be another agent, an orchestration service, or a human dispatching AI work. The first
market is teams running coding, grant, launch, and operations agents that need a common definition of
done.

## Run the proof

Requirements: Node 20+, a devnet-only buyer key, a seller public key, and a small amount of free devnet
SOL. No mainnet funds are required or expected.

```sh
git clone https://github.com/nonggde/agent-desk-imperial.git
cd agent-desk-imperial
npm run setup
```

Set the devnet RPC and the generated test identities in `.env`, then run one command:

```sh
npm run demo:agent-desk
```

That command cold-installs the quickstart dependencies, starts the seller, waits for its health check,
runs the autonomous buyer, and stops the seller. A successful run prints:

```text
402 challenge
  -> budget policy pass
  -> reference-bound devnet transfer
  -> on-chain signature verification
  -> agent-work-contract/v1 delivery
  -> canonical SHA-256 receipt
```

Use `DRY_RUN=1 npm run demo:agent-desk` to inspect the quote without signing a transaction.

## What is verifiable

| Claim | Evidence |
| --- | --- |
| A buyer cannot silently overspend | `BUYER_MAX_SOL` is enforced before a transaction is constructed |
| A payment belongs to one order | each quote contains a unique Solana Pay reference account |
| A random signature cannot unlock delivery | the supplied proof must equal the signature found for that reference |
| The recipient and amount are correct | `@solana/pay` validates both against the confirmed transaction |
| The delivered scope is stable | normalized contract content is covered by a canonical SHA-256 digest |
| Mainnet is not accidental | both buyer and seller reject a mainnet RPC unless explicitly overridden |

Focused checks:

```sh
cd examples/agent-economy/quickstart
npm ci
npm run typecheck
npm test
```

The proof console is a static, inspectable replay of a recorded devnet run. It is deliberately labelled
as a replay and never pretends to create a transaction in the browser.

## Economic loop

```text
BUYER GOAL
   |
   v
BUDGET POLICY -> reject if price exceeds cap
   |
   v
402 QUOTE -> unique order reference
   |
   v
SOLANA DEVNET PAYMENT -> recipient + amount + reference validated
   |
   v
WORK CONTRACT -> deliverables + acceptance gates + evidence rules
   |
   v
RECEIPT / VERIFIER -> release permitted or failure remains auditable
```

The repository also retains the full CoralOS competitive-market path:

```text
WANT -> BID -> AWARD -> DEPOSITED -> DELIVERED -> VERIFIED -> RELEASED
```

That path adds competing seller personas, a neutral verifier, escrow release/refund, a run ledger, and
reputation. The HTTP 402 quickstart is the judge-friendly proof; CoralOS is the expansion path from one
seller to a graph of agents.

## Repository map

| Path | Purpose |
| --- | --- |
| `examples/agent-economy/quickstart` | paid skill seller, guarded buyer, payment verifier, tests, one-command demo |
| `examples/agent-economy/web` | public Agent Desk proof console |
| `packages/agent-runtime` | CoralOS, market protocol, policy, ledger, LLM, and Solana primitives |
| `packages/harness-runtime` | adapters for prompt, Claude Code, and arbitrary CLI sellers |
| `coral-agents` | buyer, seller, broker, and independent verifier agents |
| `examples/txodds/escrow` | deployed devnet escrow and neutral arbiter programs |

## Safety boundaries

- Devnet is the default and mainnet is rejected unless `ALLOW_MAINNET=1` is deliberately set.
- Secrets remain in local `.env`; wallet material is ignored by git.
- The LLM may propose a bid or delivery, but code controls spend, payout identity, and release gates.
- Payment references are one-use in the quickstart process.
- This is a hackathon proof of concept, not an audited production payment service.

## Build the console

```sh
cd examples/agent-economy/web
npm ci
npm run build
```

The production build is a static `dist/` directory and can be deployed to any static host.

## Attribution

Agent Desk is an Imperial AI Agent Hackathon fork of
[`trilltino/solana_coralOS`](https://github.com/trilltino/solana_coralOS). It keeps the starter runtime,
Solana payment rails, CoralOS coordination, and escrow foundations, then adds the paid work-contract
skill, signature-bound proof gate, product console, focused tests, and submission evidence.

MIT licensed. Devnet only.
