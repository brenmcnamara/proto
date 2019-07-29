export interface FileColumn<TSelectionState> {
  rows: Array<FileRow<TSelectionState>>;
}

export interface FileRowProps<TSelectionState> {
  selection: HorizontalScrollFileTreeSelection<TSelectionState> | null;
}

export interface FileRow<TSelectionState> {
  render: (props: FileRowProps<TSelectionState>) => React.ReactElement;
}

export interface FileLocation {
  col: number;
  row: number;
}

export interface HorizontalScrollFileTreeLayout {
  colWidths: number[];
}

export interface HorizontalScrollFileTreeSelection<TSelectionState> {
  location: FileLocation;
  state: TSelectionState;
}
