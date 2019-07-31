/* tslint:disable:max-classes-per-file no-console no-empty no-unused-variable */

import TableRefs from './TableRefs';
import TableScrollManager from './TableScrollManager';

import { clamp, Point, Rect, Size, Vector } from './Geo';
import {
  EventSubscription,
  subscribedToDOMEvent,
  trySubscribeToDOMEvent,
} from '../EventSubscriptionUtils';
import {
  isEqualRegions,
  RectCorner,
  ResizeHandleDragState,
  TableLayout,
  TableSelection,
  TablePaneType,
} from './TableTypes';
import { Props as TableProps } from './Table';
import {
  calculateSizeForPane,
  calculatePaneForCellLocation,
} from './TableUtils';

export default class TableSelectionManager {
  private callbacksOnChangeSelection: Array<(sel: TableSelection) => void> = [];
  private callbacksOnCommitSelection: Array<(sel: TableSelection) => void> = [];
  private callbacksOnStartSelectionChange: Array<() => void> = [];
  private eventSubscriptions: EventSubscription[] = [];
  private isResizingSelection: boolean = false;
  private layout: TableLayout;
  private resizeEventSubscriptions: EventSubscription[] = [];
  private resizeHandleAutoScroller: AutoScroller | null = null;
  private resizeHandleCalibratedScrollOffset: Point | null = null;
  private resizeHandleCurrentPane: TablePaneType | null = null;
  private resizeHandleDragState: ResizeHandleDragState | null = null;
  private resizeHandleMousePosition: Point | null = null;
  private scrollManager: TableScrollManager;
  private selection: TableSelection | null;
  private tableRefs: TableRefs;

  constructor(
    layout: TableLayout,
    selection: TableSelection | null,
    scrollManager: TableScrollManager,
    tableRefs: TableRefs,
  ) {
    this.layout = layout;
    this.selection = selection;
    this.scrollManager = scrollManager;
    this.tableRefs = tableRefs;
  }

  // ---------------------------------------------------------------------------
  //
  // LIFECYCLE
  //
  // ---------------------------------------------------------------------------

  public config() {
    this.eventSubscriptions.push(
      this.tableRefs.registerResizeSelectionRegionStart(
        this.onResizeSelectionRegionStart,
      ),
    );
  }

  public cleanup() {
    this.eventSubscriptions.forEach(s => s.remove());
    this.eventSubscriptions = [];

    this.cleanupResize();
  }

  public didUpdate(props: TableProps) {
    this.selection = props.selection;
  }

  public didChangeScroll() {
    if (!this.isResizingSelection) {
      return;
    }

    if (
      !this.resizeHandleAutoScroller ||
      !this.resizeHandleDragState ||
      !this.resizeHandleCalibratedScrollOffset ||
      !this.resizeHandleMousePosition ||
      !this.selection
    ) {
      return; // Corrupt state
    }

    // If we are changing the scroll, we should cancel any auto-scrolling so
    // the auto-scrolling and real scrolling don't fight.
    this.resizeHandleAutoScroller.scrollVelocity = { x: 0, y: 0 };

    this.performSelectionRegionResizeUpdate(
      this.resizeHandleDragState,
      this.resizeHandleCalibratedScrollOffset,
      this.selection,
      this.resizeHandleMousePosition,
    );
  }

  // ---------------------------------------------------------------------------
  //
  // PUBLIC METHODS
  //
  // ---------------------------------------------------------------------------

  public registerOnStartSelectionChange(cb: () => void): EventSubscription {
    this.callbacksOnStartSelectionChange.push(cb);
    return {
      remove: () => {
        const index = this.callbacksOnStartSelectionChange.indexOf(cb);
        if (index >= 0) {
          this.callbacksOnStartSelectionChange.splice(index, 1);
        }
      },
    };
  }

  public registerOnChangeSelection(
    cb: (selection: TableSelection) => void,
  ): EventSubscription {
    this.callbacksOnChangeSelection.push(cb);
    return {
      remove: () => {
        const index = this.callbacksOnChangeSelection.indexOf(cb);
        if (index >= 0) {
          this.callbacksOnChangeSelection.splice(index, 1);
        }
      },
    };
  }

