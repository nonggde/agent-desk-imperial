# Agent Desk Demo Video Script

Target length: 3 minutes.

## 0:00 - 0:25 Problem

Agents can write, code, research, and verify work, but they still lack a simple economic loop. They
need to ask for work, decide whether the price is acceptable, pay, receive delivery, and prove what
happened.

## 0:25 - 0:55 Solution

Agent Desk is a paid AI-work skill marketplace on Solana devnet. The first skill is
`agent-desk-brief`, which turns a vague task into an executable work packet with acceptance criteria,
verification evidence, and a receipt hash.

## 0:55 - 1:45 Live Demo

Start the seller:

```sh
cd examples/agent-economy/quickstart
set SOLANA_RPC_URL=https://solana-devnet.api.onfinality.io/public
npm run server
```

Start the buyer:

```sh
cd examples/agent-economy/quickstart
set SOLANA_RPC_URL=https://solana-devnet.api.onfinality.io/public
npm run buyer
```

Narration:

- The buyer asks for a task packet.
- The seller returns a 402 challenge with recipient, amount, and a unique Solana Pay reference.
- The buyer checks its budget, signs a devnet transfer, and retries with the payment proof.
- The seller verifies the reference-tagged transfer on-chain.
- The buyer receives the paid `agent-desk-brief` delivery.

## 1:45 - 2:25 Market Path

Show `examples/freelancer`: the full CoralOS market path supports competing sellers and verifier-gated
release.

```text
WANT -> BID -> AWARD -> DEPOSITED -> DELIVERED -> VERIFIED -> RELEASED
```

This is where Agent Desk becomes more than one seller. It becomes a marketplace of uploaded skills.

## 2:25 - 3:00 Why Solana

The payment is cheap, fast, and reference-bound. A buyer agent can pay at machine speed, and the order
can be verified from chain evidence instead of screenshots or trust.

Close with the repo, the pitch deck, and the next step: more skills, a skill registry, and USDC pricing.
