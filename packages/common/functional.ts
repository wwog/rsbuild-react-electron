/**
 * @description 组合函数, 从左到右执行
 * @description_en Compose function, execute from left to right
 */
export const compose = <T>(...fns: Array<(arg: T) => T>) => {
  return (arg: T) => fns.reduce((acc, fn) => fn(acc), arg)
}