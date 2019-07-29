import './GQLSDL.css';

import * as React from 'react';
import classnames from 'classnames';

interface Props {
  code: string | null;
}

export default class GQLSDLTSCodeGen extends React.Component<Props> {
  public render() {
    const { code } = this.props;
    return (
      <div
        className={classnames({
          'GQLSDL-tsCodeGen': true,
          'GQLSDL-tsCodeGen__placeholder': !code,
        })}
      >
        <pre>{code || 'Nothing to Show!'}</pre>
      </div>
    );
  }
}
