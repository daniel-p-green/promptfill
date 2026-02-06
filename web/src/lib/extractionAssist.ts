export type ExtractionVariableType = 'string' | 'text' | 'number' | 'boolean' | 'enum'

export type ExtractionVariable = {
  name: string
  type: ExtractionVariableType
  required: boolean
  defaultValue: string
  options?: string[]
}

export type ExtractionAssistRequest = {
  template: string
  existingVariables: ExtractionVariable[]
}

export type ExtractionAssistResult = {
  source: 'heuristic-ai-assist'
  currentTemplate: string
  normalizedTemplate: string
  detectedNames: string[]
  addedVariables: ExtractionVariable[]
  referencedVariables: ExtractionVariable[]
  unreferencedVariables: ExtractionVariable[]
  inferenceNotes: string[]
}

const placeholderRegex = /\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g

const enumOptionSets: Record<string, string[]> = {
  tone: ['concise', 'friendly', 'direct', 'formal'],
  audience: ['execs', 'engineering', 'sales', 'customers'],
  format: ['bullets', 'paragraphs', 'email', 'slack_update'],
  length: ['short', 'medium', 'long'],
  language: ['english', 'spanish', 'french', 'german'],
  relationship: ['customer', 'investor', 'coworker', 'friend'],
  doc_type: ['prd', 'brief', 'one_pager'],
  risk_profile: ['strict', 'balanced', 'fast'],
  output_format: ['bullets', 'annotated'],
  tone_style: ['friendly', 'crisp', 'executive', 'casual'],
}

const normalizeName = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')

const normalizeTemplate = (template: string) => {
  const sentinel = '__PROMPTFILL_EXTRACT__'
  const captured: string[] = []
  let counter = 0

  const preserved = template.replace(/\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g, (_match, name: string) => {
    const token = `${sentinel}${counter}__`
    captured.push(name)
    counter += 1
    return token
  })

  const normalized = preserved
    .replace(/\[([a-zA-Z0-9_.-]+)\]/g, '{{ $1 }}')
    .replace(/<([a-zA-Z0-9_.-]+)>/g, '{{ $1 }}')
    .replace(/\{([a-zA-Z0-9_.-]+)\}/g, '{{ $1 }}')

  return normalized.replace(new RegExp(`${sentinel}(\\d+)__`, 'g'), (_match, index) => {
    const name = captured[Number(index)]
    return `{{${name}}}`
  })
}

const extractNames = (template: string) => {
  const names: string[] = []
  const seen = new Set<string>()
  let match: RegExpExecArray | null = null
  placeholderRegex.lastIndex = 0
  while ((match = placeholderRegex.exec(template)) !== null) {
    const normalized = normalizeName(match[1])
    if (!normalized || seen.has(normalized)) continue
    seen.add(normalized)
    names.push(normalized)
  }
  return names
}

const inferVariable = (name: string): ExtractionVariable => {
  const lower = name.toLowerCase()

  if (enumOptionSets[lower]) {
    return {
      name,
      type: 'enum',
      required: true,
      defaultValue: enumOptionSets[lower][0],
      options: enumOptionSets[lower],
    }
  }

  if (/(tone|audience|format|length|language|relationship|profile|style)/.test(lower)) {
    const fallback = enumOptionSets.tone
    return {
      name,
      type: 'enum',
      required: true,
      defaultValue: fallback[0],
      options: fallback,
    }
  }

  if (/(max_|count|num|total|bullets?|items?|lines?|days?|months?|years?)/.test(lower)) {
    return { name, type: 'number', required: false, defaultValue: '5' }
  }

  if (/(include|exclude|is_|has_|preserve_|allow_|enable_)/.test(lower)) {
    return { name, type: 'boolean', required: false, defaultValue: lower.startsWith('preserve_') ? 'true' : 'false' }
  }

  if (/(notes|context|transcript|thread|body|input|message|diff|source|schema|constraints|benefits)/.test(lower)) {
    return { name, type: 'text', required: false, defaultValue: '' }
  }

  return { name, type: 'string', required: true, defaultValue: '' }
}

const addInferredWithoutRewrite = (
  template: string,
  names: Set<string>,
  notes: string[]
) => {
  const maybeAdd = (name: string, reason: string, rule: RegExp) => {
    if (names.has(name)) return
    if (!rule.test(template)) return
    names.add(name)
    notes.push(reason)
  }

  maybeAdd('context', 'Inferred {{context}} from context language.', /\bcontext\b/i)
  maybeAdd('notes', 'Inferred {{notes}} from notes language.', /\bnotes?\b/i)
  maybeAdd('cta', 'Inferred {{cta}} from CTA language.', /\bcta\b/i)
  maybeAdd('customer_message', 'Inferred {{customer_message}} from support phrasing.', /customer\s+message/i)
  maybeAdd('diff', 'Inferred {{diff}} from code-review phrasing.', /\bdiff\b/i)
  maybeAdd('source_text', 'Inferred {{source_text}} from transcript/source phrasing.', /\b(source\s+text|transcript)\b/i)
}

