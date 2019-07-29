import './GQLSDL.css';

import * as React from 'react';
import GQLSDLEditor from './GQLSDLEditor';
import GQLSDLHeaderPane from './GQLSDLHeaderPane';
import GQLSDLResultPane from './GQLSDLResultPane';
import tsCodeGen from '../code-gen-proto/tsCodeGen';

import { buildSchema, GraphQLSchema } from 'graphql';
import { GQLSDLMode, GQLSDLModeType } from './GQLSDLMode';

interface Props {}

interface State {
  code: string;
  modes: { [modeType: string]: GQLSDLMode };
  selectedModeType: GQLSDLModeType;
}

export default class GQLSDL extends React.Component<Props, State> {
  public state: State = {
    code: '',
    modes: {
      PARSER: { error: null, schema: null, type: 'PARSER' },
      TS_CODE_GEN: { code: null, error: null, type: 'TS_CODE_GEN' },
    },
    selectedModeType: 'PARSER',
  };

  public render() {
    const mode = this.state.modes[this.state.selectedModeType];

    return (
      <div className="GQLSDL">
        <GQLSDLHeaderPane
          mode={mode}
          onChangeModeType={this.onChangeModeType}
          onClickBuild={this.onClickBuild}
        />
        <div className="GQLSDL-content">
          <div className="GQLSDL-editorPane">
            <GQLSDLEditor onChange={this.onChangeEditor} />
          </div>
          <GQLSDLResultPane mode={mode} />
        </div>
      </div>
    );
  }

  private onChangeEditor = (code: string) => {
    this.setState({ code });
  };

  private onClickBuild = () => {
    this.setState((prevState: State) => {
      const modes = { ...prevState.modes };
      const prevMode = modes[prevState.selectedModeType];

      let mode: GQLSDLMode = prevMode;

      switch (prevMode.type) {
        case 'PARSER': {
          let schema: GraphQLSchema;

          try {
            schema = buildSchema(prevState.code);
          } catch (error) {
            mode = { ...prevMode, error };
            break;
          }
          mode = { ...prevMode, error: null, schema };
          break;
        }

        case 'TS_CODE_GEN': {
          let schema: GraphQLSchema;

          try {
            schema = buildSchema(prevState.code);
          } catch (error) {
            mode = { ...prevMode, error };
            break;
          }

          let code: string;

          try {
            code = tsCodeGen(schema);
          } catch (error) {
            mode = { ...prevMode, error };
            break;
          }

          mode = { ...prevMode, code, error: null };
          break;
        }
      }

      return { modes: { ...modes, [mode.type]: mode } };
    });
  };

  private onChangeModeType = (modeType: GQLSDLModeType) => {
    this.setState({ selectedModeType: modeType });
  };
}