  public registerOnCommitSelection(
    cb: (selection: TableSelection) => void,
  ): EventSubscription {
    this.callbacksOnCommitSelection.push(cb);
    return {
      remove: () => {
        const index = this.callbacksOnCommitSelection.indexOf(cb);
        if (index >= 0) {
          this.callbacksOnCommitSelection.splice(index, 1);
        }
      },
    };
  }

  // ---------------------------------------------------------------------------
  //
  // CALLBACKS
  //
  // ---------------------------------------------------------------------------

  private onResizeSelectionRegionStart = (dragState: ResizeHandleDragState) => {
    this.tableRefs.updateSelection(true, this.selection);

    const autoScroller = new AutoScroller();

    this.isResizingSelection = true;
    this.resizeHandleAutoScroller = autoScroller;
    this.resizeHandleCalibratedScrollOffset = this.scrollManager.scrollOffset;
    // NOTE: Assuming drag handle is in end cell.
    this.resizeHandleCurrentPane = calculatePaneForCellLocation(
      dragState.initialRegion.endCell,
      this.layout,
    );
    this.resizeHandleDragState = dragState;
    this.resizeHandleMousePosition = dragState.initialDragPoint;

    this.resizeEventSubscriptions.push(
      subscribedToDOMEvent(
        document,
        'mousemove',
        this.onResizeSelectionRegionMouseMove,
      ),
      subscribedToDOMEvent(
        document,
        'mouseup',
        this.onResizeSelectionRegionMouseUp,
      ),

      // Add listeners to all columns so we can detect where in those columns
      // we are while we are resizing. This is important for auto-scrolling while
      // someone is dragging.
      trySubscribeToDOMEvent(
        this.tableRefs.lockedColumnsHeader.current,
        'mouseenter',
        this.onMouseEnterLockedHeaderDuringSelectionRegionResize,
      ),
      trySubscribeToDOMEvent(
        this.tableRefs.lockedColumnsBody.current,
        'mousemove',
        this.onMouseMoveLockedBodyDuringSelectionRegionResize,
      ),
      trySubscribeToDOMEvent(
        this.tableRefs.lockedColumnsBody.current,
        'mouseenter',
        this.onMouseEnterLockedBodyDuringSelectionRegionResize,
      ),
      trySubscribeToDOMEvent(
        this.tableRefs.freeColumnsHeader.current,
        'mousemove',
        this.onMouseMoveFreeHeaderDuringSelectionRegionResize,
      ),
      trySubscribeToDOMEvent(
        this.tableRefs.freeColumnsHeader.current,
        'mouseenter',
        this.onMouseEnterFreeHeaderDuringSelectionRegionResize,
      ),
      trySubscribeToDOMEvent(
        this.tableRefs.freeColumnsBody.current,
        'mousemove',
        this.onMouseMoveFreeBodyDuringSelectionRegionResize,
      ),
      trySubscribeToDOMEvent(
        this.tableRefs.freeColumnsBody.current,
        'mouseenter',
        this.onMouseEnterFreeBodyDuringSelectionRegionResize,
      ),
    );

    this.isResizingSelection = true;
    document.body.style.cursor = 'nwse-resize';

    this.resizeEventSubscriptions.push(
      this.resizeHandleAutoScroller.registerDeltaScroll(
        this.onAutoScrollerDeltaScroll,
      ),
    );

    const { selection } = this;
    if (!selection) {
      throw Error(
        'Corrupt State: Selection resizing has been initialized but there is not selection',
      );
    }

    // We want to hide all resize handles except the one that the user grabbed.
    const handleLocation = { [dragState.initialResizeHandleCorner]: true };
    const selectionHandleLocations = selection.map((reg, i) =>
      dragState.initialRegionIndex === i ? handleLocation : {},
    );

    this.tableRefs.updateSelectionHandleLocations(selectionHandleLocations);

    this.callbacksOnStartSelectionChange.forEach(cb => cb());
  };

