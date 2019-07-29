/* tslint:disable: no-console no-empty no-unused-variable */

import './HorizontalScrollFileTree.css';

import * as React from 'react';
import HorizontalScrollFileTreeColumn from './HorizontalScrollFileTreeColumn';
import HorizontalScrollFileTreeColumnDivide from './HorizontalScrollFileTreeColumnDivide';

import {
  FileColumn,
  HorizontalScrollFileTreeSelection,
  HorizontalScrollFileTreeLayout,
} from './HorizontalScrollFileTreeTypes';

export interface Props<TSelectionState> {
  columns: Array<FileColumn<TSelectionState>>;
  layout: HorizontalScrollFileTreeLayout;
  selections: Array<HorizontalScrollFileTreeSelection<TSelectionState>>;
}

export default class HorizontalScrollFileTree<
  TSelectionState
> extends React.Component<Props<TSelectionState>> {
  public render() {
    const { columns, layout, selections } = this.props;

    return (
      <div className="HorizontalScrollFileTree-root">
        {columns.map((column, index) => [
          <HorizontalScrollFileTreeColumn
            column={column}
            columnIndex={index}
            key={String(index)}
            layout={layout}
            selections={selections}
          />,
          <HorizontalScrollFileTreeColumnDivide
            color="#CCC"
            key={`divide-${index}`}
          />,
        ])}
      </div>
    );
  }
}
