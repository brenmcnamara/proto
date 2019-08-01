import './FileTreeItem.css';

import * as React from 'react';
import classnames from 'classnames';

interface Props {
  name: string;
}

export default class FileTreeItem extends React.Component<Props> {
  public render() {
    return (
      <div className="FileTreeItem-root">
        <div className="FileTreeItem-content">
          <i
            className={classnames(
              'far',
              'fa-folder',
              'icon-size-20',
              'icon-color-white',
              'margin-right-12',
            )}
          />
          <div className="FileTreeItem-name">{this.props.name}</div>
        </div>
      </div>
    );
  }
}