const applySmartReplacements = (template: string, names: Set<string>, notes: string[]) => {
  let nextTemplate = template

  const replaceLabelValue = (label: string, variableName: string, note: string) => {
    if (names.has(variableName)) return
    const pattern = new RegExp(`(\\b${label}\\s*:\\s*)([^\\n.,;]+)`, 'i')
    const match = nextTemplate.match(pattern)
    if (!match) return
    const raw = match[2].trim()
    if (!raw || raw.includes('{')) return
    nextTemplate = nextTemplate.replace(pattern, `$1{{${variableName}}}`)
    names.add(variableName)
    notes.push(note)
  }

  replaceLabelValue('Tone', 'tone', 'Mapped labelled tone value to {{tone}}.')
  replaceLabelValue('Audience', 'audience', 'Mapped labelled audience value to {{audience}}.')
  replaceLabelValue('Format', 'format', 'Mapped labelled format value to {{format}}.')
  replaceLabelValue('Length', 'length', 'Mapped labelled length value to {{length}}.')
  replaceLabelValue('Language', 'language', 'Mapped labelled language value to {{language}}.')
  replaceLabelValue('Risk profile', 'risk_profile', 'Mapped labelled risk profile to {{risk_profile}}.')
  replaceLabelValue('Output format', 'output_format', 'Mapped labelled output format to {{output_format}}.')

  if (!names.has('recipient_name')) {
    const emailToPattern = /(write\s+an?\s+email\s+to\s+)([^,\n.]+?)(?=\s+about\b|[,\n.])/i
    const emailMatch = nextTemplate.match(emailToPattern)
    if (emailMatch) {
      const candidate = emailMatch[2].trim()
      if (candidate && !candidate.includes('{') && candidate.length <= 80) {
        nextTemplate = nextTemplate.replace(emailToPattern, `$1{{recipient_name}}`)
        names.add('recipient_name')
        notes.push('Inferred {{recipient_name}} from email-recipient phrasing.')
      }
    }
  }

  if (!names.has('topic')) {
    const aboutPattern = /(\babout\s+)([^,\n.]+?)(?=[,\n.]|$)/i
    const aboutMatch = nextTemplate.match(aboutPattern)
    if (aboutMatch) {
      const candidate = aboutMatch[2].trim()
      if (candidate && !candidate.includes('{') && candidate.length <= 100) {
        nextTemplate = nextTemplate.replace(aboutPattern, `$1{{topic}}`)
        names.add('topic')
        notes.push('Inferred {{topic}} from “about …” phrasing.')
      }
    }
  }

  if (!names.has('audience')) {
    const audiencePattern = /(\bfor\s+)(executives?|execs?|engineering|sales|customers|leadership|stakeholders)(\b)/i
    if (audiencePattern.test(nextTemplate)) {
      nextTemplate = nextTemplate.replace(audiencePattern, '$1{{audience}}$3')
      names.add('audience')
      notes.push('Inferred {{audience}} from target-audience phrasing.')
    }
  }

  if (!names.has('max_bullets')) {
    const maxBulletsPattern = /(max(?:imum)?\s+bullets?\s*:\s*)(\d+)/i
    if (maxBulletsPattern.test(nextTemplate)) {
      nextTemplate = nextTemplate.replace(maxBulletsPattern, '$1{{max_bullets}}')
      names.add('max_bullets')
      notes.push('Inferred {{max_bullets}} from numeric bullet constraint.')
    }
  }

  addInferredWithoutRewrite(nextTemplate, names, notes)

  return nextTemplate
}

export async function createExtractionProposal(
  request: ExtractionAssistRequest
): Promise<ExtractionAssistResult> {
  const normalizedTemplate = normalizeTemplate(request.template)
  const explicitNames = extractNames(normalizedTemplate)
  const inferredNames = new Set<string>(explicitNames)
  const notes: string[] = []

  const smartTemplate = applySmartReplacements(normalizedTemplate, inferredNames, notes)
  const detectedNames = extractNames(smartTemplate)

  for (const name of inferredNames) {
    if (!detectedNames.includes(name)) detectedNames.push(name)
  }

  const existingByName = new Map(request.existingVariables.map((variable) => [variable.name, variable]))

  const referencedVariables = detectedNames.map((name) => existingByName.get(name) || inferVariable(name))
  const addedVariables = referencedVariables.filter((variable) => !existingByName.has(variable.name))
  const unreferencedVariables = request.existingVariables.filter(
    (variable) => !detectedNames.includes(variable.name)
  )

  if (addedVariables.length === 0) {
    notes.push('No new variables inferred. Existing schema appears up to date.')
  }

  return {
    source: 'heuristic-ai-assist',
    currentTemplate: request.template,
    normalizedTemplate: smartTemplate,
    detectedNames,
    addedVariables,
    referencedVariables,
    unreferencedVariables,
    inferenceNotes: notes,
  }
}
