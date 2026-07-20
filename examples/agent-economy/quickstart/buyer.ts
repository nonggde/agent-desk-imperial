/**
 * buyer.ts - autonomous buyer for the bare-metal Agent Desk 402 seller.
 *
 * The buyer fetches the paid skill endpoint, reads the 402 challenge, checks the
 * requested SOL amount against its budget, signs a devnet transfer with the unique
 * Solana Pay reference, then retries with the proof to receive the paid delivery.
 */
import {
  Connection, Keypair, PublicKey, SystemProgram, Transaction,
  LAMPORTS_PER_SOL, sendAndConfirmTransaction,
} from '@solana/web3.js'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

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

const DEFAULT_TASK = 'create a launch-ready product brief for an AI agent skill marketplace'
const ENDPOINT =
  process.env.ENDPOINT ??
  `http://localhost:3001/api/data?q=${encodeURIComponent(process.env.BUYER_GOAL ?? DEFAULT_TASK)}`
const BUDGET_LAMPORTS = Number(process.env.BUYER_MAX_SOL ?? 0.001) * LAMPORTS_PER_SOL
const RPC = process.env.SOLANA_RPC_URL ?? 'https://api.devnet.solana.com'

if (process.env.ALLOW_MAINNET !== '1' && /mainnet/i.test(RPC)) {
  throw new Error(`Refusing mainnet RPC "${RPC}". Set ALLOW_MAINNET=1 only for deliberate testing.`)
}

interface Challenge {
  scheme?: string
  recipient: string
  amountSol: number
  reference?: string
  expiresAt?: string
}

function loadKeypair(): Keypair {
  const b58 = process.env.BUYER_KEYPAIR_B58
  if (!b58) throw new Error('BUYER_KEYPAIR_B58 not set')
  const alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
  let n = 0n
  for (const c of b58) {
    const idx = alphabet.indexOf(c)
    if (idx < 0) throw new Error('invalid base58')
    n = n * 58n + BigInt(idx)
  }
  const hex = n.toString(16).padStart(128, '0')
  const bytes = new Uint8Array(64)
  for (let i = 0; i < 64; i++) bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16)
  return Keypair.fromSecretKey(bytes)
}

async function fetchChallenge(): Promise<Challenge | string> {
  const r = await fetch(ENDPOINT)
  if (r.status !== 402) return await r.text()
  const header = r.headers.get('x-payment-required')
  if (header) return JSON.parse(header) as Challenge
  return JSON.parse(await r.text()) as Challenge
}

async function pay(challenge: Challenge): Promise<string> {
  const lamports = Math.round(challenge.amountSol * LAMPORTS_PER_SOL)
  if (lamports > BUDGET_LAMPORTS) {
    throw new Error(`budget exceeded: ${challenge.amountSol} SOL requested`)
  }
  if (!challenge.reference) throw new Error('seller challenge missing Solana Pay reference')
  if (challenge.expiresAt && Date.parse(challenge.expiresAt) <= Date.now()) {
    throw new Error('seller challenge expired before payment')
  }

  const keypair = loadKeypair()
  const conn = new Connection(RPC, 'confirmed')
  const ix = SystemProgram.transfer({
    fromPubkey: keypair.publicKey,
    toPubkey: new PublicKey(challenge.recipient),
    lamports,
  })
  ix.keys.push({ pubkey: new PublicKey(challenge.reference), isSigner: false, isWritable: false })

  const sig = await sendAndConfirmTransaction(conn, new Transaction().add(ix), [keypair], { commitment: 'confirmed' })
  console.error(`[buyer] paid ${challenge.amountSol} SOL sig=${sig}`)
  return sig
}

async function main() {
  const first = await fetchChallenge()
  if (typeof first === 'string') {
    console.error(`[buyer] endpoint returned data without payment: ${first.slice(0, 500)}`)
    return
  }

  console.error(`[buyer] 402 challenge: ${first.amountSol} SOL -> ${first.recipient}`)
  if (process.env.DRY_RUN === '1') {
    console.error(`[buyer] DRY_RUN=1, not signing. reference=${first.reference}`)
    return
  }

  const sig = await pay(first)
  const retry = await fetch(ENDPOINT, {
    headers: { 'x-payment-proof': sig, 'x-payment-reference': first.reference ?? '' },
  })
  const text = await retry.text()
  if (!retry.ok) throw new Error(`seller rejected proof: ${retry.status} ${text.slice(0, 500)}`)
  console.error(`[buyer] DONE: ${text.slice(0, 2000)}`)
}

main().catch((e) => { console.error(`[buyer] error: ${e}`); process.exitCode = 1 })