  private onResizeSelectionRegionMouseMove = (event: MouseEvent) => {
    const resizeHandleDragState = this.resizeHandleDragState;
    const initialScrollOffset = this.resizeHandleCalibratedScrollOffset;
    const { selection } = this;

    if (!resizeHandleDragState || !selection || !initialScrollOffset) {
      console.warn('Table Internal Error: Corrupt internal state');
      return; // This should never happen.
    }

    event.preventDefault();

    const mousePosition = { x: event.clientX, y: event.clientY };

    this.performSelectionRegionResizeUpdate(
      resizeHandleDragState,
      initialScrollOffset,
      selection,
      mousePosition,
    );

    this.resizeHandleMousePosition = mousePosition;
  };

  private onResizeSelectionRegionMouseUp = (event: MouseEvent) => {
    const { selection } = this;
    if (!selection) {
      return; // Corrupt state
    }

    this.tableRefs.updateSelection(false, selection);
    this.callbacksOnCommitSelection.forEach(cb => cb(selection));
    this.cleanupResize();
  };

  private onMouseEnterLockedHeaderDuringSelectionRegionResize = (
    event: MouseEvent,
  ) => {
    this.performScrollingForPaneChange(
      this.resizeHandleCurrentPane,
      'locked-header',
    );
    this.resizeHandleCurrentPane = 'locked-header';
  };

  private onMouseMoveLockedBodyDuringSelectionRegionResize = (
    event: MouseEvent,
  ) => {
    if (!event.target || !(event.target instanceof Element)) {
      return; // Corrupt state
    }
    const panelElement = findInnerPanelAncestor(event.target);
    if (!panelElement) {
      return; // Corrupt state
    }

    const { layout, tableSize } = this;
    const scrollOffset = this.scrollManager.scrollOffset;
    const mousePosition = { x: event.clientX, y: event.clientY };
    const clientDOMRect = panelElement.getBoundingClientRect();
    const lockedHeaderSize = calculateSizeForPane('locked-header', layout);

    const rect = {
      origin: {
        x: clientDOMRect.left,
        y: clientDOMRect.top - scrollOffset.y,
      },
      size: {
        height: tableSize.height - lockedHeaderSize.height,
        width: tableSize.width,
      },
    };

    this.performAutoScrolling('locked-body', rect, mousePosition);
  };

  private onMouseEnterLockedBodyDuringSelectionRegionResize = (
    event: MouseEvent,
  ) => {
    this.performScrollingForPaneChange(
      this.resizeHandleCurrentPane,
      'locked-body',
    );
    this.resizeHandleCurrentPane = 'locked-body';
  };

  private onMouseMoveFreeHeaderDuringSelectionRegionResize = (
    event: MouseEvent,
  ) => {
    if (!event.target || !(event.target instanceof Element)) {
      return; // Corrupt state
    }
    const panelElement = findInnerPanelAncestor(event.target);
    if (!panelElement) {
      return; // Corrupt state
    }
    const { layout, tableSize } = this;
    const scrollOffset = this.scrollManager.scrollOffset;
    const mousePosition = { x: event.clientX, y: event.clientY };
    const lockedHeaderSize = calculateSizeForPane('locked-header', layout);

    const clientDOMRect = panelElement.getBoundingClientRect();
    const rect = {
      origin: {
        x: clientDOMRect.left - scrollOffset.x,
        y: clientDOMRect.top,
      },
      size: {
        height: tableSize.height,
        width: tableSize.width - lockedHeaderSize.width,
      },
    };

    this.performAutoScrolling('free-header', rect, mousePosition);
  };

  private onMouseEnterFreeHeaderDuringSelectionRegionResize = (
    event: MouseEvent,
  ) => {
    this.performScrollingForPaneChange(
      this.resizeHandleCurrentPane,
      'free-header',
    );
    this.resizeHandleCurrentPane = 'free-header';
  };

  private onMouseMoveFreeBodyDuringSelectionRegionResize = (
    event: MouseEvent,
  ) => {
    if (!event.target || !(event.target instanceof Element)) {
      return; // Corrupt state
    }
    const panelElement = findInnerPanelAncestor(event.target);
    if (!panelElement) {
      return; // Corrupt state
    }

    const { layout, tableSize } = this;
    const scrollOffset = this.scrollManager.scrollOffset;
    const mousePosition = { x: event.clientX, y: event.clientY };
    const lockedHeaderSize = calculateSizeForPane('locked-header', layout);

    const clientDOMRect = panelElement.getBoundingClientRect();
    const rect = {
      origin: {
        x: clientDOMRect.left - scrollOffset.x,
        y: clientDOMRect.top - scrollOffset.y,
      },
      size: {
        height: tableSize.height - lockedHeaderSize.height,
        width: tableSize.width - lockedHeaderSize.width,
      },
    };
    this.performAutoScrolling('free-body', rect, mousePosition);
  };

