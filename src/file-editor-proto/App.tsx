import './App.css';

import * as React from 'react';
import FileEditor from './FileEditor';

export interface Props {}

export default class App extends React.Component<Props> {
  public render() {
    return (
      <div className="FileApp">
        <div className="FileApp-sidePane">
          <div className="FileApp-sidePane-toolbar" />
          <div className="FileApp-sidePane-content" />
        </div>
        <div className="FileApp-mainPane">
          <div className="FileApp-mainPane-toolbar" />
          <div className="FileApp-mainPane-content">
            <FileEditor />
          </div>
        </div>
      </div>
    );
  }
}
