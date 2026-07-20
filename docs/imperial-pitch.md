# Agent Desk - Five-Slide Pitch

## Slide 1 - Agents waste money on vague work

Autonomous agents can buy APIs and execute code, but they still receive human prompts with no objective
done state. The expensive failure is not payment. It is paying a worker that builds the wrong thing or
claims success without inspectable evidence.

**Customer:** teams dispatching coding, grant, launch, and operations agents.

**Why now:** agent tool access and budgets are growing faster than the contracts that constrain them.

## Slide 2 - Buy clarity before execution

Agent Desk sells one skill: `agent-desk-brief`.

For `0.001 SOL`, it compiles ambiguous intent into `agent-work-contract/v1`:

- named artifacts and explicit done states;
- four acceptance gates with required evidence;
- risks, dependencies, and stop conditions;
- a worker-ready prompt; and
- a canonical SHA-256 delivery receipt.

## Slide 3 - The buyer decides to pay

```text
goal -> budget policy -> 402 quote -> devnet payment -> work contract -> receipt
```

The LLM never controls the wallet policy. Code rejects an unknown service or price above the cap. A
unique Solana Pay reference binds the transfer to one order. The seller verifies the submitted
signature, recipient, amount, and reference before delivery.

**This is the economic moment:** a buyer spends a tiny amount to reduce the risk of a much larger job.

## Slide 4 - Proof, not screenshots

- one command runs seller and autonomous buyer;
- a confirmed Solana devnet transaction proves settlement;
- delivery is structured JSON, not an unverifiable chat response;
- canonical SHA-256 binds the paid scope;
- four focused tests cover normalization, classification, receipt stability, and scope changes;
- the public console is clearly labelled as a replay of recorded evidence.

The CoralOS expansion path adds competing sellers, a broker, independent verification, escrow release
or refund, and reputation derived from the run ledger.

## Slide 5 - From one skill to a work market

**Initial wedge:** specification contracts for high-cost AI work.

**Revenue:** per-contract fee, then USDC-priced specialist skills and marketplace routing fees.

**Next milestones:**

1. publish a signed skill manifest and contract schema;
2. add a verifier that scores returned work against each acceptance gate;
3. settle in devnet USDC and benchmark cost per prevented failed run;
4. onboard third-party specialist sellers through CoralOS.

Agent Desk makes autonomous work purchasable because it makes “done” machine-readable.
