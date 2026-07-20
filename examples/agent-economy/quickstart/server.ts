/**
 * server.ts - bare-metal HTTP 402 seller (Track 1, Layer B).
 *
 * Agent Desk fork: the seller exposes a paid AI-work "skill" endpoint. A buyer asks for
 * a task brief, receives a 402 Solana Pay challenge, pays on devnet, and gets a structured
 * delivery packet that an agent can execute or verify.
 *
 *   GET /api/data?q=<task>          -> 402 + x-payment-required
 *   GET /api/data (+ payment proof) -> verify on-chain -> 200 { data }
 */
import express from 'express'
import { Connection, Keypair, PublicKey } from '@solana/web3.js'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { verifyPayment } from './verify.js'
import { compileWorkContract } from './skill.js'

function loadDotEnv() {
  const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..')
  try {
    for (const line of readFileSync(join(root, '.env'), 'utf8').split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
      if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
    }
  } catch {
    // Shell env is enough.
  }
}

loadDotEnv()

const PORT = Number(process.env.PORT ?? 3001)
const RECIPIENT = process.env.SELLER_WALLET ?? process.env.WALLET ?? ''
const PRICE_SOL = Number(process.env.PRICE_SOL ?? 0.001)
const RPC = process.env.SOLANA_RPC_URL ?? 'https://api.devnet.solana.com'

// Devnet-only guard. This demo should not spend real funds.
if (process.env.ALLOW_MAINNET !== '1' && /mainnet/i.test(RPC)) {
  console.error(`Refusing mainnet RPC "${RPC}". Set ALLOW_MAINNET=1 only for deliberate testing.`)
  process.exit(1)
}

if (!RECIPIENT) {
  console.error('SELLER_WALLET (or WALLET) must be set to a devnet pubkey')
  process.exit(1)
}

const conn = new Connection(RPC, 'confirmed')
const QUOTE_TTL_MS = 10 * 60 * 1000
const MAX_PENDING_QUOTES = 100
const pending = new Map<string, { request: string; expiresAt: number }>()

const app = express()

app.get('/health', (_req, res) => {
  res.json({ service: 'agent-desk', status: 'ready', network: 'solana-devnet' })
})

app.get('/api/data', async (req, res) => {
  const proof = req.header('x-payment-proof')

  if (!proof) {
    pruneExpiredQuotes()
    if (pending.size >= MAX_PENDING_QUOTES) {
      res.status(503).json({ error: 'quote capacity reached; retry after existing quotes expire' })
      return
    }
    const reference = Keypair.generate().publicKey.toBase58()
    const expiresAt = Date.now() + QUOTE_TTL_MS
    pending.set(reference, { request: req.query.q?.toString() ?? 'default', expiresAt })
    const challenge = {
      scheme: 'solana-pay-reference/v1',
      recipient: RECIPIENT,
      amountSol: PRICE_SOL,
      reference,
      expiresAt: new Date(expiresAt).toISOString(),
    }
    res
      .status(402)
      .set('x-payment-required', JSON.stringify(challenge))
      .json({ error: 'payment required', ...challenge })
    return
  }

  const reference = req.header('x-payment-reference') ?? req.query.reference?.toString()
  const quote = reference ? pending.get(reference) : undefined
  if (!reference || !quote) {
    res.status(400).json({ error: 'missing or unknown payment reference' })
    return
  }
  if (quote.expiresAt < Date.now()) {
    pending.delete(reference)
    res.status(410).json({ error: 'payment quote expired; request a new quote' })
    return
  }

  const sig = await verifyPayment(conn, new PublicKey(reference), new PublicKey(RECIPIENT), PRICE_SOL, proof)
  if (!sig) {
    res.status(402).json({ error: 'payment not confirmed on-chain' })
    return
  }

  const request = quote.request
  pending.delete(reference)

  let data: unknown
  try {
    data = await deliverData(request)
  } catch (e) {
    data = { error: `delivery failed after payment: ${String(e)}` }
  }
  res.json({ data, paidWith: sig })
})

function pruneExpiredQuotes() {
  const now = Date.now()
  for (const [reference, quote] of pending) {
    if (quote.expiresAt < now) pending.delete(reference)
  }
}

app.listen(PORT, () => {
  console.error(`[seller] Agent Desk 402 server on :${PORT} - recipient ${RECIPIENT}, price ${PRICE_SOL} SOL`)
})

// FORK POINT: this is the paid skill.
async function deliverData(request: string): Promise<unknown> {
  return compileWorkContract(request, { seller: RECIPIENT, priceSol: PRICE_SOL })
}
