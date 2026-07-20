import { useEffect, useMemo, useState } from 'react'
import {
  BadgeCheck,
  Check,
  ChevronRight,
  CircleDollarSign,
  Copy,
  ExternalLink,
  FileCheck2,
  Github,
  Network,
  Play,
  RotateCcw,
  ShieldCheck,
  Terminal,
  WalletCards,
} from 'lucide-react'

const REPOSITORY = 'https://github.com/nonggde/agent-desk-imperial'
const EXPLORER =
  'https://explorer.solana.com/tx/zX3pSjwTqCNxjXuxEiPCbUohU9uB5awZvALNUXXKUbh2RVsjVznnjMFBwvDD5tA3fJBW2bKAiHFCevDvUQUiuTT?cluster=devnet'
const COMMAND = 'npm run demo:agent-desk'

type View = 'proof' | 'architecture' | 'quickstart'

type ProofStep = {
  id: string
  title: string
  actor: string
  summary: string
  detail: string
  Icon: typeof WalletCards
}

const PROOF_STEPS: ProofStep[] = [
  {
    id: 'want',
    title: 'Work requested',
    actor: 'Buyer agent',
    summary: 'Compile an ambiguous product goal into an executable work contract.',
    detail: 'WANT / agent-desk-brief / budget 0.001 SOL',
    Icon: FileCheck2,
  },
  {
    id: 'quote',
    title: 'Price accepted',
    actor: 'Policy engine',
    summary: 'The quote is below the buyer cap and bound to a unique Solana Pay reference.',
    detail: '402 PAYMENT REQUIRED / policy pass',
    Icon: CircleDollarSign,
  },
  {
    id: 'settle',
    title: 'Funds settled',
    actor: 'Solana devnet',
    summary: 'Payment clears on-chain before the seller releases the paid artifact.',
    detail: 'CONFIRMED / reference matched / recipient matched',
    Icon: WalletCards,
  },
  {
    id: 'deliver',
    title: 'Work packet delivered',
    actor: 'Agent Desk',
    summary: 'The buyer receives scoped deliverables, acceptance gates, risks, and evidence rules.',
    detail: 'DELIVERED / structured JSON / sha256 receipt',
    Icon: FileCheck2,
  },
  {
    id: 'verify',
    title: 'Receipt verified',
    actor: 'Verifier agent',
    summary: 'The delivery digest and settlement evidence are preserved for independent review.',
    detail: 'VERIFIED / replayable evidence / release allowed',
    Icon: ShieldCheck,
  },
]

const RECEIPT = {
  service: 'agent-desk-brief',
  network: 'solana-devnet',
  amountSol: 0.001,
  result: 'VERIFIED',
  delivery: {
    format: 'agent-work-contract/v1',
    acceptanceGates: 4,
    evidenceRequired: true,
  },
  settlement: {
    signature: 'zX3pSjwTqCNxjXuxEiPCbUohU9uB5awZvALNUXXKUbh2RVsjVznnjMFBwvDD5tA3fJBW2bKAiHFCevDvUQUiuTT',
    reference: '3KuGeiGiPqbDTMMWjY1G94nnUALgY6GVGAPNVny4xmSV',
    referenceBound: true,
    recipientMatched: true,
    explorerProof: true,
  },
  receiptSha256: 'e84e6af6d1675de8b19d441801afda370f6110c129e7cb8c9fef3da59c6054fa',
}

