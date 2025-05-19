export default function includesAll<T>(a: T[], b: T[]): boolean {
  const aCount: Record<string, number> = {};
  const bCount: Record<string, number> = {};

  for (const item of a) {
    const key = JSON.stringify(item);
    aCount[key] = (aCount[key] || 0) + 1;
  }

  for (const item of b) {
    const key = JSON.stringify(item);
    bCount[key] = (bCount[key] || 0) + 1;
  }

  for (const key in bCount) {
    if (!aCount[key] || aCount[key] < bCount[key]) return false;
  }

  return true;
}
