/* tslint:disable: no-console no-empty no-unused-variable */

import './HorizontalScrollFileTree.css';

import * as React from 'react';

interface Props {
  color: string;
}

export default class HorizontalScrollFileTreeColumnDivide extends React.Component<
  Props
> {
  public render() {
    return (
      <div
        className="HorizontalScrollFileTree-columnDivide"
        style={{ backgroundColor: `${this.props.color}` }}
      />
    );
  }
}
