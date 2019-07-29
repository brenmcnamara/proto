import './GQLSDL.css';

import * as React from 'react';

interface Props {
  onChange: (code: string) => void;
}

export default class GQLSDLEditor extends React.Component<Props> {
  private rootRef: React.RefObject<HTMLDivElement> = React.createRef();

  public render() {
    return (
      <div
        className="GQLSDL-editor"
        contentEditable
        onInput={this.onInput}
        ref={this.rootRef}
      />
    );
  }

  private onInput = (event: React.SyntheticEvent) => {
    const { current } = this.rootRef;
    if (!current) {
      return;
    }

    const NON_BREAKING_SPACE = String.fromCharCode(160);
    const code = current.innerText.replace(NON_BREAKING_SPACE, ' ');

    this.props.onChange(code);
  };
}
