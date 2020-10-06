import { DeepPartial } from "ts-essentials";

// tslint:disable-next-line:ban-types
export type DeepMock<T extends Record<string, any>> = T & {
  changeMock: (xtra: DeepPartial<T>) => void;
};

/**
 * Mock anything using a deep partial implementation.
 *
 * Useful during testing as it allows us to mock out the properties we want whilst still retaining type suggestions,
 * but doesn't given any errors for missing properties.
 *
 * @param mock
 */
// tslint:disable-next-line:ban-types
export function deepMock<T extends Record<string, any>>(
  mock: DeepPartial<T>
): DeepMock<T> {
  // eslint-disable-next-line no-param-reassign,@typescript-eslint/no-explicit-any
  (mock as any).changeMock = (xtra: DeepPartial<T>) => {
    Object.assign(mock, xtra);
  };

  return mock as DeepMock<T>;
}
