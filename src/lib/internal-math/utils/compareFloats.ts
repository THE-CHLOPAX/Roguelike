type ComparisonType =
  | 'equals'
  | 'not-equals'
  | 'less-than'
  | 'less-than-or-equals'
  | 'greater-than'
  | 'greater-than-or-equals';

export function compareFloats(
  a: number,
  comparison: ComparisonType,
  b: number,
  epsilon: number = Number.EPSILON
): boolean {
  const diff = a - b;
  const absDiff = Math.abs(diff);
  const scale = Math.max(1, Math.abs(a), Math.abs(b));

  switch (comparison) {
    case 'equals':
      return absDiff < epsilon * scale;
    case 'not-equals':
      return absDiff >= epsilon * scale;
    case 'less-than':
      return diff < -epsilon * scale;
    case 'less-than-or-equals':
      return diff < epsilon * scale;
    case 'greater-than':
      return diff > epsilon * scale;
    case 'greater-than-or-equals':
      return diff > -epsilon * scale;
    default:
      throw new Error(`Unknown comparison type: ${comparison}`);
  }
}
