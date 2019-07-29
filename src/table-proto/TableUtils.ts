import { CellLocation, TableLayout, TablePaneType } from './TableTypes';
import { Point, Rect, Size } from './Geo';

export function calculateTableSize(layout: TableLayout): Size {
  let width = 0;
  for (const colWidth of layout.colWidths) {
    width += colWidth;
  }
  return { height: layout.rowHeight, width };
}

export function convertFromTableCoordinates(
  toPane: TablePaneType,
  tableLocation: CellLocation,
  layout: TableLayout,
): CellLocation {
  switch (toPane) {
    case 'locked-header':
      return tableLocation;
    case 'locked-body':
      return {
        col: tableLocation.col,
        row: tableLocation.row - layout.headerRowCount,
      };
    case 'free-header':
      return {
        col: tableLocation.col - layout.lockedColCount,
        row: tableLocation.row,
      };
    case 'free-body':
      return {
        col: tableLocation.col - layout.lockedColCount,
        row: tableLocation.row - layout.headerRowCount,
      };
  }
}

export function convertToTableCoordinates(
  fromPane: TablePaneType,
  localLocation: CellLocation,
  layout: TableLayout,
): CellLocation {
  switch (fromPane) {
    case 'locked-header':
      return localLocation;
    case 'locked-body':
      return {
        col: localLocation.col,
        row: localLocation.row + layout.headerRowCount,
      };
    case 'free-header':
      return {
        col: localLocation.col + layout.lockedColCount,
        row: localLocation.row,
      };
    case 'free-body':
      return {
        col: localLocation.col + layout.lockedColCount,
        row: localLocation.row + layout.headerRowCount,
      };
  }
}

export function calculateRectForPane(
  paneType: TablePaneType,
  layout: TableLayout,
): Rect {
  const lockedHeaderSize = calculateSizeForPane('locked-header', layout);
  const size = calculateSizeForPane(paneType, layout);
  switch (paneType) {
    case 'locked-header':
      return { origin: { x: 0, y: 0 }, size };

    case 'locked-body':
      return { origin: { x: 0, y: lockedHeaderSize.height }, size };

    case 'free-header':
      return { origin: { x: lockedHeaderSize.width, y: 0 }, size };

    case 'free-body':
      return {
        origin: { x: lockedHeaderSize.width, y: lockedHeaderSize.height },
        size,
      };
  }
}

export function calculateSizeForPane(
  paneType: TablePaneType,
  layout: TableLayout,
): Size {
  switch (paneType) {
    case 'locked-header':
      return calculateSizeLockedHeader(layout);
    case 'locked-body':
      return calculateSizeLockedBody(layout);
    case 'free-header':
      return calculateSizeFreeHeader(layout);
    case 'free-body':
      return calculateSizeFreeBody(layout);
  }
}

export function calculateSizeForCells(
  minLocation: CellLocation,
  maxLocation: CellLocation,
  layout: TableLayout,
): Size {
  if (minLocation.row > maxLocation.row || minLocation.col > maxLocation.col) {
    return { height: 0, width: 0 };
  }

  if (minLocation.row < 0 || maxLocation.row >= layout.numRows) {
    throw Error('location out of bounds');
  }
  if (minLocation.col < 0 || maxLocation.col >= layout.numCols) {
    throw Error('location out of bounds');
  }

  const height = (maxLocation.row - minLocation.row + 1) * layout.rowHeight;

  let width = 0;
  for (let i = minLocation.col; i <= maxLocation.col; ++i) {
    width += layout.colWidths[i];
  }

  return { height, width };
}

export function calculateOriginForCell(
  location: CellLocation,
  layout: TableLayout,
): Point {
  let x: number = 0;

  for (let i = 0; i < location.col; ++i) {
    x += layout.colWidths[i];
  }

  return { x, y: location.row * layout.rowHeight };
}

function calculateSizeLockedHeader(layout: TableLayout): Size {
  let width = 0;
  for (let i = 0; i < layout.lockedColCount; ++i) {
    width += layout.colWidths[i];
  }

  return {
    height: layout.rowHeight * layout.headerRowCount,
    width,
  };
}

function calculateSizeLockedBody(layout: TableLayout): Size {
  let width = 0;
  for (let i = 0; i < layout.lockedColCount; ++i) {
    width += layout.colWidths[i];
  }
  return {
    height: layout.rowHeight * (layout.numRows - layout.headerRowCount),
    width,
  };
}

function calculateSizeFreeHeader(layout: TableLayout): Size {
  let width = 0;
  for (let i = layout.lockedColCount; i < layout.numCols; ++i) {
    width += layout.colWidths[i];
  }
  return {
    height: layout.rowHeight * layout.headerRowCount,
    width,
  };
}

function calculateSizeFreeBody(layout: TableLayout): Size {
  let width = 0;
  for (let i = layout.lockedColCount; i < layout.numCols; ++i) {
    width += layout.colWidths[i];
  }

  return {
    height: layout.rowHeight * (layout.numRows - layout.headerRowCount),
    width,
  };
}

export function calculatePaneForCellLocation(
  cellLocation: CellLocation,
  layout: TableLayout,
): TablePaneType {
  const isLockedRow = cellLocation.row < layout.headerRowCount;
  const isLockedCol = cellLocation.col < layout.lockedColCount;

  return isLockedRow
    ? isLockedCol
      ? 'locked-header'
      : 'free-header'
    : isLockedCol
    ? 'locked-body'
    : 'free-body';
}
