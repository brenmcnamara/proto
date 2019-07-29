import { Insets } from '../table-proto/Geo';
import { Props as PropsFileTree } from '../file-tree-proto/FileTree';
import { Props as TableProps } from '../table-proto/Table';

export type EditorModeType = 'FileTree' | 'GQLSDL' | 'Table';

export type EditorMode =
  | EditorMode$FileTree
  | EditorMode$GQLSDL
  | EditorMode$Table;

interface EditorMode$FileTree {
  props: PropsFileTree;
  type: 'FileTree';
}

interface EditorMode$GQLSDL {
  type: 'GQLSDL';
}

interface EditorMode$Table {
  type: 'Table';
  tableMargins: Insets;
  tableProps: TableProps;
}
