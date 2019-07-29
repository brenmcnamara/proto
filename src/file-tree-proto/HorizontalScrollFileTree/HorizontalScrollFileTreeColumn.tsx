/* tslint:disable: no-console no-empty no-unused-variable */

import './HorizontalScrollFileTreeColumn.css';

import * as React from 'react';

import {
  FileColumn,
  HorizontalScrollFileTreeLayout,
  HorizontalScrollFileTreeSelection,
} from './HorizontalScrollFileTreeTypes';

interface Props<TSelectionState> {
  column: FileColumn<TSelectionState>;
  columnIndex: number;
  layout: HorizontalScrollFileTreeLayout;
  selections: Array<HorizontalScrollFileTreeSelection<TSelectionState>>;
}

export default class HorizontalScrollFileTreeColumn<
  TSelectionState
> extends React.Component<Props<TSelectionState>> {
  public render() {
    const { column, columnIndex, layout } = this.props;

    return (
      <div
        className="HorizontalScrollFileTreeColumn-root"
        style={{ width: `${layout.colWidths[columnIndex]}px` }}
      >
        {column.rows.map((row, index) => (
          <div
            className="HorizontalScrollFileTreeColumn-row"
            key={String(index)}
          >
            {row.render({ selection: null })}
          </div>
        ))}
      </div>
    );
  }
}