  private onMouseEnterFreeBodyDuringSelectionRegionResize = (
    event: MouseEvent,
  ) => {
    this.performScrollingForPaneChange(
      this.resizeHandleCurrentPane,
      'free-body',
    );
    this.resizeHandleCurrentPane = 'free-body';
  };

  private onAutoScrollerDeltaScroll = (delta: Vector) => {
    if (
      !this.resizeHandleMousePosition ||
      !this.resizeHandleDragState ||
      !this.resizeHandleCalibratedScrollOffset ||
      !this.selection
    ) {
      return; // Corrupt state
    }

    const offset = {
      x: this.scrollManager.scrollOffset.x + delta.x,
      y: this.scrollManager.scrollOffset.y + delta.y,
    };
    this.scrollManager.scrollToOffset(offset);

    this.performSelectionRegionResizeUpdate(
      this.resizeHandleDragState,
      this.resizeHandleCalibratedScrollOffset,
      this.selection,
      this.resizeHandleMousePosition,
    );
  };

  // ---------------------------------------------------------------------------
  //
  // PRIVATE UTILITIES
  //
  // ---------------------------------------------------------------------------

  private performScrollingForPaneChange(
    fromPane: TablePaneType | null,
    toPane: TablePaneType,
  ) {
    if (!fromPane || fromPane === toPane) {
      return;
    }

    const isMovingFromFixedToFreeColumn =
      (fromPane === 'locked-header' && toPane === 'free-header') ||
      (fromPane === 'locked-body' && toPane === 'free-body') ||
      (fromPane === 'locked-header' && toPane === 'free-body');

    const isMovingFromFixedToFreeRow =
      (fromPane === 'locked-header' && toPane === 'locked-body') ||
      (fromPane === 'free-header' && toPane === 'free-body') ||
      (fromPane === 'locked-header' && toPane === 'free-body');

    const isMovingFromFreeToFixedColumn =
      (fromPane === 'free-header' && toPane === 'locked-header') ||
      (fromPane === 'free-body' && toPane === 'locked-body') ||
      (fromPane === 'free-body' && toPane === 'locked-header');

    const isMovingFromFreeToFixedRow =
      (fromPane === 'locked-body' && toPane === 'locked-header') ||
      (fromPane === 'free-body' && toPane === 'free-header') ||
      (fromPane === 'free-body' && toPane === 'locked-header');

    if (
      !isMovingFromFixedToFreeColumn &&
      !isMovingFromFixedToFreeRow &&
      !isMovingFromFreeToFixedColumn &&
      !isMovingFromFreeToFixedRow
    ) {
      return;
    }

    if (!this.resizeHandleCalibratedScrollOffset) {
      return; // Corrupt state
    }

    const scrollOffset = { ...this.scrollManager.scrollOffset };
    const recalibratedScrollOffset = {
      ...this.resizeHandleCalibratedScrollOffset,
    };

    if (isMovingFromFreeToFixedColumn) {
      scrollOffset.x = 0;
    }

    if (isMovingFromFixedToFreeColumn) {
      scrollOffset.x = 0;
      recalibratedScrollOffset.x = 0;
    }

    if (isMovingFromFreeToFixedRow) {
      scrollOffset.y = 0;
    }

    if (isMovingFromFixedToFreeRow) {
      scrollOffset.y = 0;
      recalibratedScrollOffset.y = 0;
    }

    this.resizeHandleCalibratedScrollOffset = recalibratedScrollOffset;
    this.scrollManager.scrollToOffset(scrollOffset);
  }

