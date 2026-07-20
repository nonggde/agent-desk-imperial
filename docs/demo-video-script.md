# Agent Desk Demo Video Script

Target: 2:30-3:00. Every screen must show product or evidence.

## 0:00-0:25 - Problem

Open the proof console on the work-request stage.

“Agents can buy tools and execute code, but most jobs still arrive as vague prompts. The expensive
failure is paying a worker that builds the wrong thing or claims completion without proof.”

## 0:25-0:50 - Product

Advance to delivery and show the JSON evidence inspector.

“Agent Desk sells clarity before execution. For 0.001 SOL, it compiles intent into a work contract:
deliverables, done states, acceptance gates, evidence rules, stop conditions, and a SHA-256 receipt.”

## 0:50-1:45 - Live terminal

Run:

```sh
npm run demo:agent-desk
```

Call out each visible transition:

1. seller is healthy;
2. buyer receives a 402 quote;
3. budget policy accepts the price;
4. buyer signs a reference-bound devnet transfer;
5. seller validates the exact signature, recipient, amount, and reference;
6. buyer receives `agent-work-contract/v1` and its digest.

Open the printed signature in Solana Explorer. Show confirmed status and the buyer/seller identities.

## 1:45-2:20 - Trust boundary

Open the architecture tab.

“The model proposes work. Code controls spend and release. Mainnet is rejected by default, unknown
signatures do not unlock delivery, and every completion gate names the evidence a verifier expects.”

## 2:20-2:45 - Economy

Show the CoralOS expansion in the repository.

“Today this is one paid skill. CoralOS turns it into a market: sellers bid, a broker routes work, an
independent verifier gates escrow release, and failed delivery remains refundable and auditable.”

## 2:45-3:00 - Team and close

Show the repository and test results.

“I am the solo builder. Agent Desk makes autonomous work purchasable by making ‘done’ machine-readable.”
