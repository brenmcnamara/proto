/* tslint:disable:max-classes-per-file no-console no-empty no-unused-variable */

import './TableSelectionOverlay.css';

import * as React from 'react';
import classnames from 'classnames';

import { Rect } from './Geo';
import {
  TableSelectionRegion,
  TableSelectionRegionHandleLocationSet,
} from './TableTypes';

// NOTE: This property is duplicated in CSS
const BORDER_WIDTH = 2;

export interface TableSelectionRegionLayout {
  resizeHandles: TableSelectionRegionHandleLocationSet;
  hasBorders: { bottom: boolean; left: boolean; right: boolean; top: boolean };
  rect: Rect;
}

type BorderDirection = 'bottom' | 'left' | 'right' | 'top';

interface Props {
  layout: TableSelectionRegionLayout;
  region: TableSelectionRegion;
}

export default class TableSelectionRegionComp extends React.Component<Props> {
  public render() {
    const { layout, region } = this.props;

    const regionStyles: React.CSSProperties = {
      backgroundColor: region.backgroundColor,
      height: `${layout.rect.size.height}px`,
      left: `${layout.rect.origin.x}px`,
      top: `${layout.rect.origin.y}px`,
      width: `${layout.rect.size.width}px`,
    };

    const borderStyles: React.CSSProperties | null =
      region.borderColor === null
        ? null
        : { backgroundColor: region.borderColor };

    if (region.borderColor) {
      regionStyles.borderColor = region.borderColor;
    }

    return (
      <React.Fragment>
        <div className="TableSelectionOverlay-region" style={regionStyles} />
        {borderStyles && layout.hasBorders.bottom && (
          <div
            className={classnames(
              'TableSelectionOverlay-regionBorder',
              'TableSelectionOverlay-regionBorder-bottom',
            )}
            style={{
              ...borderStyles,
              ...this.createLayoutStyles('bottom'),
            }}
          />
        )}
        {borderStyles && layout.hasBorders.left && (
          <div
            className={classnames(
              'TableSelectionOverlay-regionBorder',
              'TableSelectionOverlay-regionBorder-left',
            )}
            style={{
              ...borderStyles,
              ...this.createLayoutStyles('left'),
            }}
          />
        )}
        {borderStyles && layout.hasBorders.right && (
          <div
            className={classnames(
              'TableSelectionOverlay-regionBorder',
              'TableSelectionOverlay-regionBorder-right',
            )}
            style={{
              ...borderStyles,
              ...this.createLayoutStyles('right'),
            }}
          />
        )}
        {borderStyles && layout.hasBorders.top && (
          <div
            className={classnames(
              'TableSelectionOverlay-regionBorder',
              'TableSelectionOverlay-regionBorder-top',
            )}
            style={{
              ...borderStyles,
              ...this.createLayoutStyles('top'),
            }}
          />
        )}
      </React.Fragment>
    );
  }

  private createLayoutStyles(direction: BorderDirection): React.CSSProperties {
    const { layout } = this.props;
    const { rect } = layout;
    switch (direction) {
      case 'bottom':
        return {
          left: `${rect.origin.x}px`,
          top: `${rect.origin.y + rect.size.height - BORDER_WIDTH}px`,
          width: `${rect.size.width}px`,
        };

      case 'left':
        return {
          height: `${rect.size.height}px`,
          left: `${rect.origin.x}px`,
          top: `${rect.origin.y}px`,
        };

      case 'right':
        return {
          height: `${rect.size.height}px`,
          left: `${rect.origin.x + rect.size.width - BORDER_WIDTH}px`,
          top: `${rect.origin.y}px`,
        };

      case 'top':
        return {
          left: `${rect.origin.x}px`,
          top: `${rect.origin.y}px`,
          width: `${rect.size.width}px`,
        };
    }

    return {};
  }
}
