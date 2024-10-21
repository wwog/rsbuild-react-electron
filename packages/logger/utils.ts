import type { LoggerLevelEnum, ProcessTag } from './types'

/**
 *
 * @param schema
 * @example
 * YY | 18 | Two-digit year
 * YYYY | 2018 | Four-digit year
 * M | 1-12 | The month, beginning at 1
 * MM | 01-12 | The month, 2-digits
 * MMM | Jan-Dec | The abbreviated month name
 * MMMM | January-December | The full month name
 * D | 1-31 | The day of the month
 * DD | 01-31 | The day of the month, 2-digits
 * d | 0-6 | The day of the week, with Sunday as 0
 * dd | Su-Sa | The min name of the day of the week
 * ddd | Sun-Sat | The short name of the day of the week
 * dddd | Sunday-Saturday | The name of the day of the week
 * H | 0-23 | The hour
 * HH | 00-23 | The hour, 2-digits
 * h | 1-12 | The hour, 12-hour clock
 * hh | 01-12 | The hour, 12-hour clock, 2-digits
 * m | 0-59 | The minute
 * mm | 00-59 | The minute, 2-digits
 * s | 0-59 | The second
 * ss | 00-59 | The second, 2-digits
 * SSS | 000-999 | The millisecond, 3-digits
 * Z | +05:00 | The offset from UTC, ±HH:mm
 * ZZ | +0500 | The offset from UTC, ±HHmm
 * A | AM | PM
 * a | am | pm
 */
export function formatDate(schema: string, date?: Date): string {
  const d = date || new Date()
  const year = d.getFullYear()
  const month = d.getMonth() + 1
  const day = d.getDate()
  const hour = d.getHours()
  const minute = d.getMinutes()
  const second = d.getSeconds()
  const millisecond = d.getMilliseconds()
  const week = d.getDay()
  const weekName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const weekFullName = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ]
  const monthName = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ]
  const monthFullName = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ]
  const weekIndex = week === 0 ? 6 : week - 1
  const weekFull = weekFullName[weekIndex]
  const weekShort = weekName[weekIndex]
  const monthIndex = month - 1
  const monthFull = monthFullName[monthIndex]
  const monthShort = monthName[monthIndex]
  const map: Record<string, string> = {
    YY: year.toString().slice(2),
    YYYY: year.toString(),
    M: month.toString(),
    MM: month.toString().padStart(2, '0'),
    MMM: monthShort,
    MMMM: monthFull,
    D: day.toString(),
    DD: day.toString().padStart(2, '0'),
    d: week.toString(),
    dd: weekShort,
    ddd: weekShort,
    dddd: weekFull,
    H: hour.toString(),
    HH: hour.toString().padStart(2, '0'),
    h: (hour % 12).toString(),
    hh: (hour % 12).toString().padStart(2, '0'),
    m: minute.toString(),
    mm: minute.toString().padStart(2, '0'),
    s: second.toString(),
    ss: second.toString().padStart(2, '0'),
    SSS: millisecond.toString().padStart(3, '0'),
    Z: '+08:00',
    ZZ: '+0800',
    A: hour < 12 ? 'AM' : 'PM',
    a: hour < 12 ? 'am' : 'pm',
  }

  return schema.replace(
    /YYYY|YY|M{1,4}|D{1,2}|d{1,4}|H{1,2}|h{1,2}|m{1,2}|s{1,2}|SSS|Z{1,2}|A|a/g,
    (match) => {
      return map[match]
    },
  )
}

const handleCircular = () => {
  const cache: any[] = []
  const keyCache: any[] = []
  return (key: any, value: any) => {
    if (typeof value === 'object' && value !== null) {
      const index = cache.indexOf(value as any)
      if (index !== -1) {
        return `[Circular ${keyCache[index]}]`
      }
      cache.push(value)
      keyCache.push(key || 'root')
    }
    return value
  }
}

export const stringify = (data: any) => {
  try {
    return JSON.stringify(data, handleCircular(), 2)
  } catch (error) {
    return data
  }
}

const formatArgs = (args: any[]) => {
  return args.map((item) => {
    switch (typeof item) {
      case 'object':
        return stringify(item)
      default:
        return item
    }
  })
}

export const getLoggerData = (
  level: LoggerLevelEnum,
  options: {
    scope?: string
    processTag?: ProcessTag
  },
  args: any[],
) => {
  const { scope = '', processTag } = options
  const date = formatDate('HH:mm:ss.SSS')
  return {
    date,
    level,
    scope,
    args,
    formattedArgs: formatArgs(args),
    processTag,
  }
}
