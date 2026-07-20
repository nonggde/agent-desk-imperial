import assert from 'node:assert/strict'
import test from 'node:test'
import { classifyTask, compileWorkContract, normalizeTask } from './skill.js'

const context = { seller: 'seller111', priceSol: 0.001, issuedAt: '2026-07-20T00:00:00.000Z' }

test('normalizes untrusted task text and enforces a length cap', () => {
  assert.equal(normalizeTask('  build   an API  '), 'build an API')
  assert.equal(normalizeTask('x'.repeat(400)).length, 320)
})

test('classifies common paid-work requests', () => {
  assert.equal(classifyTask('fix the GitHub API tests'), 'software')
  assert.equal(classifyTask('prepare a grant proposal'), 'grant')
  assert.equal(classifyTask('launch campaign copy'), 'launch')
})

test('produces a deterministic receipted work contract', () => {
  const first = compileWorkContract('fix the API tests', context)
  const second = compileWorkContract('fix the API tests', context)
  assert.equal(first.schema, 'agent-work-contract/v1')
  assert.equal(first.execution.acceptanceGates.length, 4)
  assert.equal(first.receipt.canonicalSha256, second.receipt.canonicalSha256)
  assert.match(first.receipt.canonicalSha256, /^[a-f0-9]{64}$/)
})

test('changes the receipt when the paid scope changes', () => {
  const first = compileWorkContract('fix the API tests', context)
  const second = compileWorkContract('write a grant proposal', context)
  assert.notEqual(first.receipt.canonicalSha256, second.receipt.canonicalSha256)
})
