import { describe, expect, test } from 'vitest'
import { renderTemplate } from '../templateRender'

describe('renderTemplate', () => {
  test('replaces simple variables', () => {
    const out = renderTemplate('Hello {{name}}', { name: 'Daniel' })
    expect(out).toBe('Hello Daniel')
  })

  test('renders missing variables as empty string', () => {
    const out = renderTemplate('Hello {{name}}', {})
    expect(out).toBe('Hello ')
  })

  test('supports dotted paths', () => {
    const out = renderTemplate('Hi {{user.name}}', { user: { name: 'Rex' } })
    expect(out).toBe('Hi Rex')
  })

  test('stringifies objects as JSON', () => {
    const out = renderTemplate('Data: {{payload}}', { payload: { a: 1 } })
    expect(out).toBe('Data: {"a":1}')
  })
})