  private performAutoScrolling = (
    paneType: TablePaneType,
    rectScrollInvariant: Rect,
    mousePosition: Point,
  ) => {
    const mousePositionInRect = {
      x: mousePosition.x - rectScrollInvariant.origin.x,
      y: mousePosition.y - rectScrollInvariant.origin.y,
    };

    const velocity = calculateScrollVelocity(
      rectScrollInvariant,
      mousePositionInRect,
    );
    const lockedVelocity = lockVelocity(paneType, velocity);
    if (!this.resizeHandleAutoScroller) {
      console.warn('Corrupted Internal state');
      return; // Corrupt state.
    }
    this.resizeHandleAutoScroller.scrollVelocity = lockedVelocity;
  };

  private performSelectionRegionResizeUpdate = (
    dragState: ResizeHandleDragState,
    initialScrollOffset: Point,
    selection: TableSelection,
    mousePos: Point,
  ) => {
    // We are calculating the change in the selection based on the initial
    // position of the region and the delta of the drag point. Note that we are
    // assuming that the start point of the drag is exactly at the bottom right
    // corner of the bottom right cell in the selected region. This is not
    // exactly right because the resize handle has some size and it may be
    // grabbed off center, but this handle should be small enought that this
    // assumption is approximately correct.

    // NOTE: We must also account for the change in the scroll of the table.
    // A user can scroll the table while they are resizing a selection, causing
    // the region to change as well.
    const deltaScrollX =
      this.scrollManager.scrollOffset.x - initialScrollOffset.x;
    const deltaScrollY =
      this.scrollManager.scrollOffset.y - initialScrollOffset.y;

    const { layout } = this;
    const initialCell = dragState.initialRegion.endCell;

    const deltaX = mousePos.x - dragState.initialDragPoint.x - deltaScrollX;
    const deltaY = mousePos.y - dragState.initialDragPoint.y - deltaScrollY;

    // Terminology: a "corner" represents the corner of a cell (each cell has
    // 4 corners that it may share with other cells). When calculating the
    // change in the selection region, it's easier to do it using the index
    // of the corner. The reason is that the semantics of the startCell and
    // endCell are different. After doing the resizing calculations based on
    // the corners that are manipulated, we use the corners to calculate the
    // new cells.

    let rowCornerFixed: number = 0;
    let colCornerFixed: number = 0;
    let rowCorner: number = 0;
    let colCorner: number = 0;

    switch (dragState.initialResizeHandleCorner) {
      case 'top-left':
        rowCornerFixed = dragState.initialRegion.endCell.row;
        colCornerFixed = dragState.initialRegion.endCell.col;

        rowCorner = dragState.initialRegion.startCell.row;
        colCorner = dragState.initialRegion.startCell.col;
        break;

      case 'bottom-right':
        rowCornerFixed = dragState.initialRegion.startCell.row;
        colCornerFixed = dragState.initialRegion.startCell.col;

        rowCorner = dragState.initialRegion.endCell.row + 1;
        colCorner = dragState.initialRegion.endCell.col + 1;
        break;
    }

    const deltaRowCornerUnclamped = Math.round(deltaY / layout.rowHeight);

    let deltaCol: number = 0;
    let x = deltaX;

    // The goal of this while-loop is to calculate the change in the column
    // resizing direction. We also need to handle the case where the user drags
    // the resize handle behind the selection region, which would invert the
    // region.
    if (x > 0) {
      while (true) {
        const currentCellCorner = colCorner + deltaCol;
        if (currentCellCorner >= layout.numCols) {
          // We've gone passed the end of the table.
          break;
        } else if (x < layout.colWidths[currentCellCorner]) {
          // The delta is in between the end of this col and the end of the
          // next col.
          const colWidth = layout.colWidths[currentCellCorner];
          const interpolate = x / colWidth;
          deltaCol += Math.round(interpolate);
          break;
        } else {
          deltaCol += 1;
          x -= layout.colWidths[currentCellCorner];
        }
      }
    } else if (x < 0) {
      // Moving in the negative direction.
      while (true) {
        const currentCellCorner = initialCell.col + deltaCol;
        if (currentCellCorner < 0) {
          // We've gone passed the beginning of the table.
          break;
        } else if (x > -layout.colWidths[currentCellCorner]) {
          // The delta is in between the beginning of this col and the beginning
          // of the previous col.
          const colWidth = layout.colWidths[currentCellCorner];
          const interpolate = -x / colWidth;
          deltaCol -= Math.round(interpolate);
          break;
        } else {
          deltaCol -= 1;
          x += layout.colWidths[currentCellCorner];
        }
      }
    }

    // Calculate the rows.
    const rowCornerRange = { max: layout.numRows, min: 0 };

    const rowCornerVariable = clamp(
      rowCorner + deltaRowCornerUnclamped,
      rowCornerRange,
    );

    let row1: number;
    let row2: number;

    if (rowCornerFixed >= rowCornerVariable) {
      row1 = rowCornerFixed;
      row2 = rowCornerVariable;
    } else {
      row1 = rowCornerVariable - 1;
      row2 = rowCornerFixed;
    }

    // Calculate the cols.
    const colCornerVariable = colCorner + deltaCol;

    let col1: number;
    let col2: number;

    if (colCornerFixed >= colCornerVariable) {
      col1 = colCornerFixed;
      col2 = colCornerVariable;
    } else {
      col1 = colCornerVariable - 1;
      col2 = colCornerFixed;
    }

    // Calculate the selection region.
    const newStartCell = {
      col: Math.min(col1, col2),
      row: Math.min(row1, row2),
    };

    const newEndCell = {
      col: Math.max(col1, col2),
      row: Math.max(row1, row2),
    };

    const region = {
      ...dragState.initialRegion,
      endCell: newEndCell,
      startCell: newStartCell,
    };

    // Calculate the location of the active handles.
    let activeHandle: RectCorner;
    switch (dragState.initialResizeHandleCorner) {
      case 'bottom-right': {
        const isRowInverted = rowCornerVariable <= rowCornerFixed;
        const isColInverted = colCornerVariable <= colCornerFixed;
        activeHandle = calculateCurrentHandleLocation(
          'bottom-right',
          isRowInverted,
          isColInverted,
        );
        break;
      }

      case 'top-left': {
        const isRowInverted = rowCornerVariable > rowCornerFixed;
        const isColInverted = colCornerVariable > colCornerFixed;
        activeHandle = calculateCurrentHandleLocation(
          'top-left',
          isRowInverted,
          isColInverted,
        );
        break;
      }

      default:
        throw Error(
          `Unsupported initial handle corner: ${
            dragState.initialResizeHandleCorner
          }`,
        );
    }

    const newSelection = selection.slice();

    const newHandleLocation = { [activeHandle]: true };
    const selectionHandleLocations = newSelection.map((reg, i) =>
      dragState.initialRegionIndex === i ? newHandleLocation : {},
    );

    // NOTE: It is possible for the handle location to change without the
    // region changing.
    this.tableRefs.updateSelectionHandleLocations(selectionHandleLocations);

    // Did the region change?
    const prevRegion = selection[dragState.initialRegionIndex];
    if (isEqualRegions(prevRegion, region)) {
      return;
    }

    newSelection[dragState.initialRegionIndex] = region;

    this.tableRefs.updateSelection(true, newSelection);
    this.selection = newSelection;
    this.callbacksOnChangeSelection.forEach(cb => cb(newSelection));
  };

