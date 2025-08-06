export function firstOrUndefined<T>(items: T[]) {
  if (items.length === 0) {
    return;
  }
  return items[0];
}

export function omitParams<T extends object, K extends keyof T>(
  obj: T,
  keys: K[],
): Omit<T, K> {
  const results = { ...obj };
  for (const key of keys) {
    // @TODO: Need a find a beter solution for the following line,
    // in the mean time just disable the lint warning. The next
    // comment line will disable the warning.

    // eslint-disable-next-line security/detect-object-injection
    delete results[key];
  }
  return results;
}
