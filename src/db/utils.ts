export function firstOrUndefined<T>(items: T[]) {
    if (items.length === 0) {
        return;
    }
    return items[0];
}

export function omitParams<T extends object, K extends keyof T>(
    obj: T,
    keys: K[]
): Omit<T, K> {
    const results = { ...obj };
    for (const key of keys) {
        delete results[key];
    }
    return results;
}