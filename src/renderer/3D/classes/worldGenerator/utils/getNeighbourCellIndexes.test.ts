import { describe, it, expect } from 'vitest';

import { getNeighbourCellIndexes } from './getNeighbourCellIndexes';

// All expectations below are worked out against a 3x3 grid laid out as:
//   0 1 2
//   3 4 5
//   6 7 8

describe('getNeighbourCellIndexes', () => {
  it('returns all 8 surrounding cells for a cell in the middle of the grid', () => {
    const neighbours = getNeighbourCellIndexes(1, 1, 3, 3);

    expect(neighbours).toHaveLength(8);
    expect(neighbours.sort((a, b) => a - b)).toEqual([0, 1, 2, 3, 5, 6, 7, 8]);
  });

  it('omits the left-side neighbours for a cell on the left edge', () => {
    const neighbours = getNeighbourCellIndexes(0, 1, 3, 3);

    expect(neighbours.sort((a, b) => a - b)).toEqual([0, 1, 4, 6, 7]);
  });

  it('omits the right-side neighbours for a cell on the right edge', () => {
    const neighbours = getNeighbourCellIndexes(2, 1, 3, 3);

    expect(neighbours.sort((a, b) => a - b)).toEqual([1, 2, 4, 7, 8]);
  });

  it('omits the top-side neighbours for a cell on the top edge', () => {
    const neighbours = getNeighbourCellIndexes(1, 0, 3, 3);

    expect(neighbours.sort((a, b) => a - b)).toEqual([0, 2, 3, 4, 5]);
  });

  it('omits the bottom-side neighbours for a cell on the bottom edge', () => {
    const neighbours = getNeighbourCellIndexes(1, 2, 3, 3);

    expect(neighbours.sort((a, b) => a - b)).toEqual([3, 4, 5, 6, 8]);
  });

  it('only returns the 3 valid neighbours for the top-left corner', () => {
    const neighbours = getNeighbourCellIndexes(0, 0, 3, 3);

    expect(neighbours.sort((a, b) => a - b)).toEqual([1, 3, 4]);
  });

  it('only returns the 3 valid neighbours for the top-right corner', () => {
    const neighbours = getNeighbourCellIndexes(2, 0, 3, 3);

    expect(neighbours.sort((a, b) => a - b)).toEqual([1, 4, 5]);
  });

  it('only returns the 3 valid neighbours for the bottom-left corner', () => {
    const neighbours = getNeighbourCellIndexes(0, 2, 3, 3);

    expect(neighbours.sort((a, b) => a - b)).toEqual([3, 4, 7]);
  });

  it('only returns the 3 valid neighbours for the bottom-right corner', () => {
    const neighbours = getNeighbourCellIndexes(2, 2, 3, 3);

    expect(neighbours.sort((a, b) => a - b)).toEqual([4, 5, 7]);
  });

  it('returns no neighbours for a 1x1 grid', () => {
    expect(getNeighbourCellIndexes(0, 0, 1, 1)).toEqual([]);
  });

  it('treats width and depth independently for non-square grids', () => {
    // 4 wide, 2 deep grid:
    //   0 1 2 3
    //   4 5 6 7
    const neighbours = getNeighbourCellIndexes(2, 0, 4, 2);

    expect(neighbours.sort((a, b) => a - b)).toEqual([1, 3, 5, 6, 7]);
  });
});
