import { spawn } from 'node:child_process'

const server = spawn(process.execPath, ['--import', 'tsx', 'server.ts'], {
  stdio: 'inherit',
})

async function waitForSeller() {
  for (let attempt = 0; attempt < 40; attempt++) {
    try {
      const response = await fetch('http://127.0.0.1:3001/health')
      if (response.ok) return
    } catch {
      // Seller is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 250))
  }
  throw new Error('seller did not become ready on port 3001')
}

async function main() {
  await waitForSeller()
  const buyer = spawn(process.execPath, ['--import', 'tsx', 'buyer.ts'], { stdio: 'inherit' })
  const code = await new Promise<number>((resolve) => buyer.on('exit', (value) => resolve(value ?? 1)))
  process.exitCode = code
}

main()
  .catch((error) => {
    console.error(`[demo] ${String(error)}`)
    process.exitCode = 1
  })
  .finally(() => server.kill())

process.on('SIGINT', () => server.kill())
process.on('SIGTERM', () => server.kill())
