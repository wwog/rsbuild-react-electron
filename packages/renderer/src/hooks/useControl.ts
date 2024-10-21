import { type SetStateAction, useCallback, useState } from 'react'

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
  const isControlled = Object.prototype.hasOwnProperty.call(props, valueKey)

  const [state, setState] = useState<T>(() => {
    if (isControlled) {
      return value
    }
    if (Object.prototype.hasOwnProperty.call(props, defaultValueKey)) {
      return props[defaultValueKey]
    }
    return defaultValue
  })

  const setValue = useCallback((newValue: SetStateAction<T>) => {
    let _value = newValue
    if (typeof newValue === 'function') {
      _value = (newValue as (prevState: T) => T)(state)
    }

    if (!isControlled) {
      setState(_value)
    }

    if (props[triggerKey]) {
      props[triggerKey](_value)
    }
  }, [])

  const realValue = isControlled ? value : state

  return [realValue, setValue] as const
}
