import './PropsEditor.css';

import * as React from 'react';
import classnames from 'classnames';
import SelectorInput from './SelectorInput';
import TablePropsEditor from './TablePropsEditor';

import { EditorMode, EditorModeType } from './PropsEditorTypes';
import { Insets } from '../table-proto/Geo';
import { Props as TableProps } from '../table-proto/Table';

interface Props {
  changeKey: string;
  mode: EditorMode;
  onChangeMode: (mode: EditorMode) => void;
  onChangeModeType: (modeType: string) => void;
}

export default class PropsEditor extends React.Component<Props> {
  public render() {
    const { changeKey, mode } = this.props;
    const options: EditorModeType[] = ['Table', 'FileTree', 'GQLSDL'];

    const modeSelector = (
      <div className="PropsEditor-row">
        <span className={classnames('margin-right-8', 'PropsEditor-row-name')}>
          {'Proto Mode'}
        </span>
        <SelectorInput
          onSelectOption={this.onSelectOption}
          options={options}
          selectedIndex={options.indexOf(mode.type)}
        />
      </div>
    );

    switch (mode.type) {
      case 'GQLSDL': {
        return <div className="PropsEditor">{modeSelector}</div>;
      }

      case 'FileTree': {
        return <div className="PropsEditor">{modeSelector}</div>;
      }

      case 'Table': {
        return (
          <div className="PropsEditor">
            {modeSelector}
            <TablePropsEditor
              changeKey={changeKey}
              onChangeTableMargins={this.onChangeTableMargins}
              onChangeTableProps={this.onChangeTableProps}
              tableMargins={mode.tableMargins}
              tableProps={mode.tableProps}
            />
          </div>
        );
      }
    }
  }

  private onSelectOption = (option: EditorModeType) => {
    this.props.onChangeModeType(option);
  };

  private onChangeTableProps = (tableProps: TableProps) => {
    const { mode, onChangeMode } = this.props;
    if (mode.type !== 'Table') {
      throw Error('Expecting mode to be "Table"');
    }
    onChangeMode({ ...mode, tableProps });
  };

  private onChangeTableMargins = (tableMargins: Insets) => {
    const { mode, onChangeMode } = this.props;
    if (mode.type !== 'Table') {
      throw Error('Expecting mode to be "Table"');
    }
    onChangeMode({ ...mode, tableMargins });
  };
}
