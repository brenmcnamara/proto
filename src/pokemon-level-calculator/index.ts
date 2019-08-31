type MathFn = (x: number) => number;

/**
 * Function for calculating the level of a pokemon given the number of
 * completed tasks. This function was engineered to ensure the following
 * constraints are met:
 *
 * - 0 tasks == level 0
 * - 10,000 tasks == level 100
 * - For the domain D: 0 <= x <= 10,000
 *   - the function is monotonically increasing on D
 *   - the function's derivative is monotonically decreasing on D
 */
export function levelFn(x: number): number {
  return -1e-6 * x * x + 2 * 1e-2 * x;
}

export function levelDerivativeFn(x: number): number {
  return -2e-6 * x + 2 * 1e-2;
}

export const levelInverseFn = makeInverseFn(
  levelFn,
  levelDerivativeFn,
  x => x * 100,
);

export const levelStepFn = makeFloorStepFn(levelFn);

export const levelInverseStepFn = makeCeilStepFn(levelInverseFn);

// -----------------------------------------------------------------------------
//
// PRIVATE UTILITIES
//
// -----------------------------------------------------------------------------

function makeFloorStepFn(fn: MathFn): MathFn {
  return (x: number) => Math.floor(fn(x));
}

function makeCeilStepFn(fn: MathFn): MathFn {
  return (x: number) => Math.ceil(fn(x));
}

// Applies netwon's method to find the inverse of a function's value.
function makeInverseFn(
  fn: MathFn,
  fnDerivative: MathFn,
  initialGuess: MathFn,
): MathFn {
  return (y: number) => {
    let xEstimate = initialGuess(y);
    console.log('initial guess', xEstimate); // tslint:disable-line
    for (let i = 0; i < 100; ++i) {
      console.log(fn(xEstimate), fnDerivative(xEstimate)); // tslint:disable-line
      xEstimate = xEstimate - fn(xEstimate) / fnDerivative(xEstimate);
    }
    return xEstimate;
  };
}
