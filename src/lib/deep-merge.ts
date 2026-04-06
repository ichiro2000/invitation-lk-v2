/**
 * Deep merge two plain objects. Source values override target values.
 * Arrays are replaced wholesale (not merged element-by-element).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function deepMerge<T>(target: T, source: any): T {
  if (!source || typeof source !== "object" || Array.isArray(source)) return target;
  if (!target || typeof target !== "object" || Array.isArray(target)) return source;

  const result = { ...target } as Record<string, unknown>;

  for (const key of Object.keys(source)) {
    const sourceVal = source[key];
    const targetVal = (target as Record<string, unknown>)[key];

    if (
      sourceVal !== undefined &&
      sourceVal !== null &&
      typeof sourceVal === "object" &&
      !Array.isArray(sourceVal) &&
      typeof targetVal === "object" &&
      targetVal !== null &&
      !Array.isArray(targetVal)
    ) {
      result[key] = deepMerge(targetVal, sourceVal);
    } else if (sourceVal !== undefined) {
      result[key] = sourceVal;
    }
  }

  return result as T;
}
