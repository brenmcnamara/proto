/* tslint:disable: no-console no-empty no-unused-variable */

import './PropsEditor.css';

import * as React from 'react';
import NumberInput from './NumberInput';
import PropsEditorRow from './PropsEditorRow';
import StringInput from './StringInput';

import { createColWidths } from '../Utils';
import { Insets } from '../table-proto/Geo';
import { Props as TableProps } from '../table-proto/Table';
import {
  TableSelection,
  TableSelectionRegion,
} from '../table-proto/TableTypes';

interface Props {
  changeKey: string;
  onChangeTableMargins: (margins: Insets) => void;
  onChangeTableProps: (props: TableProps) => void;
  tableMargins: Insets;
  tableProps: TableProps;
}

export default class TablePropsEditor extends React.Component<Props> {
  // ---------------------------------------------------------------------------
  //
  // RENDER
  //
  // ---------------------------------------------------------------------------

  public render() {
    const { changeKey, tableProps, tableMargins } = this.props;

    return (
      <React.Fragment>
        <PropsEditorRow name="Num of Rows">
          <NumberInput
            changeKey={changeKey}
            numType="POSITIVE_INT"
            onChange={this.onChangeNumOfRows}
            onChangeIsValid={this.onChangeNumOfRowsIsValid}
            value={tableProps.layout.numRows}
          />
        </PropsEditorRow>
        <PropsEditorRow name="Num of Cols">
          <NumberInput
            changeKey={changeKey}
            numType="POSITIVE_INT"
            onChange={this.onChangeNumOfCols}
            onChangeIsValid={this.onChangeNumOfColsIsValid}
            value={tableProps.layout.numCols}
          />
        </PropsEditorRow>
        <PropsEditorRow name="Header Row Count">
          <NumberInput
            changeKey={changeKey}
            numType="POSITIVE_INT"
            onChange={this.onChangeHeaderRowCount}
            onChangeIsValid={this.onChangeHeaderRowCountIsValid}
            value={tableProps.layout.headerRowCount}
          />
        </PropsEditorRow>
        <PropsEditorRow name="Locked Col Count">
          <NumberInput
            changeKey={changeKey}
            numType="POSITIVE_INT"
            onChange={this.onChangeLockedColCount}
            onChangeIsValid={this.onChangeLockedColCountIsValid}
            value={tableProps.layout.lockedColCount}
          />
        </PropsEditorRow>
        <PropsEditorRow name="Row Height">
          <NumberInput
            changeKey={changeKey}
            numType="POSITIVE_INT"
            onChange={this.onChangeRowHeight}
            value={tableProps.layout.rowHeight}
          />
        </PropsEditorRow>
        <PropsEditorRow name="Selection">
          <StringInput
            changeKey={changeKey}
            isValidValue={this.isValidSerialSelection}
            onChange={this.onChangeSelection}
            value={serializeSelection(tableProps.selection)}
          />
        </PropsEditorRow>
        <PropsEditorRow name="Table Margins">
          <StringInput
            changeKey={changeKey}
            isValidValue={this.isValidSerialTableMargins}
            onChange={this.onChangeTableMargins}
            value={serializeTableMargins(tableMargins)}
          />
        </PropsEditorRow>
      </React.Fragment>
    );
  }

  // ---------------------------------------------------------------------------
  //
  // UTILITIES
  //
  // ---------------------------------------------------------------------------

  private onChangeNumOfRowsIsValid = (numRows: number): boolean => {
    const {
      headerRowCount,
      lockedColCount,
      numCols,
    } = this.props.tableProps.layout;

    return this.isValidRowsAndCols(
      numRows,
      numCols,
      headerRowCount,
      lockedColCount,
    );
  };

  private onChangeNumOfRows = (numRows: number) => {
    const { layout: prevLayout } = this.props.tableProps;
    const layout = { ...prevLayout, numRows };
    this.props.onChangeTableProps({ ...this.props.tableProps, layout });
  };

  private onChangeNumOfColsIsValid = (numCols: number) => {
    const {
      headerRowCount,
      lockedColCount,
      numRows,
    } = this.props.tableProps.layout;

    return this.isValidRowsAndCols(
      numRows,
      numCols,
      headerRowCount,
      lockedColCount,
    );
  };

  private onChangeNumOfCols = (numCols: number) => {
    const { layout: prevLayout } = this.props.tableProps;
    const colWidths = createColWidths(numCols);
    const layout = { ...prevLayout, colWidths, numCols };
    this.props.onChangeTableProps({ ...this.props.tableProps, layout });
  };

