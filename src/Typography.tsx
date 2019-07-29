import './Typography.css';

import * as React from 'react';
import classnames from 'classnames';

interface Props {
  fontType: FontType;
}

export type FontType = 'ASIDE' | 'NORMAL';

export default class Typography extends React.Component<Props> {
  public static defaultProps = {
    fontType: 'NORMAL',
  };

  public render() {
    const { fontType } = this.props;
    return (
      <span
        className={classnames({
          Typography: true,
          Typography__fontTypeAside: fontType === 'ASIDE',
          Typography__fontTypeNormal: fontType === 'NORMAL',
        })}
      >
        {this.props.children}
      </span>
    );
  }
}
