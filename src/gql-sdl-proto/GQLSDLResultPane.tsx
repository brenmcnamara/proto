import './GQLSDL.css';

import GQLSDLASTPrinter from './GQLSDLASTPrinter';
import GQLSDLTSCodeGen from './GQLSDLTSCodeGen';

import {
  GQLSDLMode,
  GQLSDLMode$Parser,
  GQLSDLMode$TSCodeGen,
} from './GQLSDLMode';

import * as React from 'react';

interface Props {
  mode: GQLSDLMode;
}

export default class GQLSDLResultPane extends React.Component<Props> {
  public render() {
    const { mode } = this.props;

    switch (mode.type) {
      case 'PARSER': {
        return <GQLSDLResultPaneParser mode={mode} />;
      }

      case 'TS_CODE_GEN': {
        return <GQLSDLResultPaneTSCodeGen mode={mode} />;
      }
    }
  }
}

function GQLSDLResultPaneParser(props: { mode: GQLSDLMode$Parser }) {
  const { error, schema } = props.mode;
  return (
    <div className="GQLSDL-resultPane">
      {error && (
        <div className="GQLSDL-resultPane-error">{error.toString()}</div>
      )}
      {!error && <GQLSDLASTPrinter schema={schema} />}
    </div>
  );
}

function GQLSDLResultPaneTSCodeGen(props: { mode: GQLSDLMode$TSCodeGen }) {
  const { code, error } = props.mode;
  return (
    <div className="GQLSDL-resultPane">
      {error && (
        <div className="GQLSDL-resultPane-error">{error.toString()}</div>
      )}
      {!error && <GQLSDLTSCodeGen code={code} />}
    </div>
  );
}
