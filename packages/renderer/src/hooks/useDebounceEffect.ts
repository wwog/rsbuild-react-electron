import { useEffect, useRef } from "react"


export function useDebounceEffect(fn: () => void, delay: number, deps: any[]) {
  const timer = useRef<any | null>(null)
  useEffect(() => {
    if (timer.current) {
      clearTimeout(timer.current)
    }
    timer.current = setTimeout(() => {
      fn()
    }, delay)
    return () => {
      if (timer.current) {
        clearTimeout(timer.current)
      }
    }
  }, deps)
}