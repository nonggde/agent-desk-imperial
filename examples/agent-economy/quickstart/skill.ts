import { createHash } from 'node:crypto'

export type WorkKind = 'software' | 'grant' | 'launch' | 'general'

export interface SkillContext {
  seller: string
  priceSol: number
  issuedAt?: string
}

export function normalizeTask(request: string): string {
  const cleaned = request.trim().replace(/\s+/g, ' ')
  return cleaned && cleaned !== 'default'
    ? cleaned.slice(0, 320)
    : 'prepare a launch-ready proof package for an autonomous agent product'
}

export function classifyTask(task: string): WorkKind {
  const lower = task.toLowerCase()
  if (/code|repo|github|api|software|bug|test|deploy/.test(lower)) return 'software'
  if (/grant|bounty|pitch|investor|fund|proposal/.test(lower)) return 'grant'
  if (/launch|marketing|post|campaign|landing|announce/.test(lower)) return 'launch'
  return 'general'
}

export function compileWorkContract(request: string, context: SkillContext) {
  const task = normalizeTask(request)
  const kind = classifyTask(task)
  const deliverables = deliverablesFor(kind)
  const acceptance = acceptanceFor(kind)
  const canonical = JSON.stringify({ task, kind, deliverables, acceptance, seller: context.seller })
  const digest = createHash('sha256').update(canonical).digest('hex')

  return {
    schema: 'agent-work-contract/v1',
    service: 'agent-desk-brief',
    version: '1.1.0',
    paidDelivery: true,
    order: {
      task,
      kind,
      objective: objectiveFor(task, kind),
      budget: { priceSol: context.priceSol, network: 'solana-devnet' },
    },
    execution: {
      deliverables,
      acceptanceGates: acceptance,
      risks: risksFor(kind),
      stopConditions: [
        'a required credential, payment, or irreversible action lacks buyer approval',
        'the requested evidence cannot be produced or independently checked',
      ],
    },
    workerPrompt: [
      'Execute this work contract as an evidence-first AI agent.',
      `Objective: ${objectiveFor(task, kind)}`,
      `Deliver exactly: ${deliverables.map((item) => item.artifact).join('; ')}.`,
      'Return changed artifacts, verification output, known limitations, and a pass/fail result for every gate.',
      'Do not claim completion without inspectable evidence.',
    ].join('\n'),
    receipt: {
      canonicalSha256: digest,
      issuedAt: context.issuedAt ?? new Date().toISOString(),
      seller: context.seller,
      digestCovers: ['task', 'classification', 'deliverables', 'acceptance gates', 'seller'],
    },
  }
}

function objectiveFor(task: string, kind: WorkKind): string {
  const verbs: Record<WorkKind, string> = {
    software: 'Ship and verify',
    grant: 'Produce an evidence-backed application for',
    launch: 'Prepare and validate',
    general: 'Complete and prove',
  }
  return `${verbs[kind]}: ${task}`
}

function deliverablesFor(kind: WorkKind) {
  const common = [
    { id: 'D1', artifact: 'execution brief', doneWhen: 'scope, owner, dependencies, and completion state are explicit' },
    { id: 'D2', artifact: 'evidence index', doneWhen: 'every completion claim links to an output or verification result' },
  ]
  const specific = {
    software: { id: 'D3', artifact: 'tested implementation', doneWhen: 'changed files build and focused tests pass' },
    grant: { id: 'D3', artifact: 'reviewer-ready application pack', doneWhen: 'claims map to public proof, milestones, and budget' },
    launch: { id: 'D3', artifact: 'channel-ready launch package', doneWhen: 'message, proof point, audience, and CTA are present' },
    general: { id: 'D3', artifact: 'finished requested artifact', doneWhen: 'buyer can inspect and use it without extra context' },
  }
  return [...common, specific[kind]]
}

function acceptanceFor(kind: WorkKind) {
  const common = [
    { id: 'A1', assertion: 'No deliverable is missing', evidence: 'artifact inventory' },
    { id: 'A2', assertion: 'Claims are independently checkable', evidence: 'links, commands, or captured output' },
    { id: 'A3', assertion: 'Known limitations are disclosed', evidence: 'limitations section' },
  ]
  const specific = {
    software: { id: 'A4', assertion: 'Build and focused tests pass', evidence: 'exact commands and exit codes' },
    grant: { id: 'A4', assertion: 'Budget and milestones have measurable acceptance criteria', evidence: 'milestone table' },
    launch: { id: 'A4', assertion: 'Copy names the audience, value, proof, and next action', evidence: 'final channel copy' },
    general: { id: 'A4', assertion: 'Output satisfies the buyer objective', evidence: 'objective-to-output mapping' },
  }
  return [...common, specific[kind]]
}

function risksFor(kind: WorkKind): string[] {
  const shared = ['ambiguous buyer intent', 'unverifiable completion claims']
  if (kind === 'software') return [...shared, 'environment-specific build or deployment behavior']
  if (kind === 'grant') return [...shared, 'unsupported traction claims or misaligned eligibility']
  if (kind === 'launch') return [...shared, 'channel constraints or missing brand approval']
  return [...shared, 'hidden dependencies discovered during execution']
}