  private cleanupResize() {
    this.isResizingSelection = false;
    this.resizeHandleAutoScroller = null;
    this.resizeHandleCalibratedScrollOffset = null;
    this.resizeHandleDragState = null;
    this.resizeHandleMousePosition = null;

    this.resizeEventSubscriptions.forEach(s => s.remove());
    this.resizeEventSubscriptions = [];

    document.body.style.cursor = 'inherit';
  }

  private get tableSize(): Size {
    const { current } = this.tableRefs.root;
    if (!current) {
      return { width: 0, height: 0 };
    }
    return { width: current.offsetWidth, height: current.offsetHeight };
  }
}

function calculateScrollVelocity(
  rectScrollInvariant: Rect,
  point: Point,
): Vector {
  const THRESHOLD = 80;
  const K = 1 / 4;

  let x = 0;
  if (point.x < THRESHOLD) {
    x = THRESHOLD - point.x;
  } else if (point.x > rectScrollInvariant.size.width - THRESHOLD) {
    x = rectScrollInvariant.size.width - point.x - THRESHOLD;
  }

  let y = 0;
  if (point.y < THRESHOLD) {
    y = THRESHOLD - point.y;
  } else if (point.y > rectScrollInvariant.size.height - THRESHOLD) {
    y = rectScrollInvariant.size.height - point.y - THRESHOLD;
  }

  x = x * Math.abs(x) * K;
  y = y * Math.abs(y) * K;

  return { x, y };
}

