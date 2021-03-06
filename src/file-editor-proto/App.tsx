import './App.css';

import * as React from 'react';
import FileEditor from './FileEditor';

export interface Props {
  primaryFont: string;
}

export default class App extends React.Component<Props> {
  public render() {
    const { primaryFont } = this.props;
    return (
      <div
        className="FileApp"
        style={{ fontFamily: `'${primaryFont}', sans-serif` }}
      >
        <div className="FileApp-mainPane">
          <div className="FileApp-mainPane-content">
            <FileEditor />
          </div>
        </div>
      </div>
    );
  }
}
