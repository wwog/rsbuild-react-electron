import { type SetStateAction, useCallback, useRef, useState } from 'react'

export interface UseControlOptions<T> {
  defaultValue?: T
  defaultValueKey?: string
  valueKey?: string
  triggerKey?: string
}

export type ComponentProps = Record<string, any>

export function useControl<T = any>(
  props: ComponentProps = {},
  options: UseControlOptions<T> = {},
) {
  const {
    defaultValue,
    defaultValueKey = 'defaultValue',
    triggerKey = 'onChange',
    valueKey = 'value',
  } = options

  const value = props[valueKey] as T
  const isControlled = Object.hasOwn(props, valueKey)

  const [state, setState] = useState<T>(() => {
    if (isControlled) {
      return value
    }
    if (Object.hasOwn(props, defaultValueKey)) {
      return props[defaultValueKey]
    }
    return defaultValue
  })

  const stateRef = useRef(state)
  stateRef.current = state
  const isControlledRef = useRef(isControlled)
  isControlledRef.current = isControlled
  const propsRef = useRef(props)
  propsRef.current = props

  const setValue = useCallback(
    (newValue: SetStateAction<T>) => {
      const _value =
        typeof newValue === 'function'
          ? (newValue as (prevState: T) => T)(stateRef.current)
          : newValue

      if (!isControlledRef.current) {
        setState(_value)
      }

      if (propsRef.current[triggerKey]) {
        propsRef.current[triggerKey](_value)
      }
    },
    [triggerKey],
  )

  const realValue = isControlled ? value : state

  return [realValue, setValue] as const
}
