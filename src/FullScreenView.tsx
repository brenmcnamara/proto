import * as React from 'react';

export default class FullScreenView extends React.Component<{}> {
  public render() {
    return <div style={styles.root}>{this.props.children}</div>;
  }
}

const styles = {
  root: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  } as React.CSSProperties,
};
