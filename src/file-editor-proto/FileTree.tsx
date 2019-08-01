import './FileTree.css';

import classnames from 'classnames';
import FileTreeItem from './FileTreeItem';

import * as React from 'react';

interface Props {}

export default class FileTree extends React.Component<Props> {
  public render() {
    const items = [];
    for (let i = 0; i < 20; ++i) {
      items.push(<FileTreeItem key={`${i}`} name={`Folder ${i}`} />);
    }
    return (
      <div className={classnames('FileTree-root', 'padding-vert-12')}>
        {items}
      </div>
    );
  }
}
