import { DistrictLabel } from '@data/districts'
import { getDb } from '@lib/db'

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

export interface GetRowsByDistrictAndTypeParamsType {
  district?: DistrictLabel
  expenseType: 'Einnahmetitel' | 'Ausgabetitel'
  year: number
  modus: string
}

export interface MapColumsFunktionType {
  id: string
  hauptKey: string
  oberKey: string
  funktionKey: string
  titel_bezeichnung: string
  bereichs_bezeichnung: string
  hauptfunktions_bezeichnung: string
  oberfunktions_bezeichnung: string
  funktions_bezeichnung: string
}

export interface MapColumsEinzelplanType {
  id: string
  hauptKey: string
  oberKey: string
  funktionKey: string
  titel_bezeichnung: string
  bereichs_bezeichnung: string
  einzelplan_bezeichnung: string
  kapitel_bezeichnung: string
}

/**
 * Retrieves rows from the Haushaltdaten based on the provided `district` and `expenseType`.
 */
export const getRowsByDistrictAndType = ({
  district,
  expenseType,
  year,
  modus,
}: GetRowsByDistrictAndTypeParamsType): HaushaltsdatenRowType[] | undefined => {
  const db = getDb()

  const isFunktionen = modus === 'Funktionen'
  const columns = isFunktionen
    ? 'id, betrag, bereichs_bezeichnung, titel_bezeichnung, hauptfunktions_bezeichnung, oberfunktions_bezeichnung, funktions_bezeichnung'
    : 'id, betrag, bereichs_bezeichnung, titel_bezeichnung, einzelplan_bezeichnung, kapitel_bezeichnung'

  let sql = `SELECT ${columns} FROM haushaltsdaten WHERE jahr = ? AND titel_art = ?`
  const params: (string | number)[] = [year, expenseType]

  if (district) {
    sql += ' AND bereichs_bezeichnung = ?'
    params.push(district)
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