function lockVelocity(paneType: TablePaneType, velocity: Vector): Vector {
  switch (paneType) {
    case 'locked-header':
      return { x: 0, y: 0 };
    case 'locked-body':
      return { x: 0, y: velocity.y };
    case 'free-header':
      return { x: velocity.x, y: 0 };
    case 'free-body':
      return velocity;
  }
}

const MS_PER_SEC = 1000;

// This is used for calculating auto-scrolling when the mouse is scroll to the
// edges of the scroll region
class AutoScroller {
  private callbacksDeltaScroll: Array<(deltaScroll: Vector) => void> = [];
  private isTicking: boolean = false;
  private lastTickMillis: number = 0;
  private scrollVelocityRAW: Vector = { x: 0, y: 0 };

  public get scrollVelocity(): Vector {
    return this.scrollVelocityRAW;
  }

  public set scrollVelocity(velocity: Vector) {
    this.scrollVelocityRAW = velocity;
    const prevIsTicking = this.isTicking;
    this.isTicking = velocity.x !== 0 || velocity.y !== 0;

    if (!prevIsTicking && this.isTicking) {
      this.lastTickMillis = Date.now();
      this.startTick();
    }
  }

  public registerDeltaScroll(
    cb: (deltaScroll: Vector) => void,
  ): EventSubscription {
    this.callbacksDeltaScroll.push(cb);
    return {
      remove: () => {
        const index = this.callbacksDeltaScroll.indexOf(cb);
        this.callbacksDeltaScroll.splice(index, 1);
      },
    };
  }

  private startTick(): void {
    if (!this.isTicking) {
      return;
    }
    requestAnimationFrame(() => {
      const nowMillis = Date.now();
      const deltaSecs = (nowMillis - this.lastTickMillis) / MS_PER_SEC;
      const velocity = this.scrollVelocityRAW; // pixels per second
      const delta = { x: velocity.x * deltaSecs, y: velocity.y * deltaSecs };
      this.callbacksDeltaScroll.forEach(cb => cb(delta));
      this.lastTickMillis = nowMillis;
      this.startTick();
    });
  }
}

function findInnerPanelAncestor(element: Element): Element | null {
  let node: Element | null = element;
  while (node && !node.className.split(/\s+/g).includes('Table-innerPanel')) {
    node = node.parentElement;
  }
  return node;
}

function calculateCurrentHandleLocation(
  initialLocation: RectCorner,
  isRowInverted: boolean,
  isColInverted: boolean,
) {
  const topRightPredicates = [
    initialLocation === 'top-right' && !isRowInverted && !isColInverted,
    initialLocation === 'bottom-right' && isRowInverted && !isColInverted,
    initialLocation === 'bottom-left' && isRowInverted && isColInverted,
    initialLocation === 'top-left' && !isRowInverted && isColInverted,
  ];

  if (topRightPredicates.includes(true)) {
    return 'top-right';
  }

  const bottomRightPredicates = [
    initialLocation === 'bottom-right' && !isRowInverted && !isColInverted,
    initialLocation === 'bottom-left' && !isRowInverted && isColInverted,
    initialLocation === 'top-left' && isRowInverted && isColInverted,
    initialLocation === 'top-right' && isRowInverted && !isColInverted,
  ];

  if (bottomRightPredicates.includes(true)) {
    return 'bottom-right';
  }

  const bottomLeftPredicates = [
    initialLocation === 'bottom-left' && !isRowInverted && !isColInverted,
    initialLocation === 'top-left' && isRowInverted && !isColInverted,
    initialLocation === 'top-right' && isRowInverted && isColInverted,
    initialLocation === 'bottom-right' && !isRowInverted && isColInverted,
  ];

  if (bottomLeftPredicates.includes(true)) {
    return 'bottom-left';
  }

  return 'top-left';
}
