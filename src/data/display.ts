const MODEL_NAMES: Record<string, string> = {
  'claude-sonnet-5': 'Sonnet 5',
  'claude-sonnet-4-6': 'Sonnet 4.6',
  'claude-sonnet-4-5-20250929': 'Sonnet 4.5',
  'claude-haiku-4-5-20251001': 'Haiku 4.5',
  'claude-opus-5': 'Opus 5',
  'claude-opus-4-8': 'Opus 4.8',
  'claude-opus-4-7': 'Opus 4.7',
  'claude-opus-4-6': 'Opus 4.6',
  'claude-opus-4-1': 'Opus 4.1',
  'claude-fable-5': 'Fable 5',
  'claude-fable-5-1': 'Fable 5.1',
  'claude-3-opus': 'Opus 3',
  'no-model': 'No model',
}

export function displayModel(model: string): string {
  if (!model) return 'Unknown'
  return MODEL_NAMES[model] ?? model.replace(/^claude-/, '').replace(/-/g, ' ')
}

export function displayPerson(email: string): string {
  const local = email.split('@')[0] ?? email
  return local
    .split('.')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export function personInitials(email: string): string {
  const name = displayPerson(email)
  const parts = name.split(' ').filter(Boolean)
  const first = parts[0]?.[0] ?? '?'
  const last = parts.length > 1 ? parts[parts.length - 1][0] : (parts[0]?.[1] ?? '')
  return `${first}${last}`.toUpperCase()
}

const PERSON_COLORS = ['#074E9F', '#0086C9', '#07A721', '#8A95A8', '#667085', '#0A5CAD', '#34B4E0', '#00964C']

export function personColor(email: string): string {
  let hash = 0
  for (let i = 0; i < email.length; i += 1) {
    hash = (hash * 31 + email.charCodeAt(i)) >>> 0
  }
  return PERSON_COLORS[hash % PERSON_COLORS.length] ?? PERSON_COLORS[0]
}
