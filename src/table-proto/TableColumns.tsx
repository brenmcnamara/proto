/* tslint:disable:max-classes-per-file no-console no-empty no-unused-variable */

import './Table.css';

import * as React from 'react';
import classnames from 'classnames';
import TableSelectionOverlay from './TableSelectionOverlay';

import { EventSubscription } from '../EventSubscriptionUtils';
import {
  TableColumnType,
  TableLayout,
  TableSelection,
  TableSelectionRegionHandleLocationSet,
  ResizeHandleDragState,
} from './TableTypes';
import { calculateSizeForPane } from './TableUtils';
import { Point } from './Geo';

interface Props {
  columnType: TableColumnType;
  data: React.ReactElement[][];
  layout: TableLayout;
  ref: React.RefObject<TableColumns>;
  refBody: React.RefObject<HTMLDivElement>;
  refHeader: React.RefObject<HTMLDivElement>;
  selection: TableSelection | null;
}

interface State {
  isChangingSelection: boolean;
  selection: TableSelection | null;
  selectionHandleLocations: Array<TableSelectionRegionHandleLocationSet | null> | null;
}

export type SelectionRegionStartCallback = (
  dragState: ResizeHandleDragState,
) => void;

export default class TableColumns extends React.Component<Props, State> {
  private callbacksSelectionRegionStart: SelectionRegionStartCallback[] = [];
  private offset: Point = { x: 0, y: 0 };

  constructor(props: Props) {
    super(props);

    const selectionHandleLocations =
      props.selection && props.selection.map(() => null);

    this.state = {
      isChangingSelection: false,
      selection: props.selection,
      selectionHandleLocations,
    };
  }

  public static getDerivedStateFromProps(
    props: Props,
    prevState: State,
  ): State {
    if (prevState.isChangingSelection) {
      return prevState;
    }

    // For now, reset the handle locations if the selections change.
    const selectionHandleLocations =
      props.selection === prevState.selection
        ? prevState.selectionHandleLocations
        : props.selection && props.selection.map(() => null);

    return {
      ...prevState,
      selection: props.selection,
      selectionHandleLocations,
    };
  }

  // ---------------------------------------------------------------------------
  //
  // PUBLIC METHODS
  //
  // ---------------------------------------------------------------------------

  public updateOffset(offset: Point): void {
    if (offset === this.offset) {
      return;
    }

    const { columnType } = this.props;
    const { current: currentBody } = this.props.refBody;
    const { current: currentHeader } = this.props.refHeader;

    if (!currentBody || (columnType === 'free' && !currentHeader)) {
      throw Error('Cannot call "setOffset" before component is mounted');
    }

    const transformStyle = calculateTransformStyleFromPoint(offset);

    currentBody.style.transform = transformStyle;
    if (columnType === 'free' && currentHeader) {
      currentHeader.style.transform = calculateTransformStyleFromPoint({
        x: offset.x,
        y: 0,
      });
    }

    this.offset = offset;
  }

  public updateSelection(
    isChangingSelection: boolean,
    selection: TableSelection | null,
  ) {
    this.setState({ isChangingSelection, selection });
  }

  public updateSelectionHandleLocations(
    selectionHandleLocations: Array<TableSelectionRegionHandleLocationSet | null>,
  ) {
    this.setState({ selectionHandleLocations });
  }

  public registerResizeSelectionRegionStart(
    cb: SelectionRegionStartCallback,
  ): EventSubscription {
    this.callbacksSelectionRegionStart.push(cb);

    return {
      remove: () => {
        const index = this.callbacksSelectionRegionStart.indexOf(cb);
        if (index >= 0) {
          this.callbacksSelectionRegionStart.splice(index, 1);
        }
      },
    };
  }

  // ---------------------------------------------------------------------------
  //
  // CALLBACKS
  //
  // ---------------------------------------------------------------------------

  private onSelectionOverlayResizeStart = (
    dragState: ResizeHandleDragState,
  ) => {
    this.callbacksSelectionRegionStart.forEach(cb => cb(dragState));
  };

