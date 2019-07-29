import { Insets } from '../table-proto/Geo';
import { Props as FileAppProps } from '../file-editor-proto/App';
import { Props as PropsFileTree } from '../file-tree-proto/FileTree';
import { Props as TableProps } from '../table-proto/Table';

export type EditorModeType = 'FileApp' | 'FileTree' | 'GQLSDL' | 'Table';

export type EditorMode =
  | EditorMode$FileApp
  | EditorMode$FileTree
  | EditorMode$GQLSDL
  | EditorMode$Table;

interface EditorMode$FileApp {
  props: FileAppProps;
  type: 'FileApp';
}

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
