/**
 * Leipzig Policy Areas (Politikbereiche)
 *
 * These are the 11 policy blocks (A-K) used in the Leipzig budget.
 * Each policy area groups related budget products by their first two digits.
 */

type PolicyAreaKey =
  | 'A'
  | 'B'
  | 'C'
  | 'D'
  | 'E'
  | 'F'
  | 'G'
  | 'H'
  | 'I'
  | 'J'
  | 'K'

export type PolicyAreaLabel =
  | 'Verwaltung & Sicherheit'
  | 'Bildung & Kultur'
  | 'Soziales & Jugend'
  | 'Gesundheit'
  | 'Sport & Bäder'
  | 'Stadtentwicklung & Wohnen'
  | 'Ver- & Entsorgung'
  | 'Verkehr & Mobilität'
  | 'Umwelt & Grün'
  | 'Wirtschaft & Tourismus'
  | 'Finanzwirtschaft'

export const policyAreas: Record<PolicyAreaKey, PolicyAreaLabel> = {
  A: 'Verwaltung & Sicherheit',
  B: 'Bildung & Kultur',
  C: 'Soziales & Jugend',
  D: 'Gesundheit',
  E: 'Sport & Bäder',
  F: 'Stadtentwicklung & Wohnen',
  G: 'Ver- & Entsorgung',
  H: 'Verkehr & Mobilität',
  I: 'Umwelt & Grün',
  J: 'Wirtschaft & Tourismus',
  K: 'Finanzwirtschaft',
}

/**
 * Product code prefix mapping to policy areas
 * The first two digits of a product code determine its policy area.
 */
export const productPrefixToPolicyArea: Record<string, PolicyAreaKey> = {
  // A - Verwaltung & Sicherheit
  '11': 'A', // Innere Verwaltung
  '12': 'A', // Sicherheit und Ordnung

  // B - Bildung & Kultur
  '21': 'B', // Schulträgeraufgaben
  '22': 'B', // Schulverwaltungsamt
  '23': 'B', // Volkshochschule
  '24': 'B', // Musikschule
  '25': 'B', // Bibliotheken
  '26': 'B', // Museum
  '27': 'B', // Kulturamt
  '28': 'B', // Theater, Oper, Gewandhaus
  '29': 'B', // Sonstige Kultur

  // C - Soziales & Jugend
  '31': 'C', // Sozialamt
  '33': 'C', // Jugendamt
  '34': 'C', // Unterhaltsvorschuss
  '35': 'C', // Kindertagesbetreuung
  '36': 'C', // Kinder- und Jugendhilfe

  // D - Gesundheit
  '41': 'D', // Gesundheitsamt

  // E - Sport & Bäder
  '42': 'E', // Sport und Bäder

  // F - Stadtentwicklung & Wohnen
  '51': 'F', // Stadtplanung
  '52': 'F', // Wohnen und Stadterneuerung

  // G - Ver- & Entsorgung
  '53': 'G', // Abfallwirtschaft, Stadtreinigung

  // H - Verkehr & Mobilität
  '54': 'H', // Verkehrs- und Tiefbauamt

  // I - Umwelt & Grün
  '55': 'I', // Umweltschutz
  '56': 'I', // Grünflächen und Friedhöfe

  // J - Wirtschaft & Tourismus
  '57': 'J', // Wirtschaftsförderung

  // K - Finanzwirtschaft
  '61': 'K', // Zentrale Finanzwirtschaft
}

/**
 * Policy area descriptions
 */
export const policyAreaDescriptions: Record<PolicyAreaKey, string> = {
  A: 'Innere Verwaltung, öffentliche Sicherheit und Ordnung, Feuerwehr, allgemeine Verwaltungsaufgaben',
  B: 'Schulen, Volkshochschulen, Musikschulen, Bibliotheken, Museen, Theater, kulturelle Einrichtungen',
  C: 'Sozialleistungen, Kinder- und Jugendhilfe, Kindertagesbetreuung, Jugendarbeit',
  D: 'Gesundheitsamt, Gesundheitsschutz, gesundheitliche Prävention',
  E: 'Sportförderung, Sportstätten, Schwimmbäder, Bädereinrichtungen',
  F: 'Stadtplanung, Wohnungsbau, Stadterneuerung, Stadtentwicklung',
  G: 'Abfallwirtschaft, Stadtreinigung, Abwasserentsorgung',
  H: 'Straßenbau, Verkehrsplanung, öffentlicher Nahverkehr, Mobilität',
  I: 'Umweltschutz, Naturschutz, Grünflächen, Parks, Friedhöfe',
  J: 'Wirtschaftsförderung, Tourismusförderung, Standortmarketing',
  K: 'Allgemeine Finanzwirtschaft, Zinsen, Tilgung, Rücklagen, zentrale Finanzgeschäfte',
}

/**
 * Policy area colors (matching the colors used in the treemap)
 */
export const policyAreaColors: Record<PolicyAreaKey, string> = {
  A: '#3B82F6', // blue
  B: '#10B981', // green
  C: '#EF4444', // red
  D: '#F59E0B', // amber
  E: '#8B5CF6', // purple
  F: '#EC4899', // pink
  G: '#06B6D4', // cyan
  H: '#6366F1', // indigo
  I: '#14B8A6', // teal
  J: '#F97316', // orange
  K: '#64748B', // slate
}
