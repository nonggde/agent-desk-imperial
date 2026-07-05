import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { chromium } from 'playwright-core'

const outFile = resolve('docs/assets/agent-desk-demo.webm')
const seconds = Number(process.env.DEMO_VIDEO_SECONDS ?? 180)
const edge =
  process.env.EDGE_PATH ??
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'

const browser = await chromium.launch({
  headless: true,
  executablePath: edge,
  args: ['--autoplay-policy=no-user-gesture-required'],
})

const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 })

page.on('console', (msg) => console.log(`[render] ${msg.text()}`))

await page.setContent(`
<!doctype html>
<html>
  <body style="margin:0;background:#07110d;overflow:hidden">
    <canvas id="c" width="1280" height="720"></canvas>
  </body>
</html>
`)

const base64 = await page.evaluate(async (seconds) => {
  const canvas = document.getElementById('c')
  const ctx = canvas.getContext('2d')
  const W = canvas.width
  const H = canvas.height
  const slides = [
    {
      eyebrow: 'Imperial AI Agent Hackathon',
      title: 'Agent Desk',
      body: 'Paid AI-work skills on Solana devnet. A buyer asks for work, pays by reference, and receives a verifiable delivery packet.',
      bullets: ['402 payment challenge', 'Budget-guarded buyer', 'Hash-receipted delivery'],
    },
    {
      eyebrow: 'Problem',
      title: 'Agents need a work market',
      body: 'Agents can write, code, research, and verify, but they still need a simple economic loop for pricing, payment, delivery, and proof.',
      bullets: ['Human marketplaces are slow', 'API billing is too narrow', 'Delivery needs evidence'],
    },
    {
      eyebrow: 'Solution',
      title: 'Sell an executable work packet',
      body: 'The first paid skill, agent-desk-brief, turns a task into objective, deliverables, acceptance criteria, verification checks, and a copy-paste prompt.',
      bullets: ['Task in', 'Paid skill packet out', 'Receipt hash attached'],
    },
    {
      eyebrow: 'Live loop',
      title: 'Buyer pays only when the price fits',
      body: 'The seller returns recipient, amount, and a unique Solana Pay reference. The buyer checks budget, signs a devnet transfer, and retries with proof.',
      bullets: ['GET /api/data', '402 challenge', 'x-payment-proof retry'],
    },
    {
      eyebrow: 'Market path',
      title: 'CoralOS upgrades one seller into a market',
      body: 'The full starter kit path supports competing sellers and verifier-gated release.',
      bullets: ['WANT -> BID -> AWARD', 'DEPOSITED -> DELIVERED', 'VERIFIED -> RELEASED'],
    },
    {
      eyebrow: 'Why Solana',
      title: 'Reference-bound settlement',
      body: 'Cheap devnet payments let software customers buy at machine speed, while the reference binds payment to a specific order.',
      bullets: ['Low-friction micropayments', 'Explorer-verifiable proof', 'Ready for USDC pricing'],
    },
    {
      eyebrow: 'Proof in repo',
      title: 'Built and runnable',
      body: 'The repo includes the no-Docker quickstart, pitch deck, submission summary, and the full CoralOS market path inherited from the starter kit.',
      bullets: ['examples/agent-economy/quickstart', 'SUBMISSION.md', 'docs/imperial-pitch.md'],
    },
  ]

  const supported = [
    'video/webm;codecs=vp9',
    'video/webm;codecs=vp8',
    'video/webm',
  ].find((type) => MediaRecorder.isTypeSupported(type))

  const stream = canvas.captureStream(8)
  const recorder = new MediaRecorder(stream, supported ? { mimeType: supported } : undefined)
  const chunks = []
  recorder.ondataavailable = (event) => { if (event.data.size) chunks.push(event.data) }

  const wrap = (text, maxWidth, font) => {
    ctx.font = font
    const words = text.split(' ')
    const lines = []
    let line = ''
    for (const word of words) {
      const test = line ? `${line} ${word}` : word
      if (ctx.measureText(test).width > maxWidth && line) {
        lines.push(line)
        line = word
      } else {
        line = test
      }
    }
    if (line) lines.push(line)
    return lines
  }

  const draw = (slide, progress, elapsed) => {
    const g = ctx.createLinearGradient(0, 0, W, H)
    g.addColorStop(0, '#06140f')
    g.addColorStop(0.45, '#10271f')
    g.addColorStop(1, '#111827')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, W, H)

    ctx.fillStyle = 'rgba(84, 214, 164, 0.12)'
    ctx.beginPath()
    ctx.arc(1080, 120, 260 + Math.sin(elapsed / 1200) * 20, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = 'rgba(245, 203, 92, 0.10)'
    ctx.beginPath()
    ctx.arc(160, 640, 220 + Math.cos(elapsed / 1000) * 18, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = '#54d6a4'
    ctx.font = '600 28px Arial'
    ctx.fillText(slide.eyebrow, 92, 96)

    ctx.fillStyle = '#f7f7ee'
    ctx.font = '700 72px Arial'
    for (const [i, line] of wrap(slide.title, 900, '700 72px Arial').entries()) {
      ctx.fillText(line, 90, 190 + i * 84)
    }

    ctx.fillStyle = '#d7e7dd'
    ctx.font = '400 34px Arial'
    for (const [i, line] of wrap(slide.body, 1020, '400 34px Arial').entries()) {
      ctx.fillText(line, 94, 340 + i * 46)
    }

    ctx.font = '500 30px Arial'
    slide.bullets.forEach((bullet, i) => {
      const y = 500 + i * 52
      ctx.fillStyle = '#f5cb5c'
      ctx.fillRect(96, y - 20, 14, 14)
      ctx.fillStyle = '#f7f7ee'
      ctx.fillText(bullet, 130, y)
    })

    const total = Math.max(1, seconds)
    ctx.fillStyle = 'rgba(255,255,255,0.16)'
    ctx.fillRect(90, 660, 1100, 8)
    ctx.fillStyle = '#54d6a4'
    ctx.fillRect(90, 660, 1100 * Math.min(1, progress / total), 8)
    ctx.fillStyle = '#d7e7dd'
    ctx.font = '500 22px Arial'
    ctx.fillText('Agent Desk demo', 90, 635)
  }

  return await new Promise((resolve, reject) => {
    recorder.onerror = () => reject(recorder.error)
    recorder.onstop = async () => {
      const blob = new Blob(chunks, { type: supported || 'video/webm' })
      const buffer = await blob.arrayBuffer()
      let binary = ''
      const bytes = new Uint8Array(buffer)
      for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i])
      resolve(btoa(binary))
    }

    const started = performance.now()
    const duration = seconds * 1000
    recorder.start(1000)

    const tick = (now) => {
      const elapsed = now - started
      const slideIndex = Math.min(slides.length - 1, Math.floor((elapsed / duration) * slides.length))
      draw(slides[slideIndex], elapsed / 1000, elapsed)
      if (elapsed < duration) {
        requestAnimationFrame(tick)
      } else {
        draw(slides[slides.length - 1], seconds, elapsed)
        recorder.stop()
      }
    }
    requestAnimationFrame(tick)
  })
}, seconds)

await browser.close()
await mkdir(dirname(outFile), { recursive: true })
await writeFile(outFile, Buffer.from(base64, 'base64'))
console.log(`Wrote ${outFile}`)
