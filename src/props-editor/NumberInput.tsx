import * as React from 'react';
import classnames from 'classnames';

export type NumberType = 'POSITIVE_INT';

interface Props {
  changeKey: string;
  numType: NumberType;
  onChange: (value: number) => void;
  onChangeIsValid?: (value: number) => boolean;
  value: number;
}

interface State {
  changeKey: string;
  valueRaw: string;
}

export default class NumberInput extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      changeKey: props.changeKey,
      valueRaw: String(props.value),
    };
  }

  public static getDerivedStateFromProps(props: Props, state: State): State {
    return {
      ...state,
      changeKey: props.changeKey,
      valueRaw:
        props.changeKey === state.changeKey
          ? state.valueRaw
          : String(props.value),
    };
  }

  public render() {
    return (
      <input
        className={classnames({
          'PropsEditor-input': true,
          'PropsEditor-input__error':
            this.parseValue(this.state.valueRaw) === null,
        })}
        onChange={this.onChange}
        type="text"
        value={this.state.valueRaw}
      />
    );
  }

  private onChange = (event: React.SyntheticEvent): void => {
    // @ts-ignore
    const value = event.target.value;

    this.setState({ valueRaw: value });

    const valueParsed = this.parseValue(value);
    if (typeof valueParsed === 'number') {
      this.props.onChange(valueParsed);
    }
  };

  private parseValue(value: string): number | null {
    let parsed: number | null;

    switch (this.props.numType) {
      case 'POSITIVE_INT':
        parsed = parseValueAsPositiveInt(value);
        break;
      default:
        parsed = null;
        break;
    }

    if (
      typeof parsed === 'number' &&
      this.props.onChangeIsValid &&
      !this.props.onChangeIsValid(parsed)
    ) {
      return null;
    }

    return parsed;
  }
}

const NON_NEGATIVE_INT_REGEX = /^\d+$/;

function parseValueAsPositiveInt(value: string): number | null {
  if (!NON_NEGATIVE_INT_REGEX.test(value)) {
    return null;
  }

  const parsed = parseInt(value, 10);
  return parsed === 0 ? null : parsed;
}
