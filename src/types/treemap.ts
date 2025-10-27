/**
 * Type definitions for treemap data structure
 * Used by TreeMap visualization components
 */

export interface TreemapHierarchyType {
  id: string
  name: string
  children?: TreemapHierarchyType[]
  value?: number
  color?: string
}

export type TopicDepth = 1 | 2 | 3
