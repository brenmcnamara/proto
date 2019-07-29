import { isEqualRegions, TableSelectionRegion } from '../TableTypes';

const region1: TableSelectionRegion = {
  backgroundColor: 'rgba(120, 120, 120, 1.0)',
  borderColor: null,
  endCell: { col: 1, row: 1 },
  isResizable: true,
  startCell: { col: 0, row: 0 },
};

const region1Copy: TableSelectionRegion = { ...region1 };

const region1DeepCopy: TableSelectionRegion = {
  ...region1,
  endCell: { ...region1.endCell },
  startCell: { ...region1.startCell },
};

const region2 = {
  backgroundColor: 'rgba(120, 120, 120, 1.0)',
  borderColor: null,
  endCell: { col: 1, row: 0 },
  isResizable: true,
  startCell: { col: 0, row: 0 },
};

test('isEqualRegions detects shallow copies', () => {
  expect(isEqualRegions(region1, region1Copy)).toBe(true);
});

test('isEqualRegions detects deep copies', () => {
  expect(isEqualRegions(region1, region1DeepCopy)).toBe(true);
});

test('isEqualRegions detects unequal regions', () => {
  expect(isEqualRegions(region1, region2)).toBe(false);
});
