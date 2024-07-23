export const truthy = <T>(value: T | null | false | undefined | '' | void): value is T => !!value

export const removeNulls = <V>(obj: Record<string, V | null>) =>
  filterValues(obj, (v): v is V => v !== null)

export const removeUndefined = <V>(obj: Record<string, V | undefined>) =>
  filterValues(obj, (v): v is V => v !== undefined)

export const isInstanceOf = <T extends Function>(cls: T) =>

  (obj => obj instanceof cls) as T extends new(...args: any[]) => infer R ? (obj: unknown) => obj is R : never

export function filterValues<V, F extends V>(
  obj: Readonly<Record<string, V>>,
  predicate: (value: V, key: string) => value is F,
): Record<string, F>
export function filterValues<V>(
  obj: Readonly<Record<string, V>>,
  predicate: (value: V, key: string) => boolean,
): Record<string, V>
export function filterValues<V>(
  obj: Readonly<Record<string, V>>,
  predicate: (value: V, key: string) => boolean,
): Record<string, V> {
  const next: Record<string, V> = {}
  for (const key of Object.keys(obj)) {
    const value = obj[key]
    if (predicate(value, key)) {
      next[key] = value
    }
  }

  return next
}

/**
 * Flattens an array of arrays into a single-dimensional array.
 */
export function flatten<T>(items: readonly (readonly T[])[]): T[] {
  let out: T[] = []
  for (const list of items) {
    out = out.concat(list)
  }

  return out
}

/**
 * Picks the subset of keys from the object.
 */
export function pick<T>(obj: T, keys: readonly (keyof T)[]): Partial<T> {
  const partial: Partial<T> = {}
  for (const key of keys) {
    partial[key] = obj[key]
  }

  return partial
}
