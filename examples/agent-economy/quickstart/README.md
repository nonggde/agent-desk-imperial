# Agent Desk Quickstart

Bare-metal 402 demo for an AI-agent skill marketplace on Solana devnet.

This fork sells an `agent-desk-brief` skill: a buyer sends a task, the seller returns a Solana Pay
402 challenge, the autonomous buyer pays with a devnet wallet, the seller verifies the reference-tagged
transfer on-chain, and the buyer receives a structured work packet plus a delivery hash.

```text
buyer.ts -> GET /api/data?q=<task> -> server.ts
         <- 402 + { recipient, amountSol, reference }
buyer signs a devnet transfer with the reference key
buyer.ts -> GET /api/data + x-payment-proof
         <- 200 { service, brief, skillPrompt, receipt }
```

## Why this matters

The full CoralOS track supports the complete market flow:

```text
WANT -> BID -> AWARD -> DEPOSITED -> DELIVERED -> VERIFIED -> RELEASED
```

This quickstart is the no-Docker version of the same economic primitive. It proves the payment and
delivery edge of the loop on a normal laptop, then graduates to the full CoralOS multi-agent market
in `examples/freelancer` when Docker is available.

## Run

From the repo root:

```sh
npm run setup
```

Set a Node-reachable devnet RPC if the official RPC is blocked:

```sh
set SOLANA_RPC_URL=https://solana-devnet.api.onfinality.io/public
```

Fund the generated buyer wallet with devnet SOL. The public buyer address is printed in `WALLETS.txt`.
Then run:

```sh
cd examples/agent-economy/quickstart
npm install
npm run server
```

In another terminal:

```sh
cd examples/agent-economy/quickstart
npm run buyer
```

To inspect the payment challenge without signing:

```sh
DRY_RUN=1 npm run buyer
```

## Fork points

- `server.ts` -> `deliverData()` is the paid skill.
- `verify.ts` confirms recipient, amount, and Solana Pay reference.
- `buyer.ts` is the autonomous buyer loop with budget guard.

## Current Agent Desk skill

Input:

```text
create a launch-ready product brief for an AI agent skill marketplace
```

Paid output:

- execution objective
- named deliverables
- acceptance criteria
- verification evidence requirements
- copy-paste skill prompt
- sha256 receipt for the delivered packet
