import './PropsEditor.css';

import * as React from 'react';

interface Props<TOption extends string> {
  onSelectOption: (option: TOption) => void;
  options: TOption[];
  selectedIndex: number;
}

export default class SelectorInput<
  TOption extends string
> extends React.Component<Props<TOption>> {
  public render() {
    const { options, selectedIndex } = this.props;
    return (
      <select
        className="PropsEditor-select"
        defaultValue={options[selectedIndex]}
        onChange={this.onChangeSelect}
      >
        {options.map((optionValue, i) => (
          <option
            className="PropsEditor-option"
            key={optionValue}
            value={optionValue}
          >
            {optionValue}
          </option>
        ))}
      </select>
    );
  }

  private onChangeSelect = (event: React.SyntheticEvent) => {
    // @ts-ignore
    this.props.onSelectOption(event.target.value);
  };
}