  private onChangeHeaderRowCountIsValid = (headerRowCount: number): boolean => {
    const { lockedColCount, numCols, numRows } = this.props.tableProps.layout;

    return this.isValidRowsAndCols(
      numRows,
      numCols,
      headerRowCount,
      lockedColCount,
    );
  };

  private onChangeHeaderRowCount = (headerRowCount: number) => {
    const { layout: prevLayout } = this.props.tableProps;
    const layout = { ...prevLayout, headerRowCount };
    this.props.onChangeTableProps({ ...this.props.tableProps, layout });
  };

  private onChangeLockedColCountIsValid = (lockedColCount: number) => {
    const { headerRowCount, numCols, numRows } = this.props.tableProps.layout;

    return this.isValidRowsAndCols(
      numRows,
      numCols,
      headerRowCount,
      lockedColCount,
    );
  };

  private onChangeLockedColCount = (lockedColCount: number) => {
    const { layout: prevLayout } = this.props.tableProps;
    const layout = { ...prevLayout, lockedColCount };
    this.props.onChangeTableProps({ ...this.props.tableProps, layout });
  };

  private onChangeRowHeight = (rowHeight: number) => {
    const { layout: prevLayout } = this.props.tableProps;
    const layout = { ...prevLayout, rowHeight };
    this.props.onChangeTableProps({ ...this.props.tableProps, layout });
  };

  private onChangeSelection = (serialSelection: string) => {
    const selection = parseSerialSelection(serialSelection);
    this.props.onChangeTableProps({ ...this.props.tableProps, selection });
  };

  private onChangeTableMargins = (serialMargins: string) => {
    const margins = parseTableMargins(serialMargins);
    this.props.onChangeTableMargins(margins);
  };
  // ---------------------------------------------------------------------------
  //
  // UTILITIES
  //
  // ---------------------------------------------------------------------------

  private isValidRowsAndCols(
    numRows: number,
    numCols: number,
    headerRowCount: number,
    lockedColCount: number,
  ): boolean {
    return numRows >= headerRowCount && numCols >= lockedColCount;
  }

  private isValidSerialSelection = (selection: string): boolean => {
    try {
      parseSerialSelection(selection);
    } catch (error) {
      return false;
    }
    return true;
  };

  private isValidSerialTableMargins = (margins: string): boolean => {
    try {
      parseTableMargins(margins);
    } catch (error) {
      return false;
    }
    return true;
  };
}

const TABLE_SERIAL_SELECTION_REGION_REGEXP = /^\s*(((\d+)-(\d+));((\d+)-(\d+)))?\s*$/;

function parseSerialSelectionRegion(
  serialRegion: string,
): TableSelectionRegion {
  const matcher = serialRegion.match(TABLE_SERIAL_SELECTION_REGION_REGEXP);
  if (!matcher) {
    throw Error('Invalid serial table selection');
  }

  const rowStart = parseInt(matcher[3], 10);
  const rowEnd = parseInt(matcher[4], 10);
  const colStart = parseInt(matcher[6], 10);
  const colEnd = parseInt(matcher[7], 10);

  const nums = [rowStart, rowEnd, colStart, colEnd];
  if (nums.some(Number.isNaN)) {
    throw Error('Invalid region');
  }

  if (rowStart <= rowEnd && colStart <= colEnd) {
    const startCell = { col: colStart, row: rowStart };
    const endCell = { col: colEnd, row: rowEnd };

    return {
      backgroundColor: 'rgba(62, 128, 241, 0.2)',
      borderColor: 'rgba(62, 128, 241, 1.0)',
      endCell,
      isResizable: true,
      startCell,
    };
  }

  throw Error('Invalid region');
}

function parseSerialSelection(serialSelection: string): TableSelection | null {
  if (serialSelection.trim().length === 0) {
    return null;
  }
  return serialSelection.split(',').map(parseSerialSelectionRegion);
}

function serializeSelection(selection: TableSelection | null): string {
  if (!selection) {
    return '';
  }
  return selection.map(serializeSelectionRegion).join(',');
}

function serializeSelectionRegion(selection: TableSelectionRegion): string {
  const { endCell, startCell } = selection;
  return `${startCell.row}-${endCell.row};${startCell.col}-${endCell.col}`;
}

function parseTableMargins(serialMargins: string): Insets {
  const tokens = serialMargins.split(',');
  if (tokens.length !== 4) {
    throw Error('Invalid serial margins');
  }
  const margins = tokens.map(t => parseFloat(t));
  if (margins.some(Number.isNaN)) {
    throw Error('Invalid serial margins');
  }

  const [top, right, bottom, left] = margins;
  return { bottom, left, right, top };
}

function serializeTableMargins(margins: Insets): string {
  return `${margins.top},${margins.left},${margins.bottom},${margins.right}`;
}
