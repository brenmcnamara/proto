/* tslint:disable:max-classes-per-file no-console no-empty no-unused-variable */

import './Table.css';

import * as React from 'react';
import classnames from 'classnames';

import {
  EventSubscription,
  subscribedToDOMEvent,
} from '../EventSubscriptionUtils';
import { ScrollDirection, TableLayout } from './TableTypes';
import { MinMaxRange, Point } from './Geo';
import {
  SCROLL_BAR_MARGIN_PX,
  SCROLL_BAR_THICKNESS_PX,
  SPACING_BETWEEN_SCROLL_BARS_PX,
} from './TableConstants';

export type ScrollBarDragStateCallback = (
  dragState: ScrollBarDragState,
) => void;

export interface ScrollBarDragState {
  initialDragPoint: Point;
  initialScrollOffset: Point;
  scrollDirection: ScrollDirection;
  scrollOffset: Point | null;
  stage: 'BEGIN' | 'MOVE' | 'END';
}

interface Props {
  layout: TableLayout;
}

interface ScrollBarLayout {
  length: number;
  offset: number;
}

interface State {
  shouldShowHorBar: boolean;
  shouldShowVertBar: boolean;
}

export default class TableScrollOverlay extends React.Component<Props, State> {
  public state: State = {
    shouldShowHorBar: false,
    shouldShowVertBar: false,
  };

  private callbacksDragScrollBar: ScrollBarDragStateCallback[] = [];
  private dragState: ScrollBarDragState | null = null;
  private offsetXRange: MinMaxRange = { max: 0, min: 0 };
  private offsetYRange: MinMaxRange = { max: 0, min: 0 };
  private scrollEventSubscriptions: EventSubscription[] = [];
  private scrollOffset: Point = { x: 0, y: 0 };

  private rootRef: React.RefObject<HTMLDivElement> = React.createRef();
  private scrollBarVertRef: React.RefObject<HTMLDivElement> = React.createRef();
  private scrollBarHorRef: React.RefObject<HTMLDivElement> = React.createRef();

  // ---------------------------------------------------------------------------
  //
  // PUBLIC METHODS
  //
  // ---------------------------------------------------------------------------

  public updateOffset(
    offset: Point,
    offsetXRange: MinMaxRange,
    offsetYRange: MinMaxRange,
  ) {
    const { current: currentRoot } = this.rootRef;

    if (!currentRoot) {
      return;
    }

    // MANAGE VERTICAL SCROLL BAR

    const { current: currentVert } = this.scrollBarVertRef;
    if (currentVert) {
      const vertScrollBarLayout = this.getVertScrollBarLayout(
        offset,
        offsetYRange,
      );

      currentVert.style.height = `${vertScrollBarLayout.length}px`;
      currentVert.style.top = `${vertScrollBarLayout.offset}px`;
      currentVert.style.display =
        offsetYRange.max > offsetYRange.min ? 'block' : 'none';
    }

    // MANAGE HORIZONTAL SCROLL BAR

    const { current: currentHor } = this.scrollBarHorRef;
    if (currentHor) {
      const horScrollBarOffset = this.getHorScrollBarLayout(
        offset,
        offsetXRange,
      );

      currentHor.style.width = `${horScrollBarOffset.length}px`;
      currentHor.style.left = `${horScrollBarOffset.offset}px`;
      currentHor.style.display =
        offsetXRange.max > offsetXRange.min ? 'block' : 'none';
    }

    this.offsetXRange = offsetXRange;
    this.offsetYRange = offsetYRange;
    this.scrollOffset = offset;
  }

  public registerDragScrollBar(
    cb: ScrollBarDragStateCallback,
  ): EventSubscription {
    this.callbacksDragScrollBar.push(cb);
    return {
      remove: () => {
        const index = this.callbacksDragScrollBar.indexOf(cb);
        if (index >= 0) {
          this.callbacksDragScrollBar.splice(index, 1);
        }
      },
    };
  }

