/**
 * Example:
 * const filteredObject = pick(user, ["firstName", "lastName"]);
 * const filteredObject2 = pick(user, ["firstName", "lastName", "age"]);
 */
export const pick = <T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[],
): Partial<T> => {
  const finalObj: Partial<T> = {};
  for (const key of keys) {
    if (obj && Object.hasOwnProperty.call(obj, key)) {
      const value = obj[key];
      finalObj[key] = (typeof value === 'string' ? value.trim() : value) as T[K];
    }
  }
  console.log('🎯 Picked Object:', finalObj);
  return finalObj;
};

/**
 * Deep clone an object or array.
 *
 * @example
 * const obj = { name: "John", age: 30 };
 * const clonedObj = deepClone(obj);
 * console.log(clonedObj); // { name: "John", age: 30 }
 * clonedObj.name = "Mike";
 * console.log(obj); // { name: "John", age: 30 }
 */
export const deepClone = <T>(obj: T): T => JSON.parse(JSON.stringify(obj));

/**
 * Remove falsy values from an object or array.
 * Falsy values: null, undefined, "", 0, false.
 *
 * @example
 * // Object
 * const obj = { name: "John", age: 25, height: null, address: { city: "New York", state: "", country: null } };
 * const filteredObj = removeFalsy(obj);
 * console.log(filteredObj); // { name: "John", age: 25, address: { city: "New York" } }
 *
 * // Array
 * const arr = [1, 2, 3, null, undefined, "", 0, false];
 * const filteredArr = removeFalsy(arr);
 * console.log(filteredArr); // [1, 2, 3]
 *
 * // Nested Object
 * const obj2 = { name: "John", age: 30, address: { city: "New York", state: "NY", country: null } };
 * const filteredObj2 = removeFalsy(obj2);
 * console.log(filteredObj2); // { name: "John", age: 30, address: { city: "New York", state: "NY" } }
 *
 * // Nested Array
 * const arr2 = [[1, 2], [3, 4], null, undefined, "", 0, false];
 * const filteredArr2 = removeFalsy(arr2);
 * console.log(filteredArr2); // [[1, 2], [3, 4]]
 */
export const removeFalsy = <T extends Record<string, unknown>>(obj: T): Partial<T> =>
  Object.fromEntries(Object.entries(obj).filter(([, value]) => Boolean(value))) as Partial<T>;
