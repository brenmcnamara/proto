import * as Utils from '../TableUtils';

import { TableLayout } from '../TableTypes';

const StandardLayout: TableLayout = {
  colWidths: generateUniformColWidths(250, 50),
  headerRowCount: 1,
  lockedColCount: 1,
  numCols: 50,
  numRows: 50,
  rowHeight: 32,
};

test('convertFromTableCoordinates correctly converts to locked-header', () => {
  const table = { col: 1, row: 1 };
  const local = Utils.convertFromTableCoordinates(
    'locked-header',
    table,
    StandardLayout,
  );

  expect(local).toEqual({ col: 1, row: 1 });
});

test('convertFromTableCoordinates correctly converts to locked-body', () => {
  const table = { col: 1, row: 1 };

  const local1 = Utils.convertFromTableCoordinates(
    'locked-body',
    table,
    StandardLayout,
  );
  const local2 = Utils.convertFromTableCoordinates('locked-body', table, {
    ...StandardLayout,
    headerRowCount: 2,
  });

  expect(local1).toEqual({ col: 1, row: 0 });
  expect(local2).toEqual({ col: 1, row: -1 });
});

test('convertFromTableCoordinates correctly converts to free-header', () => {
  const table = { col: 3, row: 4 };

  const local1 = Utils.convertFromTableCoordinates(
    'free-header',
    table,
    StandardLayout,
  );

  const local2 = Utils.convertFromTableCoordinates('free-header', table, {
    ...StandardLayout,
    lockedColCount: 2,
  });

  expect(local1).toEqual({ col: 2, row: 4 });
  expect(local2).toEqual({ col: 1, row: 4 });
});

test('convertFromTableCoordinates correctly converts to free-body', () => {
  const table = { col: 2, row: 5 };

  const local1 = Utils.convertFromTableCoordinates(
    'free-body',
    table,
    StandardLayout,
  );

  const local2 = Utils.convertFromTableCoordinates('free-body', table, {
    ...StandardLayout,
    headerRowCount: 3,
    lockedColCount: 2,
  });

  expect(local1).toEqual({ col: 1, row: 4 });
  expect(local2).toEqual({ col: 0, row: 2 });
});

test('convertToTableCoordinates correctly converts from locked-header', () => {
  const local = { col: 1, row: 3 };
  const table = Utils.convertToTableCoordinates(
    'locked-header',
    local,
    StandardLayout,
  );

  expect(table).toEqual({ col: 1, row: 3 });
});

test('convertToTableCoordinates correctly converts from locked-body', () => {
  const local = { col: 2, row: 4 };

  const table1 = Utils.convertToTableCoordinates(
    'locked-body',
    local,
    StandardLayout,
  );

  const table2 = Utils.convertToTableCoordinates('locked-body', local, {
    ...StandardLayout,
    headerRowCount: 2,
  });

  expect(table1).toEqual({ col: 2, row: 5 });
  expect(table2).toEqual({ col: 2, row: 6 });
});

test('convertToTableCoordinates correctly converts from free-header', () => {
  const local = { col: 7, row: 2 };

  const table1 = Utils.convertToTableCoordinates(
    'free-header',
    local,
    StandardLayout,
  );

  const table2 = Utils.convertToTableCoordinates('free-header', local, {
    ...StandardLayout,
    lockedColCount: 4,
  });

  expect(table1).toEqual({ col: 8, row: 2 });
  expect(table2).toEqual({ col: 11, row: 2 });
});

test('convertToTableCoordinates correctly converts from free-body', () => {
  const local = { col: 4, row: 5 };

  const table1 = Utils.convertToTableCoordinates(
    'free-body',
    local,
    StandardLayout,
  );

  const table2 = Utils.convertToTableCoordinates('free-body', local, {
    ...StandardLayout,
    headerRowCount: 3,
    lockedColCount: 8,
  });

  expect(table1).toEqual({ col: 5, row: 6 });
  expect(table2).toEqual({ col: 12, row: 8 });
});

test('calculateSizeForCells calculates the size of a rectangular region of cells with uniform sizes', () => {
  const size1 = Utils.calculateSizeForCells(
    { col: 2, row: 4 },
    { col: 3, row: 6 },
    StandardLayout,
  );
  expect(size1).toEqual({ width: 250 * 2, height: 32 * 3 });
});

test('calculateSizeForCells calculates the size for a single cell', () => {
  const size = Utils.calculateSizeForCells(
    { col: 2, row: 6 },
    { col: 2, row: 6 },
    StandardLayout,
  );
  expect(size).toEqual({ width: 250, height: 32 });
});

test('calculateSizeForCells calculates the size of a rectangular region of cells with non-uniform sizes', () => {
  const NonUniformLayout = {
    ...StandardLayout,
    colWidths: generateModuloColWidths([50, 100, 150], StandardLayout.numCols),
  };

  const size = Utils.calculateSizeForCells(
    { col: 3, row: 4 },
    { col: 7, row: 5 },
    NonUniformLayout,
  );

  expect(size).toEqual({ width: 50 + 100 + 150 + 50 + 100, height: 32 * 2 });
});

test('calculateSizeForCells returns 0 for regions where the minLocation comes after the maxLocation', () => {
  const size1 = Utils.calculateSizeForCells(
    { col: 2, row: 3 },
    { col: 1, row: 4 },
    StandardLayout,
  );

  const size2 = Utils.calculateSizeForCells(
    { col: 2, row: 4 },
    { col: 3, row: 3 },
    StandardLayout,
  );

  expect(size1).toEqual({ height: 0, width: 0 });
  expect(size2).toEqual({ height: 0, width: 0 });
});

test('calculateSizeForCells throws error when using a location that is outside the bounds of the table', () => {
  expect(() =>
    Utils.calculateSizeForCells(
      { col: 0, row: 0 },
      { col: 0, row: StandardLayout.numRows + 1 },
      StandardLayout,
    ),
  ).toThrow();

  expect(() =>
    Utils.calculateSizeForCells(
      { col: 10, row: 10 },
      { col: StandardLayout.numCols + 1, row: 20 },
      StandardLayout,
    ),
  ).toThrow();
});

function generateUniformColWidths(widthPx: number, numCols: number): number[] {
  const colWidths = [];
  for (let i = 0; i < numCols; ++i) {
    colWidths.push(widthPx);
  }
  return colWidths;
}

function generateModuloColWidths(
  widthPxs: number[],
  numCols: number,
): number[] {
  const colWidths = [];
  for (let i = 0; i < numCols; ++i) {
    colWidths.push(widthPxs[i % widthPxs.length]);
  }
  return colWidths;
}