  // ---------------------------------------------------------------------------
  //
  // LIFECYCLE
  //
  // ---------------------------------------------------------------------------

  public componentWillMount() {
    this.callbacksDragScrollBar = [];
  }

  // ---------------------------------------------------------------------------
  //
  // RENDER
  //
  // ---------------------------------------------------------------------------

  public render() {
    const { layout } = this.props;

    return (
      <div
        className="Table-scrollOverlay"
        ref={this.rootRef}
        style={{ top: `${layout.rowHeight * layout.headerRowCount}px` }}
      >
        <div
          className={classnames({
            'Table-scrollBar': true,
            'Table-scrollBar__vertical': true,
          })}
          onMouseDown={this.onMouseDownScrollBarVert}
          ref={this.scrollBarVertRef}
        />
        <div
          className={classnames({
            'Table-scrollBar': true,
            'Table-scrollBar__horizontal': true,
          })}
          onMouseDown={this.onMouseDownScrollBarHor}
          ref={this.scrollBarHorRef}
        />
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  //
  // EVENTS
  //
  // ---------------------------------------------------------------------------

  private onMouseDownScrollBarVert = (event: React.SyntheticEvent) => {
    if (this.dragState) {
      // This is probably a sign of a bug if we reach this point.
      return;
    }

    const dragState = this.createDragState('vertical', event);
    this.dragState = dragState;

    this.initializeScroll();
    this.callbacksDragScrollBar.forEach(cb => cb(dragState));
  };

  private onMouseDownScrollBarHor = (event: React.SyntheticEvent) => {
    if (this.dragState) {
      // This is probably a sign of a bug if we reach this point.
      return;
    }

    const dragState = this.createDragState('horizontal', event);
    this.dragState = dragState;

    this.initializeScroll();
    this.callbacksDragScrollBar.forEach(cb => cb(dragState));
  };

  private initializeScroll() {
    this.scrollEventSubscriptions.push(
      subscribedToDOMEvent(document, 'mousemove', this.onMouseMoveScroll),
      subscribedToDOMEvent(document, 'mouseup', this.onMouseUpScroll),
    );
  }

  private createDragState(
    scrollDirection: ScrollDirection,
    event: React.SyntheticEvent,
  ): ScrollBarDragState {
    const nativeEvent = event.nativeEvent as MouseEvent;
    const { clientX, clientY } = nativeEvent;
    return {
      initialDragPoint: { x: clientX, y: clientY },
      initialScrollOffset: this.scrollOffset,
      scrollDirection,
      scrollOffset: null,
      stage: 'BEGIN',
    };
  }

  private onMouseUpScroll = (event: MouseEvent) => {
    if (!this.dragState) {
      // This is probably a sign of a bug if we reach this point.
      return;
    }

    const dragState: ScrollBarDragState = {
      ...this.dragState,
      scrollOffset: null,
      stage: 'END',
    };
    this.dragState = null;

    this.scrollEventSubscriptions.forEach(s => s.remove());
    this.scrollEventSubscriptions = [];

    this.callbacksDragScrollBar.forEach(cb => cb(dragState));
  };

  private onMouseMoveScroll = (event: MouseEvent) => {
    event.preventDefault();
    const { dragState } = this;
    if (!dragState) {
      // This is probably a sign of a bug if we reach this point.
      return;
    }

    const {
      initialDragPoint,
      initialScrollOffset,
      scrollDirection,
    } = dragState;

    // For this calculation, we need to find the location of the scroll bar.
    // From there, we need to calculate from the position of the scroll bar
    // the intended scroll offset. This is basically the reverse calculation
    // done in calculating the scroll bar layout.

    let newDragState: ScrollBarDragState;

    if (scrollDirection === 'horizontal' && this.scrollBarHorRef.current) {
      const { offsetXRange } = this;
      const scrollBarLayout = this.getHorScrollBarLayout(
        initialScrollOffset,
        offsetXRange,
      );
      const scrollBarDeltaX = event.clientX - initialDragPoint.x;
      const scrollBarOffset = scrollBarLayout.offset + scrollBarDeltaX;

      const fullWidth = this.getFullScrollWidthPx();
      const horScrollLength = offsetXRange.max - offsetXRange.min;

      const progress = scrollBarOffset / (fullWidth - scrollBarLayout.length);
      const xOffset = progress * horScrollLength;
      const xScrollOffset = offsetXRange.max - xOffset;

      const scrollOffset = { x: xScrollOffset, y: initialScrollOffset.y };
      newDragState = { ...dragState, scrollOffset, stage: 'MOVE' };
    } else if (this.scrollBarVertRef.current) {
      const { offsetYRange } = this;
      const scrollBarLayout = this.getVertScrollBarLayout(
        initialScrollOffset,
        offsetYRange,
      );
      const scrollBarDeltaY = event.clientY - initialDragPoint.y;
      const scrollBarOffset = scrollBarLayout.offset + scrollBarDeltaY;

      const fullHeight = this.getFullScrollHeightPx();
      const vertScrollLength = offsetYRange.max - offsetYRange.min;

      const progress = scrollBarOffset / (fullHeight - scrollBarLayout.length);
      const yOffset = progress * vertScrollLength;
      const yScrollOffset = offsetYRange.max - yOffset;

      const scrollOffset = { x: initialScrollOffset.x, y: yScrollOffset };
      newDragState = { ...dragState, scrollOffset, stage: 'MOVE' };
    }

    this.callbacksDragScrollBar.forEach(cb => cb(newDragState));
  };

  private getFullScrollWidthPx(): number {
    const { current: currentRoot } = this.rootRef;

    if (!currentRoot) {
      throw Error('Cannot get full scroll width before root is mounted');
    }

    const { current: currentVert } = this.scrollBarVertRef;
    const offsetToAvoidVertScrollBar = currentVert
      ? SCROLL_BAR_THICKNESS_PX +
        SPACING_BETWEEN_SCROLL_BARS_PX +
        SCROLL_BAR_MARGIN_PX
      : 0;

    return currentRoot.offsetWidth - offsetToAvoidVertScrollBar;
  }

  private getFullScrollHeightPx(): number {
    const { current: currentRoot } = this.rootRef;

    if (!currentRoot) {
      throw Error('Cannot get full scroll height before root is mounted');
    }

    return currentRoot.offsetHeight;
  }

  private getHorScrollBarLayout(
    scrollOffset: Point,
    offsetXRange: MinMaxRange,
  ): ScrollBarLayout {
    const fullWidth = this.getFullScrollWidthPx();
    const horScrollLength = offsetXRange.max - offsetXRange.min;
    const visibleToFullRatio = fullWidth / (horScrollLength + fullWidth);

    const xOffset = offsetXRange.max - scrollOffset.x;
    const progress = xOffset / horScrollLength;
    const horScrollBarLength = fullWidth * visibleToFullRatio;
    const horScrollBarOffset = progress * (fullWidth - horScrollBarLength);

    return { length: horScrollBarLength, offset: horScrollBarOffset };
  }

  private getVertScrollBarLayout(
    scrollOffset: Point,
    offsetYRange: MinMaxRange,
  ): ScrollBarLayout {
    const fullHeight = this.getFullScrollHeightPx();
    const vertScrollLength = offsetYRange.max - offsetYRange.min;
    const visibleToFullRatio = fullHeight / (vertScrollLength + fullHeight);

    const yOffset = offsetYRange.max - scrollOffset.y;
    const progress = yOffset / vertScrollLength;
    const vertScrollBarLength = fullHeight * visibleToFullRatio;
    const vertScrollBarOffset = progress * (fullHeight - vertScrollBarLength);

    return { length: vertScrollBarLength, offset: vertScrollBarOffset };
  }
}
