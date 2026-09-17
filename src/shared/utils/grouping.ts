export interface ConsecutiveGroup<T> {
  groupId: string | null;
  items: T[];
}

export function groupConsecutiveBy<T>(
  items: T[],
  keyOf: (item: T) => string | null,
): Array<ConsecutiveGroup<T>> {
  const result: Array<ConsecutiveGroup<T>> = [];

  for (const item of items) {
    const key = keyOf(item);
    const last = result[result.length - 1];
    if (key !== null && last && last.groupId === key) {
      last.items.push(item);
    } else {
      result.push({ groupId: key, items: [item] });
    }
  }

  return result;
}
