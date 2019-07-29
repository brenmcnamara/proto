import { EventSubscription } from 'src/EventSubscriptionUtils';
import {
  FileColumn,
  FileRow,
} from './HorizontalScrollFileTree/HorizontalScrollFileTreeTypes';
import { SelectionState, State as FileTreeState } from './FileTree';

export type CallbackChangeState = () => void;

/**
 * This adapter can be used for bridging the gap between an external file system
 * data model and the data model that the file system needs to render within
 * this component. You can subclass this and provide implementations to the
 * required methods.
 */
export default class FileTreeAdapter<TFile> {
  public treeState: FileTreeState = {
    columns: [],
    layout: { colWidths: [] },
    selections: [],
  };

  private callbacksChangeState: CallbackChangeState[] = [];

  // ---------------------------------------------------------------------------
  //
  // REQUIRED OVERRIDES
  //
  // ---------------------------------------------------------------------------

  public getInitialColumn(): FileColumn<SelectionState> {
    return unimplemented('getRootNodes');
  }

  public getInitialColWidthForColumn(
    column: FileColumn<SelectionState>,
  ): number {
    return unimplemented('getInitialColWidthForColumn');
  }

  public getChildFiles(file: TFile): TFile[] {
    return unimplemented('getChildFiles');
  }

  public createFileRow(file: TFile): FileRow<Selection> {
    return unimplemented('renderFileRow');
  }

  // ---------------------------------------------------------------------------
  //
  // FINAL METHODS
  //
  // ---------------------------------------------------------------------------

  // ---------------------------------------------------------------------------
  // CALLBACKS
  // ---------------------------------------------------------------------------

  public registerOnChangeState(
    callback: CallbackChangeState,
  ): EventSubscription {
    this.callbacksChangeState.push(callback);
    return {
      remove: () => {
        const index = this.callbacksChangeState.indexOf(callback);
        if (index >= 0) {
          this.callbacksChangeState.splice(index, 1);
        }
      },
    };
  }

  // ---------------------------------------------------------------------------
  // HOOKS
  // ---------------------------------------------------------------------------

  public onInit() {
    const column = this.getInitialColumn();
    const colWidth = this.getInitialColWidthForColumn(column);

    this.treeState = {
      columns: [column],
      layout: { colWidths: [colWidth] },
      selections: [],
    };
  }

  public onComponentDidMount() {}

  public onComponentWillUnmount() {
    this.callbacksChangeState = [];
  }

  // ---------------------------------------------------------------------------
  // UTILITIES
  // ---------------------------------------------------------------------------

  protected setTreeState(treeState: FileTreeState): void {
    this.treeState = treeState;
    this.callbacksChangeState.forEach(cb => cb());
  }
}

function unimplemented<T>(methodName: string): T {
  throw Error(`Expecting ${methodName} to be implemented by subclass`);
}
