import * as React from 'react';
import PropsEditorRow from './PropsEditorRow';
import SelectorInput from './SelectorInput';

import { Props as FileEditorProps } from '../file-editor-proto/App';

interface Props {
  changeKey: string;
  onChangeFileEditorProps: (props: FileEditorProps) => void;
  fileEditorProps: FileEditorProps;
}

export default class FileEditorPropsEditor extends React.Component<Props> {
  private get fontOptions(): string[] {
    return ['Helvetica Neue', 'Lato'];
  }

  public render() {
    return (
      <React.Fragment>
        <PropsEditorRow name="Font">
          <SelectorInput
            onSelectOption={this.onSelectFontOption}
            options={this.fontOptions}
            selectedIndex={0}
          />
        </PropsEditorRow>
      </React.Fragment>
    );
  }

  private onSelectFontOption = (primaryFont: string) => {
    this.props.onChangeFileEditorProps({
      ...this.props.fileEditorProps,
      primaryFont,
    });
  };
}
