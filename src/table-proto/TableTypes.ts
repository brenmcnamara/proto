import { Point } from './Geo';

export interface CellLocation {
  col: number;
  row: number;
}

export type TableDragMode = 'v-scrollbar' | 'h-scrollbar' | 'selection';

export interface TableLayout {
  colWidths: number[];
  headerRowCount: number;
  lockedColCount: number;
  numCols: number;
  numRows: number;
  rowHeight: number;
}

export type TableColumnType = 'locked' | 'free';

export type ScrollDirection = 'vertical' | 'horizontal';

export type TableSelection = TableSelectionRegion[];

export interface TableSelectionRegion {
  backgroundColor: string;
  borderColor: string | null;
  endCell: CellLocation;
  isResizable: boolean;
  startCell: CellLocation;
}

export interface TableSelectionRegionHandleLocationSet {
  'bottom-left'?: true;
  'bottom-right'?: true;
  'top-left'?: true;
  'top-right'?: true;
}

export function isEqualRegions(
  r1: TableSelectionRegion,
  r2: TableSelectionRegion,
) {
  return shallowEquals(r1, r2, (a, b) => shallowEquals(a, b));
}

export type TablePaneType =
  | 'free-header'
  | 'free-body'
  | 'locked-header'
  | 'locked-body';

export type RectCorner =
  | 'bottom-left'
  | 'bottom-right'
  | 'top-left'
  | 'top-right';

export interface ResizeHandleDragState {
  initialDragPoint: Point; // In client coordinates
  initialPaneType: TablePaneType;
  initialRegion: TableSelectionRegion;
  initialRegionIndex: number;
  initialResizeHandleCorner: RectCorner;
}

function shallowEquals(
  obj1: any,
  obj2: any,
  equalityCheck: (a: any, b: any) => boolean = (a, b) => a === b,
): boolean {
  if (obj1 === obj2) {
    return true;
  }

  if (typeof obj1 !== typeof obj2) {
    return false;
  }

  const type = typeof obj1;

  if (type !== 'object') {
    return obj1 === obj2;
  }

  if (obj1 === null || obj2 === null) {
    return obj1 === obj2;
  }

  const keys = Object.keys(obj1);
  if (keys.length !== Object.keys(obj2).length) {
    return false;
  }

  for (const key of keys) {
    if (!equalityCheck(obj1[key], obj2[key])) {
      return false;
    }
  }
  return true;
}
