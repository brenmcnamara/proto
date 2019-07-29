import './PropsEditor.css';

import * as React from 'react';
import classnames from 'classnames';

interface Props {
  changeKey: string;
  onChange: (isChecked: boolean) => void;
  value: boolean;
}

interface State {
  changeKey: string;
  value: boolean;
}

export default class CheckboxInput extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      changeKey: props.changeKey,
      value: props.value,
    };
  }

  public static getDerivedStateFromProps(props: Props, state: State): State {
    return {
      ...state,
      changeKey: props.changeKey,
      value: state.changeKey === props.changeKey ? state.value : props.value,
    };
  }

  public render() {
    return (
      <input
        checked={this.state.value}
        className={classnames('PropsEditor-input', 'PropsEditor-checkbox')}
        onChange={this.onChange}
        type="checkbox"
      />
    );
  }

  private onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { checked } = event.target;
    this.setState({ value: checked });
    this.props.onChange(checked);
  };
}
