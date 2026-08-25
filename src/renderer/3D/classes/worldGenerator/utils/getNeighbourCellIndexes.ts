import { vec2toIndex } from './vec2ToIndex';

export function getNeighbourCellIndexes(
  x: number,
  z: number,
  width: number,
  depth: number
): number[] {
  const neighbourIndexes: number[] = [];

  const isLeftEdge = x === 0;
  const isTopEdge = z === 0;
  const isRightEdge = x === width - 1;
  const isBottomEdge = z === depth - 1;

  if (!isLeftEdge) {
    neighbourIndexes.push(vec2toIndex(x - 1, z, width)); // Left middle
    if (!isTopEdge) neighbourIndexes.push(vec2toIndex(x - 1, z - 1, width)); // Left top
    if (!isBottomEdge) neighbourIndexes.push(vec2toIndex(x - 1, z + 1, width)); // Left bottom
  }

  if (!isRightEdge) {
    neighbourIndexes.push(vec2toIndex(x + 1, z, width)); // Right middle
    if (!isTopEdge) neighbourIndexes.push(vec2toIndex(x + 1, z - 1, width)); // Right top
    if (!isBottomEdge) neighbourIndexes.push(vec2toIndex(x + 1, z + 1, width)); // Right bottom
  }

  if (!isTopEdge) {
    neighbourIndexes.push(vec2toIndex(x, z - 1, width)); // Middle top
  }

  if (!isBottomEdge) {
    neighbourIndexes.push(vec2toIndex(x, z + 1, width)); // Middle bottom
  }

  return neighbourIndexes;
}
