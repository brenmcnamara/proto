const POSSIBLE_COL_WIDTHS = [100, 150, 200, 300];

export function createUniformColWidths(
  numCols: number,
  width: number,
): number[] {
  const colWidths = [];
  for (let i = 0; i < numCols; ++i) {
    colWidths.push(width);
  }
  return colWidths;
}

export function createColWidths(numCols: number): number[] {
  const colWidths = [];
  for (let i = 0; i < numCols; ++i) {
    const index = Math.floor(Math.random() * POSSIBLE_COL_WIDTHS.length);
    colWidths.push(POSSIBLE_COL_WIDTHS[index]);
  }
  return colWidths;
}

export function nullthrows<T>(value: T | null | undefined): T {
  if (value === undefined || value === null) {
    throw Error('Expecting value to not be null or undefined');
  }
  return value;
}
