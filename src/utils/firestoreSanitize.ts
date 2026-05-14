export function sanitizeForFirestore<T>(value: T): T {
  if (value === undefined) {
    return value; // In root, we might not be able to return undefined if it's an object, but Firestore doesn't take undefined anyway. This function mainly cleans objects/arrays.
  }
  if (value === null) {
    return value;
  }
  if (typeof value === 'object') {
    if (value instanceof Date) {
      return value;
    }
    if (Array.isArray(value)) {
      const newArray: any[] = [];
      for (const item of value) {
        if (item !== undefined) {
          newArray.push(sanitizeForFirestore(item));
        }
      }
      return newArray as unknown as T;
    }
    const newObj: any = {};
    for (const key in value) {
      if (Object.prototype.hasOwnProperty.call(value, key)) {
        if (value[key] !== undefined) {
          newObj[key] = sanitizeForFirestore(value[key]);
        }
      }
    }
    return newObj as T;
  }
  return value;
}
