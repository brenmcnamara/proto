import './GQLSDL.css';

import * as jsonPrettyPrint from 'json-stringify-pretty-compact';
import * as React from 'react';
import classnames from 'classnames';

import { GraphQLSchema } from 'graphql';

interface Props {
  schema: GraphQLSchema | null;
}

const JSON_PRETTY_PRINT_CONFIG = { indent: 2, maxLength: 80 };

export default class GQLSDLASTPrinter extends React.Component<Props> {
  public render() {
    const { schema } = this.props;
    if (!schema) {
      return (
        <div
          className={classnames(
            'GQLSDL-astPrinter',
            'GQLSDL-astPrinter__placeholder',
          )}
        >
          {'Nothing to Show!'}
        </div>
      );
    }
    return (
      <div className="GQLSDL-astPrinter">
        <pre>
          {jsonPrettyPrint(jsonFromSchema(schema), JSON_PRETTY_PRINT_CONFIG)}
        </pre>
      </div>
    );
  }
}

function jsonFromSchema(schema: GraphQLSchema): object {
  const IGNORE_TYPES = [
    '__Directive',
    '__DirectiveLocation',
    '__EnumValue',
    '__Field',
    '__InputValue',
    '__Schema',
    '__Type',
    '__TypeKind',
    'Boolean',
    'String',
  ];

  const typeMap = schema.getTypeMap();

  const typeMapRaw = {};

  for (const typeName of Object.keys(typeMap)) {
    if (IGNORE_TYPES.includes(typeName)) {
      continue;
    }

    const type = typeMap[typeName];
    typeMapRaw[typeName] = {
      astNode: type.astNode,
      description: type.description,
      name: type.name,
    };
  }

  return {
    'getTypeMap()': typeMapRaw,
  };
}
