/** Recharts v3 wraps row data in `payload` on click events. */
export function clickPayload<T extends Record<string, unknown>>(
  item: { payload?: T },
  index: number,
  fallback: T[],
): T | undefined {
  return item.payload ?? fallback[index]
}
