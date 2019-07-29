/* tslint:disable:max-classes-per-file no-console no-empty no-unused-variable */

import './Table.css';

import * as React from 'react';
import TableSelectionRegionComp, {
  TableSelectionRegionLayout,
} from './TableSelectionRegionComp';

import {
  RectCorner,
  ResizeHandleDragState,
  TablePaneType,
  TableSelection,
  TableSelectionRegion,
  TableSelectionRegionHandleLocationSet,
  TableLayout,
} from './TableTypes';
import {
  calculateSizeForCells,
  convertFromTableCoordinates,
  convertToTableCoordinates,
} from './TableUtils';

interface Props {
  onResizeStart: (dragState: ResizeHandleDragState) => void;
  paneType: TablePaneType;
  selection: TableSelection;
  selectionHandleLocations: Array<TableSelectionRegionHandleLocationSet | null>;
  tableLayout: TableLayout;
}

interface State {
  regionLayouts: Array<TableSelectionRegionLayout | null>;
}

export default class TableSelectionOverlay extends React.Component<
  Props,
  State
> {
  constructor(props: Props) {
    super(props);
    this.state = {
      regionLayouts: props.selection.map((region, i) =>
        TableSelectionOverlay.calculateRegionLayout(
          region,
          props.selectionHandleLocations[i],
          props,
        ),
      ),
    };
  }

  public static getDerivedStateFromProps(props: Props): State {
    return {
      regionLayouts: props.selection.map((region, i) =>
        TableSelectionOverlay.calculateRegionLayout(
          region,
          props.selectionHandleLocations[i],
          props,
        ),
      ),
    };
  }

  public render() {
    const { selection } = this.props;
    const { regionLayouts } = this.state;

    const regions: React.ReactElement[] = [];
    const resizeHandles: Array<React.ReactElement | undefined> = [];

    // TODO: SHOULD MODIFY SO THAT KEY IS NOT INDEX
    for (let i = 0; i < selection.length; ++i) {
      const layout = regionLayouts[i];
      if (layout) {
        const region = selection[i];
        regions.push(
          <TableSelectionRegionComp
            key={`SelectionRegion-${i}`}
            layout={layout}
            region={region}
          />,
        );

        if (
          region.isResizable &&
          Object.keys(layout.resizeHandles).length > 0
        ) {
          resizeHandles.push(
            layout.resizeHandles['top-left'] && (
              <div
                className="TableSelectionOverlay-resizeHandle"
                key={`ResizeHandle-${i}-topLeft`}
                onMouseDown={this.onMouseDownResizeHandle(region, 'top-left')}
                style={{
                  left: `${layout.rect.origin.x}px`,
                  top: `${layout.rect.origin.y}px`,
                }}
              />
            ),
            layout.resizeHandles['top-right'] && (
              <div
                className="TableSelectionOverlay-resizeHandle"
                key={`ResizeHandle-${i}-topRight`}
                onMouseDown={this.onMouseDownResizeHandle(region, 'top-right')}
                style={{
                  left: `${layout.rect.origin.x + layout.rect.size.width}px`,
                  top: `${layout.rect.origin.y}px`,
                }}
              />
            ),
            layout.resizeHandles['bottom-left'] && (
              <div
                className="TableSelectionOverlay-resizeHandle"
                key={`ResizeHandle-${i}-bottomLeft`}
                onMouseDown={this.onMouseDownResizeHandle(
                  region,
                  'bottom-left',
                )}
                style={{
                  left: `${layout.rect.origin.x}px`,
                  top: `${layout.rect.origin.y + layout.rect.size.height}px`,
                }}
              />
            ),
            layout.resizeHandles['bottom-right'] && (
              <div
                className="TableSelectionOverlay-resizeHandle"
                key={`ResizeHandle-${i}-bottomRight`}
                onMouseDown={this.onMouseDownResizeHandle(
                  region,
                  'bottom-right',
                )}
                style={{
                  left: `${layout.rect.origin.x + layout.rect.size.width}px`,
                  top: `${layout.rect.origin.y + layout.rect.size.height}px`,
                }}
              />
            ),
          );
        }
      }
    }

    return (
      <React.Fragment>
        {regions}
        {resizeHandles}
      </React.Fragment>
    );
  }

  private onMouseDownResizeHandle = (
    region: TableSelectionRegion,
    initialResizeHandleCorner: RectCorner,
  ) => (event: React.MouseEvent<HTMLDivElement>) => {
    const dragState: ResizeHandleDragState = {
      initialDragPoint: { x: event.clientX, y: event.clientY },
      initialPaneType: this.props.paneType,
      initialRegion: region,
      initialRegionIndex: this.props.selection.indexOf(region),
      initialResizeHandleCorner,
    };
    this.props.onResizeStart(dragState);
  };

  // The props are defined for entire table, but we need to scope the layout
  // information in the props to particular pane we are rendering. This method
  // generates a layout for showing a selection on the portion of the table
  // given by the pane type. This requires figuring out if the selection is
  // event showing in the pane type and, if so, culling and transforming that
  // selection for the correct coordinate space.
  public static calculateRegionLayout(
    region: TableSelectionRegion,
    handleLocations: TableSelectionRegionHandleLocationSet | null,
    props: Props,
  ): TableSelectionRegionLayout | null {
    const handleLocationsWithDefault = handleLocations || {
      'bottom-right': true,
      'top-left': true,
    };

    const { paneType, tableLayout } = props;

    const paneTable = {
      'free-body': {
        maxHor: Infinity,
        maxVert: Infinity,
        offsetHor: tableLayout.lockedColCount,
        offsetVert: tableLayout.headerRowCount,
        resizeHandles: () => {
          const hasTopLeft =
            handleLocationsWithDefault['top-left'] &&
            region.startCell.col >= tableLayout.lockedColCount &&
            region.startCell.row >= tableLayout.headerRowCount;

          const hasTopRight =
            handleLocationsWithDefault['top-right'] &&
            region.endCell.col >= tableLayout.lockedColCount &&
            region.startCell.row >= tableLayout.headerRowCount;

          const hasBottomLeft =
            handleLocationsWithDefault['bottom-left'] &&
            region.startCell.col >= tableLayout.lockedColCount &&
            region.endCell.row >= tableLayout.headerRowCount;

          const hasBottomRight =
            handleLocationsWithDefault['bottom-right'] &&
            region.endCell.col >= tableLayout.lockedColCount &&
            region.endCell.row >= tableLayout.headerRowCount;

          const resizeHandles: TableSelectionRegionHandleLocationSet = {};

          if (hasTopLeft) {
            resizeHandles['top-left'] = true;
          }

          if (hasTopRight) {
            resizeHandles['top-right'] = true;
          }

          if (hasBottomLeft) {
            resizeHandles['bottom-left'] = true;
          }

          if (hasBottomRight) {
            resizeHandles['bottom-right'] = true;
          }
          return resizeHandles;
        },
      },
      'free-header': {
        maxHor: Infinity,
        maxVert: tableLayout.headerRowCount - 1,
        offsetHor: tableLayout.lockedColCount,
        offsetVert: 0,
        resizeHandles: () => {
          const hasTopLeft =
            handleLocationsWithDefault['top-left'] &&
            region.startCell.col >= tableLayout.lockedColCount &&
            region.startCell.row < tableLayout.headerRowCount;

          const hasTopRight =
            handleLocationsWithDefault['top-right'] &&
            region.endCell.col >= tableLayout.lockedColCount &&
            region.startCell.row < tableLayout.headerRowCount;

          const hasBottomLeft =
            handleLocationsWithDefault['bottom-left'] &&
            region.startCell.col >= tableLayout.lockedColCount &&
            region.endCell.row < tableLayout.headerRowCount;

          const hasBottomRight =
            handleLocationsWithDefault['bottom-right'] &&
            region.endCell.col >= tableLayout.lockedColCount &&
            region.endCell.row < tableLayout.headerRowCount;

          const resizeHandles: TableSelectionRegionHandleLocationSet = {};

          if (hasTopLeft) {
            resizeHandles['top-left'] = true;
          }

          if (hasTopRight) {
            resizeHandles['top-right'] = true;
          }

          if (hasBottomLeft) {
            resizeHandles['bottom-left'] = true;
          }

          if (hasBottomRight) {
            resizeHandles['bottom-right'] = true;
          }
          return resizeHandles;
        },
      },
      'locked-body': {
        maxHor: tableLayout.lockedColCount - 1,
        maxVert: Infinity,
        offsetHor: 0,
        offsetVert: tableLayout.headerRowCount,
        resizeHandles: () => {
          const hasTopLeft =
            handleLocationsWithDefault['top-left'] &&
            region.startCell.col < tableLayout.lockedColCount &&
            region.startCell.row >= tableLayout.headerRowCount;

          const hasTopRight =
            handleLocationsWithDefault['top-right'] &&
            region.endCell.col < tableLayout.lockedColCount &&
            region.startCell.row >= tableLayout.headerRowCount;

          const hasBottomLeft =
            handleLocationsWithDefault['bottom-left'] &&
            region.startCell.col < tableLayout.lockedColCount &&
            region.endCell.row >= tableLayout.headerRowCount;

          const hasBottomRight =
            handleLocationsWithDefault['bottom-right'] &&
            region.endCell.col < tableLayout.lockedColCount &&
            region.endCell.row >= tableLayout.headerRowCount;

          const resizeHandles: TableSelectionRegionHandleLocationSet = {};

          if (hasTopLeft) {
            resizeHandles['top-left'] = true;
          }

          if (hasTopRight) {
            resizeHandles['top-right'] = true;
          }

          if (hasBottomLeft) {
            resizeHandles['bottom-left'] = true;
          }

          if (hasBottomRight) {
            resizeHandles['bottom-right'] = true;
          }
          return resizeHandles;
        },
      },
      'locked-header': {
        maxHor: tableLayout.lockedColCount - 1,
        maxVert: tableLayout.headerRowCount - 1,
        offsetHor: 0,
        offsetVert: 0,
        resizeHandles: () => {
          const hasTopLeft =
            handleLocationsWithDefault['top-left'] &&
            region.startCell.col < tableLayout.lockedColCount &&
            region.startCell.row < tableLayout.headerRowCount;

          const hasTopRight =
            handleLocationsWithDefault['top-right'] &&
            region.endCell.col < tableLayout.lockedColCount &&
            region.startCell.row < tableLayout.headerRowCount;

          const hasBottomLeft =
            handleLocationsWithDefault['bottom-left'] &&
            region.startCell.col < tableLayout.lockedColCount &&
            region.endCell.row < tableLayout.headerRowCount;

          const hasBottomRight =
            handleLocationsWithDefault['bottom-right'] &&
            region.endCell.col < tableLayout.lockedColCount &&
            region.endCell.row < tableLayout.headerRowCount;

          const resizeHandles: TableSelectionRegionHandleLocationSet = {};

          if (hasTopLeft) {
            resizeHandles['top-left'] = true;
          }

          if (hasTopRight) {
            resizeHandles['top-right'] = true;
          }

          if (hasBottomLeft) {
            resizeHandles['bottom-left'] = true;
          }

          if (hasBottomRight) {
            resizeHandles['bottom-right'] = true;
          }
          return resizeHandles;
        },
      },
    };

    const paneOptions = paneTable[paneType];

    const startCellRelative = convertFromTableCoordinates(
      paneType,
      region.startCell,
      tableLayout,
    );

    const endCellRelative = convertFromTableCoordinates(
      paneType,
      region.endCell,
      tableLayout,
    );

    // Perform culling / clipping on the start and end cell.
    const startCellFinal = {
      col: Math.max(0, startCellRelative.col),
      row: Math.max(0, startCellRelative.row),
    };

    const endCellFinal = {
      col: Math.min(paneOptions.maxHor, endCellRelative.col),
      row: Math.min(paneOptions.maxVert, endCellRelative.row),
    };

    // After culling the cell region, if there's nothing left, that means the
    // region does not exist in this pane.
    if (
      startCellFinal.row > endCellFinal.row ||
      startCellFinal.col > endCellFinal.col
    ) {
      return null;
    }

    // Convert into table coordinates.
    const startCellFinalTable = convertToTableCoordinates(
      paneType,
      startCellFinal,
      tableLayout,
    );

    const endCellFinalTable = convertToTableCoordinates(
      paneType,
      endCellFinal,
      tableLayout,
    );

    const sizePx = calculateSizeForCells(
      startCellFinalTable,
      endCellFinalTable,
      tableLayout,
    );

    let x: number = 0;
    for (let i = paneOptions.offsetHor; i < startCellFinalTable.col; ++i) {
      x += tableLayout.colWidths[i];
    }

    const originPx = { x, y: startCellFinal.row * tableLayout.rowHeight };

    const hasBorders = {
      bottom: paneOptions.maxVert >= endCellRelative.row,
      left: 0 <= startCellRelative.col,
      right: paneOptions.maxHor >= endCellRelative.col,
      top: 0 <= startCellRelative.row,
    };

    return {
      hasBorders,
      rect: { origin: originPx, size: sizePx },
      resizeHandles: paneOptions.resizeHandles(),
    };
  }
}
