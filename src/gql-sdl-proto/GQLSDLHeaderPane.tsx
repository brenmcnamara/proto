import './GQLSDL.css';

import * as React from 'react';
import classnames from 'classnames';

import { GQLSDLMode, GQLSDLModeType } from './GQLSDLMode';

interface Props {
  mode: GQLSDLMode;
  onChangeModeType: (modeType: GQLSDLModeType) => void;
  onClickBuild: () => void;
}

export default class GQLSDLHeaderPane extends React.Component<Props> {
  public render() {
    const { mode } = this.props;
    const options = ['PARSER', 'TS_CODE_GEN'];
    return (
      <div className="GQLSDL-headerPane">
        <div className="GQLSDL-headerPane-left">
          <select
            className={classnames('select', 'GQLSDL-select')}
            onChange={this.onChangeSelect}
          >
            {options.map(o => (
              <option key={o} selected={o === mode.type} value={o}>
                {o}
              </option>
            ))}
          </select>
        </div>
        <div className="GQLSDL-headerPane-right">
          <button
            className={classnames('button', 'GQLSDL-button')}
            onClick={this.props.onClickBuild}
          >
            {'Build'}
          </button>
        </div>
      </div>
    );
  }

  private onChangeSelect = (event: React.SyntheticEvent) => {
    // @ts-ignore
    const { value } = event.target;

    this.props.onChangeModeType(value);
  };
}
