export const removeFalsy = <T extends Record<string, unknown>>(obj: T): Partial<T> =>
  Object.fromEntries(Object.entries(obj).filter(([, value]) => Boolean(value))) as Partial<T>;
