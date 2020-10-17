/**
 * Converts a name into a lower kebab case identifier, ensuring uniqueness.
 */
export function generateIdentifier(name: string, existing: string[] = []) {
  const preferredId = name.toLowerCase().replace(/\s+/, "-");
  if (!existing.includes(preferredId)) {
    return preferredId;
  }

  const numExisting = existing.filter((id) => id.startsWith(preferredId))
    .length;

  return `${preferredId}-${numExisting}`;
}
