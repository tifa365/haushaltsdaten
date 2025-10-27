/**
 * Static data loading utilities
 * Replaces Supabase queries with static JSON file loading
 */

import { DistrictLabel } from '@data/districts'

export interface HaushaltsdatenRowType {
  id: string
  hauptKey: string
  oberKey: string
  funktionKey: string
  titel_bezeichnung: string
  titel_art?: 'Einnahmetitel' | 'Ausgabetitel'
  bereichs_bezeichnung: string
  betrag: string
}

export interface StaticBudgetItem {
  id: string
  title: string
  amount: number
  group: string
  groupId: string
  district: string
  productCode: string
  costType: string
}

export interface TreemapNode {
  id: string
  name: string
  value: number
  color?: string
  children?: TreemapNode[]
}

export interface SummaryStats {
  year: number
  total: number
  totalMrd: number
  totalMio: number
  itemCount: number
  blockCount: number
  blocks: Array<{
    id: string
    name: string
    shortName: string
    color: string
    value: number
    valueMio: number
    percentage: number
    itemCount: number
  }>
}

/**
 * Load treemap hierarchy for a given year
 */
export async function loadTreemapData(year: number): Promise<TreemapNode> {
  const response = await fetch(`/data/${year}/treemap.json`)
  if (!response.ok) {
    throw new Error(`Failed to load treemap data for ${year}`)
  }
  return response.json()
}

/**
 * Load flat list of budget items for a given year
 */
export async function loadListData(year: number): Promise<StaticBudgetItem[]> {
  const response = await fetch(`/data/${year}/list.json`)
  if (!response.ok) {
    throw new Error(`Failed to load list data for ${year}`)
  }
  return response.json()
}

/**
 * Load summary statistics for a given year
 */
export async function loadSummaryStats(year: number): Promise<SummaryStats> {
  const response = await fetch(`/data/${year}/summary.json`)
  if (!response.ok) {
    throw new Error(`Failed to load summary data for ${year}`)
  }
  return response.json()
}

/**
 * Load detailed data for a specific policy block
 */
export async function loadBlockDetail(year: number, blockId: string): Promise<any> {
  // Find the block filename by looking at available files
  const response = await fetch(`/data/${year}/blocks/${blockId}`)
  if (!response.ok) {
    throw new Error(`Failed to load block ${blockId} for ${year}`)
  }
  return response.json()
}

/**
 * Filter list data by various criteria
 * Replaces Supabase query filtering
 */
export function filterListData(
  items: StaticBudgetItem[],
  filters: {
    district?: DistrictLabel
    expenseType?: 'Einnahmetitel' | 'Ausgabetitel'
    group?: string
    minAmount?: number
  }
): StaticBudgetItem[] {
  let filtered = [...items]

  if (filters.district) {
    filtered = filtered.filter(item => item.district === filters.district)
  }

  if (filters.group) {
    filtered = filtered.filter(item => item.groupId === filters.group)
  }

  if (filters.minAmount !== undefined) {
    filtered = filtered.filter(item => item.amount >= filters.minAmount)
  }

  return filtered
}

/**
 * Transform static data to match old Supabase structure
 * For backward compatibility with existing components
 */
export function transformToLegacyFormat(items: StaticBudgetItem[]): HaushaltsdatenRowType[] {
  return items.map(item => ({
    id: item.id,
    hauptKey: item.groupId,
    oberKey: '', // Not used in static data
    funktionKey: '', // Not used in static data
    titel_bezeichnung: item.title,
    titel_art: 'Ausgabetitel', // Assuming expenses; adjust if needed
    bereichs_bezeichnung: item.district,
    betrag: item.amount.toString()
  }))
}
