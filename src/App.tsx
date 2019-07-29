import './App.css';

import * as React from 'react';
import DOMTreeAdapter from './file-tree-proto/DOMTreeAdapter';
import FileTree from './file-tree-proto/FileTree';
import FullScreenView from './FullScreenView';
import GQLSDL from './gql-sdl-proto/GQLSDL';
import PropsEditor from './props-editor/PropsEditor';
import Table from './table-proto/Table';

import { createColWidths } from './Utils';
import { EditorMode } from './props-editor/PropsEditorTypes';
import { TableSelection } from './table-proto/TableTypes';

interface Props {}

interface State {
  changeKey: string;
  editorModes: { [key: string]: EditorMode };
  selectedModeType: string;
  showPropsEditor: boolean;
}

const KEYS = {
  D: 68,
  ESC: 27,
};

export default class App extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      changeKey: '1',
      editorModes: {
        FileTree: {
          props: {
            adapter: new DOMTreeAdapter(),
          },
          type: 'FileTree',
        },
        GQLSDL: {
          type: 'GQLSDL',
        },
        Table: {
          tableMargins: { bottom: 0, left: 0, top: 0, right: 0 },
          tableProps: {
            layout: {
              colWidths: createColWidths(50),
              headerRowCount: 1,
              lockedColCount: 2,
              numCols: 50,
              numRows: 50,
              rowHeight: 32,
            },
            onCommitSelection: this.onCommitTableSelection,
            selection: null,
          },
          type: 'Table',
        },
      },
      selectedModeType: 'Table',
      showPropsEditor: false,
    };
  }

  public componentDidMount() {
    window.addEventListener('keydown', this.onKeydown);
  }

  public componentWillUnmount() {
    window.removeEventListener('keydown', this.onKeydown);
  }

  public render() {
    const {
      changeKey,
      editorModes,
      selectedModeType,
      showPropsEditor,
    } = this.state;
    const selectedEditorMode = editorModes[selectedModeType];

    let proto;
    switch (selectedEditorMode.type) {
      case 'GQLSDL': {
        proto = <GQLSDL />;
        break;
      }

      case 'FileTree': {
        proto = <FileTree {...selectedEditorMode.props} />;
        break;
      }

      case 'Table': {
        const m = selectedEditorMode.tableMargins;
        proto = (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              flexGrow: 1,
              margin: `${m.top}px ${m.right}px ${m.bottom}px ${m.left}px`,
            }}
          >
            <Table {...selectedEditorMode.tableProps} />
          </div>
        );
        break;
      }
    }

    return (
      <FullScreenView>
        {showPropsEditor && (
          <div className="App-propsEditorContainer">
            <PropsEditor
              changeKey={changeKey}
              mode={selectedEditorMode}
              onChangeMode={this.onChangeMode}
              onChangeModeType={this.onChangeModeType}
            />
          </div>
        )}
        <div className="App">
          <div className="App-protoContainer">{proto}</div>
        </div>
      </FullScreenView>
    );
  }

  private onChangeMode = (mode: EditorMode) => {
    this.setState(prevState => ({
      editorModes: {
        ...prevState.editorModes,
        [prevState.selectedModeType]: mode,
      },
    }));
  };

  private onChangeModeType = (modeType: string) => {
    this.setState({ selectedModeType: modeType });
  };

  private onCommitTableSelection = (selection: TableSelection) => {
    this.setState(prevState => ({
      changeKey: generateNewChangeKey(prevState.changeKey),
      editorModes: {
        ...prevState.editorModes,
        Table: {
          ...prevState.editorModes.Table,
          // @ts-ignore
          tableProps: { ...prevState.editorModes.Table.tableProps, selection },
        },
      },
    }));
  };

  private onKeydown = (event: KeyboardEvent) => {
    if (event.which === KEYS.D && event.altKey) {
      this.setState(prevState => ({
        showPropsEditor: !prevState.showPropsEditor,
      }));
    } else if (event.which === KEYS.ESC) {
      this.setState({ showPropsEditor: false });
    }
  };
}

function generateNewChangeKey(prevChangeKey: string): string {
  const asInt = parseInt(prevChangeKey, 10);
  if (Number.isNaN(asInt)) {
    return '1';
  }

  return `${asInt + 1}`;
}
