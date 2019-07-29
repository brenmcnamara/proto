import { GraphQLSchema } from 'graphql';

export type GQLSDLMode = GQLSDLMode$Parser | GQLSDLMode$TSCodeGen;

export type GQLSDLModeType = 'PARSER' | 'TS_CODE_GEN';

export interface GQLSDLMode$Parser {
  error: Error | null;
  schema: GraphQLSchema | null;
  type: 'PARSER';
}

export interface GQLSDLMode$TSCodeGen {
  code: string | null;
  error: Error | null;
  type: 'TS_CODE_GEN';
}
