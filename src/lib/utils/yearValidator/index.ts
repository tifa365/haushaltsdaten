/**
 * Years should correspond to available Leipzig budget data
 */
export const VALID_YEARS = [2025, 2026]

export const DEFAULT_YEAR = 2025

export const isValidYear = (yearToCheck: number): boolean =>
  VALID_YEARS.includes(yearToCheck)
