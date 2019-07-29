/* tslint:disable:max-classes-per-file no-console no-empty no-unused-variable */

import TableRefs from './TableRefs';

import { clamp, MinMaxRange, Point, Size } from './Geo';
import { calculateSizeForPane } from './TableUtils';
import { EventSubscription } from '../EventSubscriptionUtils';
import { Props as TableProps } from './Table';
import { ScrollBarDragState } from './TableScrollOverlay';
import { TableLayout } from './TableTypes';

/**
 * This module is used to perform scrolling on the table. It keeps track of
 * the state of the scroll offset and manages changes to the scroll offset and
 * scroll bars.
 */
export default class TableScrollManager {
  private scrollOffsetRAW: Point = { x: 0, y: 0 };
  private eventSubscriptions: EventSubscription[] = [];
  private layout: TableLayout;
  private offsetXRange: MinMaxRange = { max: 0, min: 0 };
  private offsetYRange: MinMaxRange = { max: 0, min: 0 };
  private tableRefs: TableRefs;
  private tableSize: Size = { height: 0, width: 0 };

  constructor(layout: TableLayout, tableRefs: TableRefs) {
    this.layout = layout;
    this.tableRefs = tableRefs;
  }

  public get scrollOffset() {
    return this.scrollOffsetRAW;
  }

  // ---------------------------------------------------------------------------
  //
  // LIFECYCLE
  //
  // ---------------------------------------------------------------------------

  public config() {
    this.cleanup();

    const { current: currentScrollOverlay } = this.tableRefs.scrollOverlay;
    if (currentScrollOverlay) {
      this.eventSubscriptions = [
        currentScrollOverlay.registerDragScrollBar(this.onDragScrollBar),
      ];
    }

    const { current: currentRoot } = this.tableRefs.root;
    if (currentRoot) {
      const tableSize = {
        height: currentRoot.offsetHeight,
        width: currentRoot.offsetWidth,
      };
      this.update(this.scrollOffset, this.layout, tableSize);
    }
  }

  public cleanup() {
    this.eventSubscriptions.forEach(s => s.remove());
    this.eventSubscriptions = [];
  }

  public didUpdate(props: TableProps) {
    this.update(this.scrollOffsetRAW, props.layout, this.tableSize);
  }

  // ---------------------------------------------------------------------------
  //
  // PUBLIC METHODS
  //
  // ---------------------------------------------------------------------------

  // TODO: Clamping is being done before this component is called, need to
  // change that.
  public scrollToOffset(offsetUnclamped: Point) {
    this.update(offsetUnclamped, this.layout, this.tableSize);
  }

  public onResize() {
    const { current: currentRoot } = this.tableRefs.root;
    if (!currentRoot) {
      return;
    }

    const tableSize = {
      height: currentRoot.offsetHeight,
      width: currentRoot.offsetWidth,
    };

    if (tableSize.width <= 0 || tableSize.height <= 0) {
      this.offsetXRange = { max: 0, min: 0 };
      this.offsetYRange = { max: 0, min: 0 };
      this.tableSize = tableSize;
      return;
    }

    // SIDE EFFECTS

    this.update(this.scrollOffsetRAW, this.layout, tableSize);

    // STATE UPDATES

    this.tableSize = tableSize;
  }

  // ---------------------------------------------------------------------------
  //
  // EVENTS
  //
  // ---------------------------------------------------------------------------

  private onDragScrollBar = (dragState: ScrollBarDragState) => {
    if (dragState.stage === 'MOVE' && dragState.scrollOffset) {
      this.update(dragState.scrollOffset, this.layout, this.tableSize);
    }
  };

  // ---------------------------------------------------------------------------
  //
  // PRIVATE UTILS
  //
  // ---------------------------------------------------------------------------

  // Updates the x and y ranges and creates the new scroll offset based on
  // those ranges.
  private update(
    currentScrollOffset: Point,
    layout: TableLayout,
    tableSize: Size,
  ) {
    if (tableSize.width <= 0 || tableSize.height <= 0) {
      this.scrollOffsetRAW = currentScrollOffset;
      this.layout = layout;
      this.tableSize = tableSize;
      return; // TODO: NEED TO PROPERLY HANDLE THIS EDGE CASE
    }

    let scrollOffset: Point;

    if (layout === this.layout && tableSize === this.tableSize) {
      // No need to recompute the offsetXRange and offsetYRange values.
      scrollOffset = calculateClampedOffset(
        currentScrollOffset,
        this.offsetXRange,
        this.offsetYRange,
      );
      this.updateRefs(scrollOffset, this.offsetXRange, this.offsetYRange);

      this.scrollOffsetRAW = scrollOffset;
      return;
    }

    // COMPUTATIONS

    const lockedHeaderSize = calculateSizeForPane('locked-header', layout);
    const freeBodySize = calculateSizeForPane('free-body', layout);

    const xScrollSize = tableSize.width - lockedHeaderSize.width;
    const yScrollSize = tableSize.height - lockedHeaderSize.height;

    const offsetXRange = {
      max: 0,
      min: Math.min(-freeBodySize.width + xScrollSize, 0),
    };

    const offsetYRange = {
      max: 0,
      min: Math.min(-freeBodySize.height + yScrollSize, 0),
    };

    scrollOffset = calculateClampedOffset(
      currentScrollOffset,
      offsetXRange,
      offsetYRange,
    );

    this.updateRefs(scrollOffset, offsetXRange, offsetYRange);

    // UPDATE VARIABLES

    this.scrollOffsetRAW = scrollOffset;
    this.layout = layout;
    this.offsetXRange = offsetXRange;
    this.offsetYRange = offsetYRange;
    this.tableSize = tableSize;
  }

  private updateRefs(
    scrollOffset: Point,
    offsetXRange: MinMaxRange,
    offsetYRange: MinMaxRange,
  ) {
    const scrollOffsetFree = scrollOffset;
    const scrollOffsetLocked = { x: 0, y: scrollOffsetFree.y };

    const { current: currentFree } = this.tableRefs.freeColumns;
    currentFree && currentFree.updateOffset(scrollOffsetFree);

    const { current: currentLocked } = this.tableRefs.lockedColumns;
    currentLocked && currentLocked.updateOffset(scrollOffsetLocked);

    const { current: currentScrollOverlay } = this.tableRefs.scrollOverlay;
    currentScrollOverlay &&
      currentScrollOverlay.updateOffset(
        scrollOffsetFree,
        offsetXRange,
        offsetYRange,
      );
  }
}

function calculateClampedOffset(
  currentOffset: Point,
  offsetXRange: MinMaxRange,
  offsetYRange: MinMaxRange,
) {
  return {
    x: clamp(currentOffset.x, offsetXRange),
    y: clamp(currentOffset.y, offsetYRange),
  };
}
