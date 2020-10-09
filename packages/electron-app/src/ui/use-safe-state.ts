import { useRef, useState, useEffect, Dispatch, SetStateAction } from "react";

export function useSafeState<S = unknown>(
  initialState: S
): [S, Dispatch<SetStateAction<S>>] {
  const [state, setState] = useState(initialState);

  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      // This component is no longer mounted. Prevent any further usage of setState
      mountedRef.current = false;
    };
  }, []);

  const setSafeState: Dispatch<SetStateAction<S>> = (s) => {
    const componentIsMounted = mountedRef.current;

    if (componentIsMounted) {
      setState(s);
    }
  };

  return [state, setSafeState];
}
