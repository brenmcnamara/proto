/* tslint:disable: no-console no-empty no-unused-variable */

import * as React from 'react';

import FileComponent from './FileComponent';
import FileTreeAdapter from './FileTreeAdapter';

import {
  FileColumn,
  FileRow,
  FileRowProps,
} from './HorizontalScrollFileTree/HorizontalScrollFileTreeTypes';
import { SelectionState } from './FileTree';

const INVALID_NODE_NAMES = ['#text', 'NOSCRIPT', '#comment'];

export interface File {
  colIndex: number;
  node: Node;
  rowIndex: number;
}

export default class DOMTreeAdapter extends FileTreeAdapter<File> {
  // override
  public getInitialColWidthForColumn(
    column: FileColumn<SelectionState>,
  ): number {
    return 250;
  }

  // override
  public getInitialColumn(): FileColumn<SelectionState> {
    const root = { colIndex: -1, node: document.body, rowIndex: 0 };
    return {
      rows: this.getChildFiles(root).map(file => this.createFileRow(file)),
    };
  }

  // override
  public getChildFiles(file: File): File[] {
    const nodes: Node[] = Array.prototype.slice.call(file.node.childNodes);
    return nodes
      .filter(node => !INVALID_NODE_NAMES.includes(node.nodeName))
      .map((node, i) => ({ colIndex: file.colIndex + 1, node, rowIndex: i }));
  }

  // override
  public createFileRow(file: File): FileRow<SelectionState> {
    const fileName =
      file.node instanceof Element && file.node.className.trim().length > 0
        ? file.node.className.trim()
        : file.node.nodeName;

    console.log(file.node.nodeType);

    return {
      render: (props: FileRowProps<SelectionState>) => (
        <FileComponent
          fileName={fileName}
          onClick={this.onClickFile(file)}
          selection={props.selection}
        />
      ),
    };
  }

  private onClickFile = (file: File) => () => {
    const columns = this.treeState.columns.slice();
    const colWidths = this.treeState.layout.colWidths.slice();

    // Clear out existing columns after the column of the clicked file.
    columns.splice(file.colIndex + 1, columns.length - file.colIndex - 1);
    colWidths.splice(file.colIndex + 1, columns.length - file.colIndex - 1);

    const childFiles = this.getChildFiles(file);
    const column = { rows: childFiles.map(child => this.createFileRow(child)) };
    const colWidth = this.getInitialColWidthForColumn(column);

    columns.push(column);
    colWidths.push(colWidth);

    const layout = { colWidths };

    // Remove any selections on files that have been removed.
    const selections = this.treeState.selections.filter(
      sel => sel.location.col <= file.colIndex,
    );

    this.setTreeState({ columns, layout, selections });
  };
}
