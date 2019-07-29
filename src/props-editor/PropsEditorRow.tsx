import './PropsEditor.css';

import * as React from 'react';
import classnames from 'classnames';

interface Props {
  name: string;
}

const PropsEditorRow: React.FunctionComponent<Props> = props => {
  return (
    <div className="PropsEditor-row">
      <span className={classnames('margin-right-8', 'PropsEditor-row-name')}>
        {`${props.name}:`}
      </span>
      {props.children}
    </div>
  );
};

export default PropsEditorRow;
