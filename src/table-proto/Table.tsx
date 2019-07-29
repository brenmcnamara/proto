/* tslint:disable: no-console no-empty no-unused-variable */

import './Table.css';

import * as React from 'react';
import TableColumns from './TableColumns';
import TableRefs from './TableRefs';
import TableScrollManager from './TableScrollManager';
import TableScrollOverlay from './TableScrollOverlay';
import TableSelectionManager from './TableSelectionManager';

import {
  EventSubscription,
  subscribedToDOMEvent,
} from '../EventSubscriptionUtils';
import { nullthrows } from '../Utils';
import { TableLayout, TableSelection } from './TableTypes';

export interface Props {
  layout: TableLayout;
  onCommitSelection: (selection: TableSelection) => void;
  selection: TableSelection | null;
}

export default class Table extends React.Component<Props> {
  // ---------------------------------------------------------------------------
  //
  // PROPERTIES
  //
  // ---------------------------------------------------------------------------

  private eventSubscriptions: EventSubscription[] = [];
  private scrollManager: TableScrollManager;
  private selectionManager: TableSelectionManager;
  private tableRefs: TableRefs = new TableRefs();

  constructor(props: Props) {
    super(props);
    validateLayout(props.layout);

    this.scrollManager = new TableScrollManager(props.layout, this.tableRefs);

    this.selectionManager = new TableSelectionManager(
      props.layout,
      props.selection,
      this.scrollManager,
      this.tableRefs,
    );
  }

  // ---------------------------------------------------------------------------
  //
  // LIFECYCLE
  //
  // ---------------------------------------------------------------------------

  public componentDidMount(): void {
    this.scrollManager.config();
    this.selectionManager.config();

    this.selectionManager.registerOnCommitSelection(this.onCommitSelection);

    const rootRef = nullthrows(this.tableRefs.root.current);

    this.eventSubscriptions.push(
      subscribedToDOMEvent(window, 'resize', this.onResize),
      subscribedToDOMEvent(rootRef, 'wheel', this.onWheelDOM),
    );
  }

  public componentWillUnmount(): void {
    this.eventSubscriptions.forEach(s => s.remove());
    this.eventSubscriptions = [];

    this.scrollManager.cleanup();
    this.selectionManager.cleanup();
  }

  public componentDidUpdate(): void {
    this.selectionManager.didUpdate(this.props);
    this.scrollManager.didUpdate(this.props);
  }

  // ---------------------------------------------------------------------------
  //
  // RENDER
  //
  // ---------------------------------------------------------------------------

  public render() {
    const { layout, selection } = this.props;
    const data = this.calculateData(this.props);

    return (
      <div
        className="Table"
        onWheel={this.onWheel}
        ref={this.tableRefs.root}
        style={{ position: 'relative' }}
      >
        <TableScrollOverlay
          layout={layout}
          ref={this.tableRefs.scrollOverlay}
        />
        <TableColumns
          columnType="locked"
          data={data}
          layout={layout}
          ref={this.tableRefs.lockedColumns}
          refBody={this.tableRefs.lockedColumnsBody}
          refHeader={this.tableRefs.lockedColumnsHeader}
          selection={selection}
        />
        <TableColumns
          columnType="free"
          data={data}
          layout={layout}
          ref={this.tableRefs.freeColumns}
          refBody={this.tableRefs.freeColumnsBody}
          refHeader={this.tableRefs.freeColumnsHeader}
          selection={selection}
        />
      </div>
    );
  }

  private calculateData(props: Props): string[][] {
    const { layout } = props;
    const data: string[][] = [];

    for (let i = 0; i < layout.numRows; ++i) {
      const row: string[] = [];
      for (let j = 0; j < layout.numCols; ++j) {
        row.push(
          i < layout.headerRowCount ? `Header ${i}-${j}` : `Cell ${i}-${j}`,
        );
      }
      data.push(row);
    }

    return data;
  }

  // ---------------------------------------------------------------------------
  //
  // EVENTS
  //
  // ---------------------------------------------------------------------------

  private onCommitSelection = (selection: TableSelection) => {
    this.props.onCommitSelection(selection);
  };

  private onWheelDOM = (event: WheelEvent) => {
    // Need to do this to prevent back navigation gesture on chrome.
    if (event.deltaX < 0) {
      event.preventDefault();
    }
  };

  private onWheel = (event: React.WheelEvent) => {
    const newOffset = {
      x: this.scrollManager.scrollOffset.x - event.deltaX,
      y: this.scrollManager.scrollOffset.y - event.deltaY,
    };

    this.scrollManager.scrollToOffset(newOffset);
    this.selectionManager.didChangeScroll();
  };

  private onResize = () => {
    this.scrollManager.onResize();
  };
}

function validateLayout(layout: TableLayout) {
  if (layout.numRows < layout.headerRowCount) {
    throw Error('Cannot have more header rows than total rows');
  }

  if (layout.numCols < layout.lockedColCount) {
    throw Error('Cannot have more locked columns than total columns');
  }
}