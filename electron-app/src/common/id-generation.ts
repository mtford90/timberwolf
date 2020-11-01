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

export function generateName(
  preferredName: string,
  existingNames: string[] = []
) {
  if (!existingNames.includes(preferredName)) {
    return preferredName;
  }

  const numExisting = existingNames.filter((name) =>
    name.startsWith(preferredName)
  ).length;

  return `${preferredName} (${numExisting})`;
}
