/** Site-neutral deterministic utilities only. No I/O, tenant singleton or visual decisions. */
export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}
