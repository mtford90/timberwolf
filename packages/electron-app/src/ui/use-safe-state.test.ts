import { act, renderHook } from "@testing-library/react-hooks";
import { useSafeState } from "./use-safe-state";

describe("useSafeState", () => {
  it("should change state", async () => {
    const { result, wait } = renderHook(() => useSafeState(1));

    const [state, setState] = result.current;

    expect(state).toEqual(1);

    act(() => {
      setState(2);
    });

    await wait(() => expect(result.current[0]).toEqual(2));
  });

  it("should update state", async () => {
    const { result, wait } = renderHook(() => useSafeState({ x: 1, y: 2 }));

    const [state, setState] = result.current;

    expect(state.x).toEqual(1);
    expect(state.y).toEqual(2);

    act(() => {
      setState((s) => ({ ...s, x: 3 }));
    });

    await wait(() => {
      expect(result.current[0].x).toEqual(3);
      expect(result.current[0].y).toEqual(2);
    });
  });

  it("should prevent state updates when unmounted", () => {
    const { result, unmount } = renderHook(() => useSafeState(1));

    unmount();

    act(() => {
      const setState = result.current[1];
      setState(2);
    });

    setImmediate(() => {
      expect(result.current[0]).toEqual(1);
    });
  });
});
