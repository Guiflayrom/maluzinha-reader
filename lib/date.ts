export function formatLocalDate(date: Date) {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')

  return `${year}-${month}-${day}`
}

export function getTodayString() {
  return formatLocalDate(new Date())
}

export function getYesterdayString() {
  const date = new Date()
  date.setDate(date.getDate() - 1)
  return formatLocalDate(date)
}

export function getStartOfWeek(date: Date) {
  const result = new Date(date)
  result.setHours(0, 0, 0, 0)
  result.setDate(result.getDate() - result.getDay())
  return result
}

export function getWeekRange(referenceDate: Date = new Date()) {
  const startDate = getStartOfWeek(referenceDate)
  const endDate = new Date(startDate)
  endDate.setDate(endDate.getDate() + 6)

  return {
    startDate,
    endDate,
    start: formatLocalDate(startDate),
    end: formatLocalDate(endDate),
  }
}
