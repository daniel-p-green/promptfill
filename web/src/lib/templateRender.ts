export type TemplateVars = Record<string, unknown>

// Minimal, safe template renderer for MVP.
// - Replaces occurrences of {{var}} with stringified values.
// - Missing variables render as empty string.
// - No code execution.
export function renderTemplate(template: string, vars: TemplateVars): string {
  return template.replace(/\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g, (_, key: string) => {
    const value = getPath(vars, key)
    if (value === undefined || value === null) return ''
    if (typeof value === 'string') return value
    if (typeof value === 'number' || typeof value === 'boolean') return String(value)
    return JSON.stringify(value)
  })
}

function getPath(obj: any, path: string): unknown {
  if (!obj) return undefined
  if (!path.includes('.')) return obj[path]
  return path.split('.').reduce((acc, part) => (acc == null ? undefined : acc[part]), obj)
}
