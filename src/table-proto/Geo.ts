export interface Point {
  x: number;
  y: number;
}

export interface Vector {
  x: number;
  y: number;
}

export interface MinMaxRange {
  max: number;
  min: number;
}

export function clamp(value: number, range: MinMaxRange): number {
  return Math.max(range.min, Math.min(range.max, value));
}

export interface Size {
  height: number;
  width: number;
}

export interface Rect {
  origin: Point;
  size: Size;
}

export interface Insets {
  bottom: number;
  left: number;
  right: number;
  top: number;
}

export function isInRange(range: MinMaxRange, num: number): boolean {
  return num >= range.min && num <= range.max;
}

export function isValidRange(range: MinMaxRange): boolean {
  return range.min <= range.max;
}

export function calculateOverlappingRange(
  r1: MinMaxRange,
  r2: MinMaxRange,
): MinMaxRange | null {
  const overlappingRange = {
    max: Math.min(r1.max, r2.max),
    min: Math.max(r1.min, r2.min),
  };
  return isValidRange(overlappingRange) ? overlappingRange : null;
}
