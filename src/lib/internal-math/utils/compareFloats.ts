type ComparisonType = '===' | '!==' | '<' | '<=' | '>' | '>=';

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
    case '===':
      return absDiff < epsilon * scale;
    case '!==':
      return absDiff >= epsilon * scale;
    case '<':
      return diff < -epsilon * scale;
    case '<=':
      return diff < epsilon * scale;
    case '>':
      return diff > epsilon * scale;
    case '>=':
      return diff > -epsilon * scale;
    default:
      throw new Error(`Unknown comparison type: ${comparison}`);
  }
}