  // ---------------------------------------------------------------------------
  //
  // RENDER
  //
  // ---------------------------------------------------------------------------

  public render() {
    const { columnType, data, layout } = this.props;
    const { selection, selectionHandleLocations } = this.state;
    const {
      headerRowCount,
      lockedColCount,
      numCols,
      numRows,
      rowHeight,
    } = layout;

    const rows: React.ReactElement[] = [];

    const headerSize = calculateSizeForPane(
      columnType === 'free' ? 'free-header' : 'locked-header',
      layout,
    );

    const bodyHeight = calculateSizeForPane(
      columnType === 'free' ? 'free-body' : 'locked-body',
      layout,
    ).height;

    let colStart: number;
    let colEnd: number;

    switch (columnType) {
      case 'free':
        colStart = lockedColCount;
        colEnd = numCols;
        break;

      case 'locked':
        colStart = 0;
        colEnd = lockedColCount;
        break;

      default:
        throw Error(`Corrupt State: Unrecognized column type: ${columnType}`);
    }

    // ROWS

    for (let i = 0; i < numRows; ++i) {
      const columns: React.ReactElement[] = [];
      for (let j = colStart; j < colEnd; ++j) {
        columns.push(
          <div
            className={classnames({
              'Table-tableCell': true,
              'Table-tableCell__noLeftBorder': j > 0,
              'Table-tableCell__noTopBorder': i > 0,
            })}
            key={`Cell-${i}-${j}`}
            style={{
              height: `${rowHeight}px`,
              lineHeight: `${rowHeight}px`,
              width: `${layout.colWidths[j]}px`,
            }}
          >
            {data[i][j]}
          </div>,
        );
      }

      // TODO: MAY NOT NEED EXPLICIT WIDTH
      rows.push(
        <div
          key={`Row-${i}`}
          style={{
            display: 'flex',
            flexDirection: 'row',
            width: `${headerSize.width}px`,
          }}
        >
          {columns}
        </div>,
      );
    }

    const headerRows = rows.slice(0, headerRowCount);
    const bodyRows = rows.slice(headerRowCount);

    return (
      <div
        className={classnames({
          'Table-panel': true,
          'Table-panel__free': columnType === 'free',
          'Table-panel__locked': columnType === 'locked',
        })}
        style={{ width: `${headerSize.width}px` }}
      >
        <div className={classnames('Table-innerPanelContainer')}>
          <div
            className={classnames(
              'Table-innerPanel',
              'Table-innerPanel-header',
            )}
            ref={this.props.refHeader}
            style={{
              transform:
                columnType === 'locked'
                  ? ''
                  : calculateTransformStyleFromPoint({
                      x: this.offset.x,
                      y: 0,
                    }),
              width: `${headerSize.width}px`,
            }}
          >
            {headerRows}
            {selection && selectionHandleLocations && (
              <TableSelectionOverlay
                paneType={
                  columnType === 'locked' ? 'locked-header' : 'free-header'
                }
                onResizeStart={this.onSelectionOverlayResizeStart}
                selection={selection}
                selectionHandleLocations={selectionHandleLocations}
                tableLayout={layout}
              />
            )}
          </div>
          <div
            className={classnames('Table-innerPanel', 'Table-innerPanel-body')}
            ref={this.props.refBody}
            style={{
              height: `${bodyHeight}px`,
              top: `${headerSize.height}px`,
              transform: calculateTransformStyleFromPoint(this.offset),
              width: `${headerSize.width}px`,
            }}
          >
            {bodyRows}
            {selection && selectionHandleLocations && (
              <TableSelectionOverlay
                paneType={columnType === 'locked' ? 'locked-body' : 'free-body'}
                onResizeStart={this.onSelectionOverlayResizeStart}
                selection={selection}
                selectionHandleLocations={selectionHandleLocations}
                tableLayout={layout}
              />
            )}
          </div>
        </div>
      </div>
    );
  }
}

function calculateTransformStyleFromPoint(point: Point): string {
  return `translate3d(${point.x}px, ${point.y}px, 0px)`;
}
