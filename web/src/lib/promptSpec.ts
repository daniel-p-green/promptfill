import yaml from 'js-yaml'
import { z } from 'zod'

export const VariableType = z.enum([
  'string',
  'text',
  'number',
  'boolean',
  'enum',
  'multi_enum',
  'date',
  'json',
  'secret',
])

export const SelectorSource = z.enum(['static', 'file', 'api'])

export const SelectorStaticOption = z.object({
  id: z.string(),
  label: z.string(),
  description: z.string().optional(),
  group: z.string().optional(),
})

export const SelectorSchema = z
  .object({
    source: SelectorSource,
    // static
    options: z.array(SelectorStaticOption).optional(),
    // file
    path: z.string().optional(),
    valueKey: z.string().optional(),
    labelKey: z.string().optional(),
    // api
    url: z.string().optional(),
    cacheTtlSeconds: z.number().int().positive().optional(),
  })
  .refine(
    (s) => (s.source === 'static' ? Array.isArray(s.options) && s.options.length > 0 : true),
    { message: 'static selector requires non-empty options' }
  )
  .refine((s) => (s.source === 'file' ? !!s.path : true), {
    message: 'file selector requires path',
  })
  .refine((s) => (s.source === 'api' ? !!s.url : true), {
    message: 'api selector requires url',
  })

export const VariableSchema = z.object({
  type: VariableType,
  label: z.string().optional(),
  required: z.boolean().optional(),
  placeholder: z.string().optional(),
  default: z.any().optional(),
  selector: SelectorSchema.optional(),
})

export const TemplateSchema = z.object({
  id: z.string(),
  type: z.enum(['txt', 'md', 'xml']).default('md'),
  path: z.string(),
})

export const PromptYamlSchema = z.object({
  id: z.string(),
  name: z.string(),
  version: z.string().optional(),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
  templates: z.array(TemplateSchema).min(1),
  variables: z.record(z.string(), VariableSchema).optional(),
})

export type PromptYaml = z.infer<typeof PromptYamlSchema>

export function parsePromptYaml(text: string): PromptYaml {
  // js-yaml may return objects with unusual prototypes; normalize to plain JSON.
  const data = yaml.load(text)
  const normalized = JSON.parse(JSON.stringify(data))
  return PromptYamlSchema.parse(normalized)
}
