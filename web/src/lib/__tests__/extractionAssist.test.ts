import { describe, expect, test } from 'vitest'
import { createExtractionProposal } from '../extractionAssist'

describe('createExtractionProposal', () => {
  test('normalizes explicit placeholders and infers types', async () => {
    const result = await createExtractionProposal({
      template: 'Rewrite {input_text} in a [tone] style.',
      existingVariables: [],
    })

    expect(result.normalizedTemplate).toContain('{{ input_text }}')
    expect(result.detectedNames).toContain('input_text')
    expect(result.detectedNames).toContain('tone')
    expect(result.addedVariables.find((v) => v.name === 'tone')?.type).toBe('enum')
  })

  test('infers recipient and topic from email phrasing', async () => {
    const result = await createExtractionProposal({
      template: 'Write an email to Alex Chen about Q2 pricing update.',
      existingVariables: [],
    })

    expect(result.normalizedTemplate).toContain('{{recipient_name}}')
    expect(result.normalizedTemplate).toContain('{{topic}}')
    expect(result.detectedNames).toEqual(expect.arrayContaining(['recipient_name', 'topic']))
  })

  test('reuses existing variable definitions', async () => {
    const result = await createExtractionProposal({
      template: 'Tone: concise\n\n{{input_text}}',
      existingVariables: [
        {
          name: 'tone',
          type: 'enum',
          required: true,
          defaultValue: 'direct',
          options: ['direct', 'friendly'],
        },
      ],
    })

    const tone = result.referencedVariables.find((v) => v.name === 'tone')
    expect(tone?.defaultValue).toBe('direct')
    expect(tone?.options).toEqual(['direct', 'friendly'])
  })

  test('tracks unreferenced variables without deleting them', async () => {
    const result = await createExtractionProposal({
      template: 'Summarize {{notes}} for {{audience}}.',
      existingVariables: [
        { name: 'notes', type: 'text', required: true, defaultValue: '' },
        { name: 'audience', type: 'enum', required: true, defaultValue: 'execs', options: ['execs', 'engineering'] },
        { name: 'context', type: 'text', required: false, defaultValue: '' },
      ],
    })

    expect(result.unreferencedVariables.map((v) => v.name)).toContain('context')
  })
})
