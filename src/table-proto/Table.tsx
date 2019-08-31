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
  trySubscribeToDOMEvent,
} from '../EventSubscriptionUtils';
import { TableDragMode, TableLayout, TableSelection } from './TableTypes';

export interface Props {
  layout: TableLayout;
  onCommitSelection: (selection: TableSelection) => void;
  selection: TableSelection | null;
}

interface State {
  dragMode: TableDragMode | null;
}

export default class Table extends React.Component<Props, State> {
  public state: State = {
    dragMode: null,
  };

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

    this.eventSubscriptions.push(
      subscribedToDOMEvent(window, 'resize', this.onResize),
      trySubscribeToDOMEvent(
        this.tableRefs.root.current,
        'wheel',
        this.onWheelDOM,
      ),
      this.selectionManager.registerOnStartSelectionChange(
        this.onStartSelectionChange,
      ),
      this.selectionManager.registerOnCommitSelection(this.onCommitSelection),
      this.scrollManager.registerOnStartDragScrollBarHorizontal(
        this.onStartDragScrollBarHorizontal,
      ),
      this.scrollManager.registerOnStartDragScrollBarVertical(
        this.onStartDragScrollBarVertical,
      ),
      this.scrollManager.registerOnEndDragScrollBarHorizontal(
        this.onEndDragScrollBarHorizontal,
      ),
      this.scrollManager.registerOnEndDragScrollBarVertical(
        this.onEndDragScrollBarVertical,
      ),
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
    const { dragMode } = this.state;
    const data = this.calculateData(this.props);

    return (
      <div
        className="Table"
        onWheel={this.onWheel}
        ref={this.tableRefs.root}
        style={{ position: 'relative' }}
      >
        <TableScrollOverlay
          enableInteractions={dragMode !== 'selection'}
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

  private calculateData(props: Props): React.ReactElement[][] {
    const { layout } = props;
    const data: React.ReactElement[][] = [];

    for (let i = 0; i < layout.numRows; ++i) {
      const row: React.ReactElement[] = [];
      for (let j = 0; j < layout.numCols; ++j) {
        row.push(
          i < layout.headerRowCount ? (
            <div className="custom-table-cell">{`Header ${i}-${j}`}</div>
          ) : (
            <div className="custom-table-cell">{`Cell ${i}-${j}`}</div>
          ),
        );
      }
      data.push(row);
    }

    return data;
  }

  private onStartSelectionChange = () => {
    this.setState({ dragMode: 'selection' });
  };

  private onCommitSelection = (selection: TableSelection) => {
    this.setState({ dragMode: null });
    this.props.onCommitSelection(selection);
  };

  private onStartDragScrollBarHorizontal = () => {
    this.setState({ dragMode: 'h-scrollbar' });
  };

  private onStartDragScrollBarVertical = () => {
    this.setState({ dragMode: 'v-scrollbar' });
  };

  private onEndDragScrollBarHorizontal = () => {
    this.setState({ dragMode: null });
  };

  private onEndDragScrollBarVertical = () => {
    this.setState({ dragMode: null });
  };

  private onWheelDOM = (event: WheelEvent) => {
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
