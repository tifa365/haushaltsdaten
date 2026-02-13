import { DistrictLabel } from '@data/districts'
import {
  GetRowsByDistrictAndTypeParamsType,
  HaushaltsdatenRowType,
} from '@lib/requests/getRowsByDistrictAndType'
import { TopicColumnName } from '@lib/requests/getRowsByTopic'
import useSWR from 'swr'

interface useListDataParamsType {
  district?: DistrictLabel
  type: GetRowsByDistrictAndTypeParamsType['expenseType']
  year: number
  modus: string
  topicColumn?: TopicColumnName
  topicValue?: string
  initialData?: HaushaltsdatenRowType[]
}

interface useListDataReturnType {
  isLoading: boolean
  data: HaushaltsdatenRowType[] | null
  error: Error | null
}

const fetchRowsByTopic = async (
  url: string
): Promise<HaushaltsdatenRowType[]> => {
  const res = await fetch(url)
  const data = (await res.json()) as HaushaltsdatenRowType[]
  return data
}

export const useListData = ({
  district,
  type,
  year,
  modus,
  topicColumn,
  topicValue,
  initialData,
}: useListDataParamsType): useListDataReturnType => {
  const params = new URLSearchParams()
  params.set('year', String(year))
  params.set('expenseType', type)
  params.set('modus', modus)
  if (district) params.set('district', district)
  if (topicColumn) params.set('topicColumn', topicColumn)
  if (topicValue) params.set('topicValue', topicValue)

  const url = `/api/rows-by-topic?${params.toString()}`

  const { data, error } = useSWR<HaushaltsdatenRowType[], Error>(
    url,
    fetchRowsByTopic,
    { fallbackData: initialData }
  )

  return {
    isLoading: !data && !error,
    data: data || null,
    error: error || null,
  }
}