function App() {
  const [view, setView] = useState<View>('proof')
  const [running, setRunning] = useState(false)
  const [activeStep, setActiveStep] = useState(0)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!running || activeStep >= PROOF_STEPS.length - 1) {
      if (activeStep >= PROOF_STEPS.length - 1) setRunning(false)
      return
    }

    const timer = window.setTimeout(() => setActiveStep((step) => step + 1), 720)
    return () => window.clearTimeout(timer)
  }, [activeStep, running])

  const active = PROOF_STEPS[activeStep]
  const receipt = useMemo(() => JSON.stringify(RECEIPT, null, 2), [])

  function runReplay() {
    setView('proof')
    setActiveStep(0)
    setRunning(true)
  }

  async function copyCommand() {
    await navigator.clipboard.writeText(COMMAND)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }

  return (
    <div className="shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Agent Desk home">
          <span className="brand-mark">AD</span>
          <span>
            <b>Agent Desk</b>
            <small>work contracts for autonomous agents</small>
          </span>
        </a>
        <div className="top-actions">
          <span className="network"><i /> Solana devnet</span>
          <a className="icon-link" href={REPOSITORY} target="_blank" rel="noreferrer" title="Open GitHub repository">
            <Github size={18} />
            <span>Source</span>
          </a>
        </div>
      </header>

      <main id="top">
        <section className="intro-band">
          <div className="intro-copy">
            <p className="eyebrow">Imperial AI Agent Hackathon · Proof console</p>
            <h1>An agent pays for a clearer job.</h1>
            <p className="lede">
              Agent Desk compiles vague intent into a priced, verifiable work contract, then binds the
              delivery to a Solana settlement receipt.
            </p>
          </div>
          <dl className="scoreboard" aria-label="Verified project facts">
            <div><dt>Settlement</dt><dd><BadgeCheck size={17} /> Confirmed</dd></div>
            <div><dt>Delivery</dt><dd>Hash-bound</dd></div>
            <div><dt>Buyer cap</dt><dd>0.001 SOL</dd></div>
          </dl>
        </section>

        <nav className="view-tabs" aria-label="Project views">
          <button className={view === 'proof' ? 'active' : ''} onClick={() => setView('proof')}>
            <ShieldCheck size={17} /> Proof run
          </button>
          <button className={view === 'architecture' ? 'active' : ''} onClick={() => setView('architecture')}>
            <Network size={17} /> Architecture
          </button>
          <button className={view === 'quickstart' ? 'active' : ''} onClick={() => setView('quickstart')}>
            <Terminal size={17} /> Run locally
          </button>
        </nav>

        {view === 'proof' && (
          <section className="proof-layout">
            <div className="flow-panel">
              <div className="section-heading">
                <div>
                  <p className="section-label">Recorded devnet run</p>
                  <h2>Payment-to-proof timeline</h2>
                </div>
                <button className="run-button" onClick={running ? () => setRunning(false) : runReplay}>
                  {running ? <RotateCcw size={17} /> : <Play size={17} />}
                  {running ? 'Pause replay' : activeStep > 0 ? 'Replay run' : 'Run verified replay'}
                </button>
              </div>

              <div className="flow" aria-live="polite">
                {PROOF_STEPS.map((step, index) => {
                  const status = index < activeStep ? 'done' : index === activeStep ? 'current' : 'queued'
                  const Icon = step.Icon
                  return (
                    <button
                      className={`flow-step ${status}`}
                      key={step.id}
                      onClick={() => { setRunning(false); setActiveStep(index) }}
                      aria-current={status === 'current' ? 'step' : undefined}
                    >
                      <span className="step-index">{status === 'done' ? <Check size={15} /> : String(index + 1).padStart(2, '0')}</span>
                      <span className="step-icon"><Icon size={18} /></span>
                      <span className="step-copy">
                        <span className="step-meta">{step.actor}</span>
                        <b>{step.title}</b>
                        <small>{step.summary}</small>
                      </span>
                      <ChevronRight className="step-arrow" size={18} />
                    </button>
                  )
                })}
              </div>
            </div>

            <aside className="evidence-panel">
              <div className="evidence-head">
                <div>
                  <span className="live-dot" /> Evidence inspector
                </div>
                <span>{String(activeStep + 1).padStart(2, '0')} / 05</span>
              </div>
              <div className="active-evidence">
                <p>{active.actor}</p>
                <h2>{active.title}</h2>
                <code>{active.detail}</code>
              </div>
              <pre className="receipt"><code>{receipt}</code></pre>
              <a className="explorer-link" href={EXPLORER} target="_blank" rel="noreferrer">
                Inspect settlement on Solana Explorer <ExternalLink size={16} />
              </a>
              <p className="evidence-note">Verified replay of a recorded devnet run. Replay does not create a new transaction.</p>
            </aside>
          </section>
        )}

        {view === 'architecture' && (
          <section className="architecture-view">
            <div className="section-heading">
              <div><p className="section-label">Economic loop</p><h2>Code decides what models may spend.</h2></div>
            </div>
            <div className="architecture-line">
              {['Buyer goal', 'Budget policy', '402 quote', 'Solana reference', 'Skill delivery', 'Verifier gate'].map((item, index) => (
                <div className="architecture-node" key={item}>
                  <span>{String(index + 1).padStart(2, '0')}</span><b>{item}</b>
                  {index < 5 && <ChevronRight size={18} />}
                </div>
              ))}
            </div>
            <div className="principles">
              <article><ShieldCheck size={20} /><h3>Deterministic guardrails</h3><p>Spend caps, service allowlists, payout binding, and verification gates run in code, outside the LLM.</p></article>
              <article><WalletCards size={20} /><h3>Reference-bound settlement</h3><p>Every order receives a unique Solana Pay reference so the payment can be matched to one job.</p></article>
              <article><FileCheck2 size={20} /><h3>Receipted delivery</h3><p>Each work packet declares acceptance criteria and a digest that survives outside the chat session.</p></article>
            </div>
          </section>
        )}

        {view === 'quickstart' && (
          <section className="quickstart-view">
            <div className="quickstart-copy">
              <p className="section-label">Judge path</p>
              <h2>One command. One guarded devnet purchase.</h2>
              <p>The demo starts the seller, requests a paid work contract, checks the buyer budget, and prints the delivery plus Explorer evidence.</p>
            </div>
            <div className="command-block">
              <div className="command-title"><Terminal size={17} /> Terminal <span>Node 20+</span></div>
              <div className="command-row"><code>{COMMAND}</code><button onClick={copyCommand} title="Copy command" aria-label="Copy command">{copied ? <Check size={18} /> : <Copy size={18} />}</button></div>
              <a href={`${REPOSITORY}#run-the-proof`} target="_blank" rel="noreferrer">Read setup and safety notes <ExternalLink size={15} /></a>
            </div>
          </section>
        )}
      </main>

      <footer>
        <span>Agent Desk · open source · devnet only</span>
        <span>Built on Solana Pay, CoralOS, and the starter escrow</span>
      </footer>
    </div>
  )
}

export default App
