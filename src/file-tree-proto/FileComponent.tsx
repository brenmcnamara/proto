/* tslint:disable: no-console no-empty no-unused-variable */

import './FileComponent.css';

import * as React from 'react';
import classnames from 'classnames';

import { HorizontalScrollFileTreeSelection } from './HorizontalScrollFileTree/HorizontalScrollFileTreeTypes';
import { SelectionState } from './FileTree';

interface Props {
  fileName: string;
  onClick: () => void;
  selection: HorizontalScrollFileTreeSelection<SelectionState> | null;
}

export default class FileComponent extends React.Component<Props> {
  public render() {
    return (
      <div
        className={classnames('FileComponent-root', 'font-body')}
        onClick={this.props.onClick}
      >
        <span>{this.props.fileName}</span>
      </div>
    );
  }
}
