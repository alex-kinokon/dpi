import { useCallback, useEffect, useLayoutEffect, useRef } from "react";

export { useEvent };

const use = typeof window === "undefined" ? useEffect : useLayoutEffect;

function useEvent<Params extends any[] = [], Return = never>(
  handler: (...params: Params) => Return
) {
  const handlerRef = useRef<(...params: Params) => Return>(handler);

  // In a real implementation, this would run before layout effects
  use(() => {
    handlerRef.current = handler;
  });

  return useCallback((...args: Params): Return => {
    // In a real implementation, this would throw if called during render
    const fn = handlerRef.current!;
    return fn(...args);
  }, []);
}
