const pick = <T extends Record<string, unknown>, K extends keyof T>(
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
  // ✅ full console log with label + pretty JSON
  // console.log("🎯 Picked Object:", JSON.stringify(finalObj, null, 2));
  console.log('🎯 Picked Object:', finalObj);
  return finalObj;
};

export default pick;
