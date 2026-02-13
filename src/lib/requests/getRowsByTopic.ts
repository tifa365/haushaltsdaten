import { DistrictLabel } from '@data/districts'
import { getDb } from '@lib/db'
import { HaushaltsdatenRowType } from './getRowsByDistrictAndType'

export type TopicColumnName =
  | 'hauptfunktions_bezeichnung'
  | 'oberfunktions_bezeichnung'
  | 'funktions_bezeichnung'
  | 'bereichs_bezeichnung'
  | 'einzelplan_bezeichnung'
  | 'kapitel_bezeichnung'

const VALID_TOPIC_COLUMNS: string[] = [
  'hauptfunktions_bezeichnung',
  'oberfunktions_bezeichnung',
  'funktions_bezeichnung',
  'bereichs_bezeichnung',
  'einzelplan_bezeichnung',
  'kapitel_bezeichnung',
]

export interface GetRowsByTopicParamsType {
  district?: DistrictLabel
  expenseType: 'Einnahmetitel' | 'Ausgabetitel'
  year: number
  modus: string
  topicColumn?: TopicColumnName
  topicValue?: string
}

/**
 * Retrieves rows from the Haushaltdaten based on the provided topicKey and topicValue.
 */
export const getRowsByTopic = ({
  district,
  expenseType,
  year,
  modus,
  topicColumn,
  topicValue,
}: GetRowsByTopicParamsType): HaushaltsdatenRowType[] | undefined => {
  const db = getDb()

  const isFunktionen = modus === 'Funktionen'
  const columns = isFunktionen
    ? 'id, betrag, bereichs_bezeichnung, titel_art, titel_bezeichnung, hauptfunktions_bezeichnung, oberfunktions_bezeichnung, funktions_bezeichnung'
    : 'id, betrag, bereichs_bezeichnung, titel_art, titel_bezeichnung, einzelplan_bezeichnung, kapitel_bezeichnung'

  let sql = `SELECT ${columns} FROM haushaltsdaten WHERE jahr = ? AND titel_art = ?`
  const params: (string | number)[] = [year, expenseType]

  if (district) {
    sql += ' AND bereichs_bezeichnung = ?'
    params.push(district)
  }

  if (topicColumn && topicValue && VALID_TOPIC_COLUMNS.includes(topicColumn)) {
    sql += ` AND ${topicColumn} = ?`
    params.push(topicValue)
  }

  sql += ' ORDER BY id DESC'

  const data = db.prepare(sql).all(...params) as Record<string, string>[]

  if (isFunktionen) {
    data.forEach((el) => {
      el.hauptKey = el.hauptfunktions_bezeichnung
      el.oberKey = el.oberfunktions_bezeichnung
      el.funktionKey = el.funktions_bezeichnung
    })
  } else {
    data.forEach((el) => {
      el.hauptKey = el.bereichs_bezeichnung
      el.oberKey = el.einzelplan_bezeichnung
      el.funktionKey = el.kapitel_bezeichnung
    })
  }

  return data as unknown as HaushaltsdatenRowType[]
}
