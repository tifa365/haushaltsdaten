/**
 * Leipzig Policy Areas (Politikbereiche)
 *
 * These are the 11 policy blocks (A-K) used in the Leipzig budget.
 * Each policy area groups related budget products by their first two digits.
 */

export type PolicyAreaKey =
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
 * Policy area colors - Muted "Modern Finance" palette (adjusted for distinctiveness)
 * Cool, grounded, analytical colors perfect for budget visualization
 */
export const policyAreaColors: Record<PolicyAreaKey, string> = {
  A: '#4A5F7D', // 1. Darker Slate Blue (distinct from K)
  B: '#5D8F87', // 2. Soft Teal
  C: '#9BA050', // 3. Brighter Olive (distinct from J)
  D: '#A78B6A', // 4. Taupe
  E: '#9D7A90', // 5. Lighter Plum (distinct from I)
  F: '#6C6C73', // 6. Steel Gray
  G: '#B7A45A', // 7. Mustard
  H: '#B07A5A', // 8. Clay
  I: '#6F5D75', // 9. Smoky Violet
  J: '#5E7048', // 10. Darker Moss (distinct from C)
  K: '#6A80A0', // 11. Lighter Blue-Gray (distinct from A)
}
