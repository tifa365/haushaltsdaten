import type { NextApiRequest, NextApiResponse } from 'next'
import { getDb } from '@lib/db'

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
): void {
  const { q } = req.query

  if (!q || typeof q !== 'string' || q.trim().length === 0) {
    res.status(200).json([])
    return
  }

  const db = getDb()

  // Build FTS5 search query: split terms and add * for prefix matching
  const searchTerms = q
    .trim()
    .split(/\s+/)
    .map((term) => `"${term.replace(/"/g, '""')}"*`)
    .join(' ')

  const data = db
    .prepare(
      `
      SELECT h.id, h.titel_bezeichnung, h.titel_art, h.bereichs_bezeichnung,
             h.betrag, h.jahr, h.titel,
             h.oberfunktions_bezeichnung, h.hauptfunktions_bezeichnung,
             h.funktions_bezeichnung, h.obergruppen_bezeichnung,
             h.hauptgruppen_bezeichnung, h.gruppen_bezeichnung,
             h.einzelplan_bezeichnung, h.kapitel_bezeichnung
      FROM haushaltsdaten_fts fts
      JOIN haushaltsdaten h ON h.id = fts.rowid
      WHERE haushaltsdaten_fts MATCH ?
      ORDER BY rank
    `
    )
    .all(searchTerms)

  res.status(200).json(data)
}
