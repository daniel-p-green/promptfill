import { describe, expect, test } from 'vitest'
import { parsePromptYaml } from '../promptSpec'

describe('parsePromptYaml', () => {
  test('parses a minimal prompt spec', () => {
    const spec = parsePromptYaml(`
id: summarize
name: Summarize for audience
templates:
  - id: default
    type: md
    path: template.md
variables:
  tone:
    type: enum
    selector:
      source: static
      options:
        - id: concise
          label: Concise
        - id: friendly
          label: Friendly
`)

    expect(spec.id).toBe('summarize')
    expect(spec.templates[0].path).toBe('template.md')
    expect(spec.variables?.tone.type).toBe('enum')
  })

  test('rejects static selectors without options', () => {
    expect(() =>
      parsePromptYaml(`
id: bad
name: Bad
templates:
  - id: t
    type: md
    path: template.md
variables:
  tone:
    type: enum
    selector:
      source: static
`)
    ).toThrow()
  })
})
