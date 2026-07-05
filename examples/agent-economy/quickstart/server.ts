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
const PRICE_SOL = Number(process.env.PRICE_SOL ?? 0.0001)
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
const pending = new Map<string, string>()

const app = express()

app.get('/api/data', async (req, res) => {
  const proof = req.header('x-payment-proof')

  if (!proof) {
    const reference = Keypair.generate().publicKey.toBase58()
    pending.set(reference, req.query.q?.toString() ?? 'default')
    res
      .status(402)
      .set('x-payment-required', JSON.stringify({ recipient: RECIPIENT, amountSol: PRICE_SOL, reference }))
      .json({ error: 'payment required', recipient: RECIPIENT, amountSol: PRICE_SOL, reference })
    return
  }

  const reference = req.header('x-payment-reference') ?? req.query.reference?.toString()
  if (!reference || !pending.has(reference)) {
    res.status(400).json({ error: 'missing or unknown payment reference' })
    return
  }

  const sig = await verifyPayment(conn, new PublicKey(reference), new PublicKey(RECIPIENT), PRICE_SOL)
  if (!sig) {
    res.status(402).json({ error: 'payment not confirmed on-chain' })
    return
  }

  const request = pending.get(reference)!
  pending.delete(reference)

  let data: unknown
  try {
    data = await deliverData(request)
  } catch (e) {
    data = { error: `delivery failed after payment: ${String(e)}` }
  }
  res.json({ data, paidWith: sig })
})

app.listen(PORT, () => {
  console.error(`[seller] Agent Desk 402 server on :${PORT} - recipient ${RECIPIENT}, price ${PRICE_SOL} SOL`)
})

// FORK POINT: this is the paid skill.
async function deliverData(request: string): Promise<unknown> {
  const task = normalizeTask(request)
  const acceptance = acceptanceFor(task)
  const digest = await sha256(`${task}|${acceptance.join('|')}|agent-desk-v1`)

  return {
    service: 'agent-desk-brief',
    version: '1.0.0',
    paidDelivery: true,
    request: { task },
    brief: {
      title: titleFor(task),
      objective: `Turn "${task}" into a finished agent-executable work packet.`,
      buyerNeed: 'A copy-pasteable task that another AI agent can execute, verify, and return with evidence.',
      deliverables: [
        'one-page execution brief',
        'acceptance criteria checklist',
        'risk and dependency notes',
        'verification commands or manual checks',
      ],
      acceptanceCriteria: acceptance,
      verification: {
        mode: 'self-check plus buyer review',
        evidenceRequired: ['artifact link or text', 'summary of actions taken', 'pass/fail checklist'],
      },
      budget: { priceSol: PRICE_SOL, network: 'solana-devnet' },
    },
    skillPrompt: [
      'You are Agent Desk, a paid AI work agent.',
      `Task: ${task}`,
      'Return: objective, steps, deliverables, acceptance criteria, risks, and evidence.',
      'Do not claim completion without attaching verifiable output.',
    ].join('\n'),
    receipt: {
      deliverySha256: digest,
      issuedAt: new Date().toISOString(),
      seller: RECIPIENT,
    },
  }
}

function normalizeTask(request: string): string {
  const cleaned = request.trim().replace(/\s+/g, ' ')
  return cleaned && cleaned !== 'default'
    ? cleaned.slice(0, 240)
    : 'create a launch-ready product brief for an AI agent skill marketplace'
}

function titleFor(task: string): string {
  const first = task.split(/[.!?]/)[0]?.trim() || task
  return first.length > 72 ? `${first.slice(0, 69)}...` : first
}

function acceptanceFor(task: string): string[] {
  const lower = task.toLowerCase()
  const base = [
    'scope is specific enough for an independent AI agent to start without extra context',
    'deliverables are named and have a clear done state',
    'buyer can verify the result from attached evidence',
  ]
  if (/launch|tweet|x |marketing|post|thread/.test(lower)) {
    return [...base, 'copy includes a hook, target audience, proof point, and call to action']
  }
  if (/code|repo|github|api|software|bug|test/.test(lower)) {
    return [...base, 'implementation includes changed files, test commands, and known limitations']
  }
  if (/grant|bounty|pitch|investor|partner/.test(lower)) {
    return [...base, 'pitch explains problem, solution, traction evidence, and requested next step']
  }
  return base
}

async function sha256(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input)
  const hash = await crypto.subtle.digest('SHA-256', bytes)
  return [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, '0')).join('')
}
