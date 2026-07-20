# Imperial AI Agent Hackathon Submission

## Agent Desk

Agent Desk is a paid task-spec compiler for autonomous agents. A buyer pays `0.001 SOL` on devnet to
turn ambiguous intent into a receipted `agent-work-contract/v1`: scoped deliverables, measurable
acceptance gates, evidence requirements, stop conditions, and a worker prompt.

**Customer:** agent teams and humans dispatching coding, grant, launch, or operations work.

**Why they pay:** a cheap specification step prevents a downstream agent from spending more compute,
tool budget, and time on the wrong outcome.

**The paid moment:** the buyer accepts a 402 quote only after code checks the service and price against
its budget. It signs a reference-bound Solana devnet transfer. The seller releases the work contract
only after the exact transaction signature, recipient, amount, and order reference verify on-chain.

## Judge Path

- Product: https://agent-desk-imperial.a13553776411.workers.dev
- Repository: https://github.com/nonggde/agent-desk-imperial
- Devnet proof: https://explorer.solana.com/tx/zX3pSjwTqCNxjXuxEiPCbUohU9uB5awZvALNUXXKUbh2RVsjVznnjMFBwvDD5tA3fJBW2bKAiHFCevDvUQUiuTT?cluster=devnet
- Evidence JSON: [`docs/evidence/agent-desk-devnet-run.json`](docs/evidence/agent-desk-devnet-run.json)
- One-command demo: `npm run demo:agent-desk`
- Tests: `cd examples/agent-economy/quickstart && npm ci && npm test`
- Pitch: [`docs/imperial-pitch.md`](docs/imperial-pitch.md)
- Demo script: [`docs/demo-video-script.md`](docs/demo-video-script.md)

The public console is an explicitly labelled replay of recorded evidence, not a simulated claim of a
new live payment. The one-command local path creates and verifies a fresh transaction when the test
buyer has devnet SOL.

## Technical Proof

1. Seller returns an HTTP 402 quote with price, recipient, and a unique Solana Pay reference.
2. Buyer rejects prices above `BUYER_MAX_SOL` before signing.
3. Buyer transfers devnet SOL and includes the order reference as a read-only account key.
4. Seller finds the reference transaction and requires it to equal the submitted proof signature.
5. `@solana/pay` validates recipient, amount, and reference at confirmed commitment.
6. Seller returns a typed work contract with four acceptance gates and a canonical SHA-256 receipt.
7. The CoralOS path extends one seller into competing agents with verifier-gated escrow release.

## Safety

- Devnet by default; mainnet RPCs are rejected unless deliberately overridden.
- `.env`, wallet keys, and generated wallet files are gitignored.
- Spend limits, payout binding, and verifier gates live in deterministic code, outside the LLM.
- Current status: hackathon proof of concept, not audited for production funds.

## Team

Solo builder: `nonggde`.

Built from the CoralOS starter kit with a new paid work-contract product, stricter signature proof,
focused tests, a judge-facing evidence console, and a reproducible deployment path.
