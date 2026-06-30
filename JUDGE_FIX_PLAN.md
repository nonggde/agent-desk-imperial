# Judge Fix Plan

This is the high-signal fix list for tightening the demo before a video or judging pass.

Status: the code-level P0/P1 fixes are implemented. CoralOS now uses arbiter-gated settlement with
bound references, launches three seller personas, and routes the seller service through TxODDS only.
The remaining items are external setup (fund a live LLM provider) or larger follow-ups.

## Priority Order

| Priority | Issue | Why it matters | Fix | Effort |
|---|---|---|---|---|
| P0 | CoralOS settlement split | The arbiter and bound reference are the best protocol innovations, but the multi-agent story still settles through base `deposit -> release`. | Done: CoralOS defaults to `SETTLEMENT_MODE=arbiter`, sends vault details, and releases via arbiter. | M |
| P0 | LLM is currently fallback | The thesis is "AI agents buying/selling reads"; deterministic fallback weakens the product story on video. | External: top up Anthropic or set `LLM_PROVIDER=openai` with a funded OpenAI key. | S |
| P1 | Market is effectively 1:1 | One buyer plus one seller is coordination, not a market. | Done: `round.ts` launches three TxODDS seller personas; specialist is priced to win. | S |
| P1 | Seller agent has legacy generic services | CoinGecko/Jupiter/news code distracts from the TxODDS story. | Done: `service.ts` is TxODDS-only and seller docs describe legacy helpers as outside the loop. | S |
| P1 | Arbiter is centralized | One proxy-controlled arbiter key makes overbroad settlement claims easy to challenge. | Done in docs: described as arbiter-gated with a trusted neutral arbiter. | S |
| P2 | Product value is thin | The read restates de-margined odds; there is not yet a real betting edge. | Be honest now; stretch goal is bookmaker comparison for true edge. | L |
| P2 | No Rust CI | Devnet tests cannot run in Actions, so contract regressions are not caught in CI. | Add LiteSVM/Mollusk contract tests. | M |
| P2 | Free TxLINE tier is brittle | Intermittent feed/tokens can undermine demos. | Keep fallback data, document the dependency, and prefer a warmed token/session before recording. | S |

## P0: Align CoralOS Settlement With The Web Demo

**Problem:** the web demo uses the arbiter and order-bound reference, but the CoralOS round still uses the
base escrow path. That means the best innovations are absent from the multi-agent story.

**Goal:** the CoralOS round should use the same settlement spine as the web demo:

1. Seller mints or receives an order-bound reference derived from the purchased TxODDS read.
2. Buyer opens an arbitrated escrow through `agent/arbiter.ts`.
3. Seller verifies the arbitrated escrow PDA is funded for the expected seller and amount.
4. Seller delivers the TxODDS read.
5. Arbiter releases to seller after delivery verification.
6. Round logs show `WANT -> BID -> AWARD -> ESCROW_REQUIRED -> ARBITER_OPENED -> DELIVERED -> ARBITER_RELEASED`.

**Files likely involved:**

- `examples/txodds/coral/round.ts`
- `coral-agents/buyer-agent/src/index.ts`
- `coral-agents/buyer-agent/src/escrow.ts`
- `coral-agents/seller-agent/src/index.ts`
- `coral-agents/seller-agent/src/escrow.ts`
- `examples/txodds/agent/arbiter.ts`
- `examples/txodds/server/proxy.ts` as the working reference implementation

**Acceptance criteria:**

- CoralOS no longer settles via direct buyer `deposit -> release`.
- The order reference is bound to the read, not just a random reference.
- The buyer cannot unilaterally refund/release in the CoralOS path.
- Logs and README make the arbiter path obvious.

## P0: Restore Live LLM Before Recording

**Problem:** the current deterministic read is a billing/provider fallback, not the intended AI product.

**Fix options:**

- Top up Anthropic credits.
- Or set `LLM_PROVIDER=openai` and provide `OPENAI_API_KEY`.

**Acceptance criteria:**

- Demo logs show the live LLM provider being used.
- The video does not depend on the fallback path.
- README/Troubleshooting can still mention deterministic fallback as resilience, not the main path.

## P1: Add Competing Sellers

**Problem:** one buyer plus one seller does not demonstrate market dynamics.

**Fix:**

- Add two additional seller personas.
- Make one clearly specialized for TxODDS/fair-line analysis.
- Have the buyer choose on price, confidence, latency, or declared specialty.

**Acceptance criteria:**

- The round includes at least three `BID` messages.
- The specialist wins for a legible reason.
- Logs show a real award decision, not a hardcoded seller.

## P1: Trim Seller Agent To TxODDS

**Problem:** generic restored services dilute the narrative.

**Fix:**

- Remove or quarantine CoinGecko/Jupiter/news behaviors from the TxODDS seller path.
- Keep the seller focused on `WANT(txline edge)` and settlement.

**Acceptance criteria:**

- Seller docs and code path are TxODDS-first.
- Unused generic service imports/handlers do not appear in the demo path.

## P1: Tighten Arbiter Language

**Problem:** a single arbiter key controlled by the proxy is a trusted neutral party.

**Fix:**

- Avoid wording that implies the arbiter has no trusted keypair.
- Prefer "arbiter-gated", "buyer cannot unilaterally claw back", and "trusted neutral arbiter".

## P2: Product Depth

**Problem:** a fair line plus short read is useful but modest; it is mostly de-margined odds.

**Stretch fix:**

- Add a bookmaker comparison feed.
- Compute edge as `book price - fair price`.
- Have specialist sellers compete on edge detection.

This is larger than the core demo fix, but it would make the value proposition much sharper.

## P2: Contract CI

**Problem:** devnet tests are not CI-friendly.

**Fix:**

- Port escrow and arbiter lifecycle tests to LiteSVM or Mollusk.
- Cover initialize/open, release, refund, wrong seller, wrong arbiter, deadline behavior, and bound PDA derivation.

**Acceptance criteria:**

- Rust contract tests run in GitHub Actions without devnet credentials.
- CI catches contract/account constraint regressions.

## Suggested Execution Sequence

1. Restore live LLM provider.
2. Align CoralOS settlement to arbiter plus bound reference.
3. Add competing TxODDS seller personas.
4. Trim seller-agent generic services.
5. Update docs/log language around arbiter centralization.
6. Add LiteSVM/Mollusk CI.
7. Stretch: bookmaker edge feed.

## Demo Narrative After Fixes

The buyer broadcasts a TxODDS edge request. Multiple sellers bid. The specialist wins. The buyer funds an
arbiter-gated escrow whose reference is bound to the purchased read. The seller delivers a live LLM read
over verified odds. The arbiter releases payment on-chain. The Explorer links show the settlement, and the
logs show a real market round rather than a scripted 1:1 exchange.
