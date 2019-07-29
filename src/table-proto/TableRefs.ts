import {
  composeSubscriptions,
  EventSubscription,
} from 'src/EventSubscriptionUtils';
import { createRef, RefObject } from 'react';
import { SelectionRegionStartCallback } from './TableColumns';
import {
  TableSelection,
  TableSelectionRegionHandleLocationSet,
} from './TableTypes';

export interface TableRefsRaw {
  freeColumns: RefObject<any>;
  freeColumnsBody: RefObject<HTMLDivElement>;
  freeColumnsHeader: RefObject<HTMLDivElement>;
  lockedColumns: RefObject<any>;
  lockedColumnsBody: RefObject<HTMLDivElement>;
  lockedColumnsHeader: RefObject<HTMLDivElement>;
  root: RefObject<HTMLDivElement>;
  scrollOverlay: RefObject<any>;
}

export default class TableRefs {
  private raw: TableRefsRaw;

  constructor() {
    this.raw = createTableRefsRaw();
  }

  // ---------------------------------------------------------------------------
  //
  // GETTERS
  //
  // ---------------------------------------------------------------------------

  get freeColumns(): RefObject<any> {
    return this.raw.freeColumns;
  }

  get freeColumnsBody(): RefObject<HTMLDivElement> {
    return this.raw.freeColumnsBody;
  }

  get freeColumnsHeader(): RefObject<HTMLDivElement> {
    return this.raw.freeColumnsHeader;
  }

  get lockedColumns(): RefObject<any> {
    return this.raw.lockedColumns;
  }

  get lockedColumnsBody(): RefObject<HTMLDivElement> {
    return this.raw.lockedColumnsBody;
  }

  get lockedColumnsHeader(): RefObject<HTMLDivElement> {
    return this.raw.lockedColumnsHeader;
  }

  get root(): RefObject<HTMLDivElement> {
    return this.raw.root;
  }

  get scrollOverlay(): RefObject<any> {
    return this.raw.scrollOverlay;
  }

  // ---------------------------------------------------------------------------
  //
  // SELECTION MANAGEMENT
  //
  // ---------------------------------------------------------------------------

  public updateSelection(
    isChangingSelection: boolean,
    selection: TableSelection | null,
  ) {
    const { freeColumns, lockedColumns } = this;
    freeColumns.current &&
      freeColumns.current.updateSelection(isChangingSelection, selection);
    lockedColumns.current &&
      lockedColumns.current.updateSelection(isChangingSelection, selection);
  }

  public updateSelectionHandleLocations(
    selectionHandleLocations: Array<TableSelectionRegionHandleLocationSet | null>,
  ) {
    const { freeColumns, lockedColumns } = this;
    freeColumns.current &&
      freeColumns.current.updateSelectionHandleLocations(
        selectionHandleLocations,
      );
    lockedColumns.current &&
      lockedColumns.current.updateSelectionHandleLocations(
        selectionHandleLocations,
      );
  }

  // ---------------------------------------------------------------------------
  //
  // SELECTION MANAGEMENT
  //
  // ---------------------------------------------------------------------------

  public registerResizeSelectionRegionStart(
    cb: SelectionRegionStartCallback,
  ): EventSubscription {
    const subscriptions: EventSubscription[] = [];

    const { current: currentFree } = this.freeColumns;
    if (currentFree) {
      subscriptions.push(currentFree.registerResizeSelectionRegionStart(cb));
    }
    const { current: currentLocked } = this.lockedColumns;
    if (currentLocked) {
      subscriptions.push(currentLocked.registerResizeSelectionRegionStart(cb));
    }

    return composeSubscriptions(subscriptions);
  }
}

function createTableRefsRaw(): TableRefsRaw {
  return {
    freeColumns: createRef(),
    freeColumnsBody: createRef(),
    freeColumnsHeader: createRef(),
    lockedColumns: createRef(),
    lockedColumnsBody: createRef(),
    lockedColumnsHeader: createRef(),
    root: createRef(),
    scrollOverlay: createRef(),
  };
}
