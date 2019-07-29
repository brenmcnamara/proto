import './PropsEditor.css';

import * as React from 'react';
import classnames from 'classnames';

interface Props {
  changeKey: string;
  isValidValue: (val: string) => boolean;
  onChange: (val: string) => void;
  value: string;
}

interface State {
  changeKey: string;
  isValid: boolean;
  valueRaw: string;
}

export default class StringInput extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      changeKey: props.changeKey,
      isValid: props.isValidValue(props.value),
      valueRaw: props.value,
    };
  }

  public static getDerivedStateFromProps(props: Props, state: State): State {
    return {
      ...state,
      changeKey: props.changeKey,
      valueRaw:
        props.changeKey === state.changeKey ? state.valueRaw : props.value,
    };
  }

  public render() {
    return (
      <input
        className={classnames({
          'PropsEditor-input': true,
          'PropsEditor-input__error': !this.state.isValid,
        })}
        onChange={this.onChange}
        type="text"
        value={this.state.valueRaw}
      />
    );
  }

  private onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;

    const isValid = this.props.isValidValue(value);
    this.setState({ isValid, valueRaw: value });

    if (isValid) {
      this.props.onChange(value);
    }
  };
}
