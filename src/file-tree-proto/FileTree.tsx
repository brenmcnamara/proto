import * as React from 'react';
import FileTreeAdapter from './FileTreeAdapter';
import HorizontalScrollFileTree from './HorizontalScrollFileTree/HorizontalScrollFileTree';

import { EventSubscription } from '../EventSubscriptionUtils';
import {
  FileColumn,
  HorizontalScrollFileTreeLayout,
  HorizontalScrollFileTreeSelection,
} from './HorizontalScrollFileTree/HorizontalScrollFileTreeTypes';

export interface SelectionState {}

export interface Props {
  adapter: FileTreeAdapter<any>;
}

export interface State {
  columns: Array<FileColumn<SelectionState>>;
  layout: HorizontalScrollFileTreeLayout;
  selections: Array<HorizontalScrollFileTreeSelection<SelectionState>>;
}

export default class FileTree extends React.Component<Props, State> {
  private eventSubscriptions: EventSubscription[] = [];

  constructor(props: Props) {
    super(props);

    props.adapter.onInit();
    this.state = props.adapter.treeState;
  }

  public componentDidMount() {
    this.props.adapter.onComponentDidMount();

    this.eventSubscriptions.push(
      this.props.adapter.registerOnChangeState(this.onChangeState),
    );
  }

  public componentWillUnmount() {
    this.props.adapter.onComponentWillUnmount();
    this.eventSubscriptions.forEach(s => s.remove());
    this.eventSubscriptions = [];
  }

  public render() {
    const { columns, layout, selections } = this.state;

    return (
      <HorizontalScrollFileTree
        columns={columns}
        layout={layout}
        selections={selections}
      />
    );
  }

  private onChangeState = () => {
    this.setState(this.props.adapter.treeState);
  };
}
