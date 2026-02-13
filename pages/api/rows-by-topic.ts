import type { NextApiRequest, NextApiResponse } from 'next'
import { DistrictLabel } from '@data/districts'
import { getRowsByTopic, TopicColumnName } from '@lib/requests/getRowsByTopic'

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
): void {
  const { district, expenseType, year, modus, topicColumn, topicValue } =
    req.query

  const data = getRowsByTopic({
    district: (district as DistrictLabel) || undefined,
    expenseType: expenseType as 'Einnahmetitel' | 'Ausgabetitel',
    year: parseInt(year as string, 10),
    modus: (modus as string) || 'Funktionen',
    topicColumn: topicColumn as TopicColumnName | undefined,
    topicValue: topicValue as string | undefined,
  })

  res.status(200).json(data || [])
}
