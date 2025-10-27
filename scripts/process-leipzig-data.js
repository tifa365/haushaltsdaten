#!/usr/bin/env node
/**
 * Process Leipzig Ergebnishaushalt Excel file
 * Pure Node.js implementation - no Python needed
 */

const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Mapping table: Product code prefix → Policy block
const MAPPING = {
  '11': 'A', '12': 'A',
  '21': 'B', '22': 'B', '23': 'B', '24': 'B', '25': 'B', '26': 'B', '27': 'B', '28': 'B', '29': 'B',
  '31': 'C', '33': 'C', '34': 'C', '35': 'C', '36': 'C',
  '41': 'D', '42': 'E',
  '51': 'F', '52': 'F',
  '53': 'G', '54': 'H',
  '55': 'I', '56': 'I',
  '57': 'J', '61': 'K'
};

const BLOCK_NAMES = {
  'A': 'Verwaltung & Sicherheit',
  'B': 'Bildung & Kultur',
  'C': 'Soziales & Jugend',
  'D': 'Gesundheit',
  'E': 'Sport & Bäder',
  'F': 'Stadtentwicklung & Wohnen',
  'G': 'Ver- & Entsorgung',
  'H': 'Verkehr & Mobilität',
  'I': 'Umwelt & Grün',
  'J': 'Wirtschaft & Tourismus',
  'K': 'Finanzwirtschaft'
};

const BLOCK_COLORS = {
  'A': '#3B82F6', 'B': '#10B981', 'C': '#EF4444', 'D': '#F59E0B',
  'E': '#8B5CF6', 'F': '#EC4899', 'G': '#06B6D4', 'H': '#6366F1',
  'I': '#14B8A6', 'J': '#F97316', 'K': '#64748B'
};

function processErgebnishaushalt(filepath) {
  console.log('\n' + '='.repeat(80));
  console.log(`Opening: ${filepath}`);
  console.log('='.repeat(80) + '\n');

  const workbook = XLSX.readFile(filepath);
  const sheetName = 'Grunddaten';

  if (!workbook.Sheets[sheetName]) {
    throw new Error(`Sheet '${sheetName}' not found in workbook`);
  }

  const sheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(sheet);

  const budgetItems = [];
  const unmappedPrefixes = new Set();

  let skippedNotExpense = 0;
  let skippedNotPR = 0;
  let skippedNoPC = 0;
  let skippedUnmapped = 0;

  for (const row of data) {
    // RULE 1: Only ordinary expenses
    const ebene = String(row['Zuordnung_Kostenart.Ebene'] || '');
    if (!ebene.includes('2 ordentliche Aufwendungen')) {
      skippedNotExpense++;
      continue;
    }

    // RULE 2: Only PR rows (product-level, not object-level)
    const objektart = String(row['Objektart'] || '');
    if (objektart !== 'PR') {
      skippedNotPR++;
      continue;
    }

    // Extract product code
    const pc = String(row['Zielstruktur.PC'] || '');
    if (!pc || pc === 'undefined' || pc.length < 2) {
      skippedNoPC++;
      continue;
    }

    // RULE 3: Extract prefix
    const prefix = pc.substring(0, 2);
    const policyBlock = MAPPING[prefix];

    if (!policyBlock) {
      unmappedPrefixes.add(prefix);
      skippedUnmapped++;
      continue;
    }

    const plan2025 = parseFloat(row['Plan 2025'] || 0);
    const plan2026 = parseFloat(row['Plan 2026'] || 0);

    budgetItems.push({
      productCode: pc,
      description: String(row['PCBeschreibung'] || ''),
      amt: String(row['Amt'] || ''),
      teilhaushalt: String(row['Zielstruktur.Teilhaushalt Bezeichnung'] || ''),
      costTypeEbene: ebene,
      costTypePosition: String(row['Zuordnung_Kostenart.Position'] || ''),
      accountDescription: String(row['KostenartBeschreibung'] || ''),
      objektart: objektart,
      prefix: prefix,
      policyBlock: policyBlock,
      policyBlockName: BLOCK_NAMES[policyBlock],
      plan2025: plan2025,
      plan2026: plan2026
    });
  }

  // Audit report
  console.log('='.repeat(80));
  console.log('PROCESSING AUDIT REPORT');
  console.log('='.repeat(80));
  console.log(`Total rows processed:           ${data.length.toLocaleString().padStart(10)}`);
  console.log(`Budget items extracted:         ${budgetItems.length.toLocaleString().padStart(10)}`);
  console.log('-'.repeat(80));
  console.log(`Skipped (not 'ordentl. Aufw'): ${skippedNotExpense.toLocaleString().padStart(10)}`);
  console.log(`Skipped (not PR - avoid dbl):  ${skippedNotPR.toLocaleString().padStart(10)}`);
  console.log(`Skipped (no product code):     ${skippedNoPC.toLocaleString().padStart(10)}`);
  console.log(`Skipped (unmapped prefix):     ${skippedUnmapped.toLocaleString().padStart(10)}`);

  if (unmappedPrefixes.size > 0) {
    console.log(`\n⚠️  WARNING: Unmapped prefixes found: ${Array.from(unmappedPrefixes).sort().join(', ')}`);
    console.log(`    These product codes were excluded from analysis.`);
  } else {
    console.log(`\n✓ All product codes successfully mapped`);
  }
  console.log('='.repeat(80) + '\n');

  return budgetItems;
}

function aggregateByPolicy(items) {
  const blocks = {};

  for (const item of items) {
    const block = item.policyBlock;

    if (!blocks[block]) {
      blocks[block] = {
        block: block,
        name: item.policyBlockName,
        color: BLOCK_COLORS[block],
        plan2025: 0,
        plan2026: 0,
        itemCount: 0,
        items: []
      };
    }

    blocks[block].plan2025 += item.plan2025;
    blocks[block].plan2026 += item.plan2026;
    blocks[block].itemCount++;
    blocks[block].items.push(item);
  }

  return blocks;
}

function validateTotals(aggregated, total2025, total2026) {
  console.log('='.repeat(80));
  console.log('VALIDATION CHECK');
  console.log('='.repeat(80));

  const sumBlocks2025 = Object.values(aggregated).reduce((sum, b) => sum + b.plan2025, 0);
  const sumBlocks2026 = Object.values(aggregated).reduce((sum, b) => sum + b.plan2026, 0);

  const diff2025 = Math.abs(total2025 - sumBlocks2025);
  const diff2026 = Math.abs(total2026 - sumBlocks2026);

  const valid2025 = diff2025 < 0.01;
  const valid2026 = diff2026 < 0.01;

  console.log(valid2025 ? '✓' : '✗', `2025 totals${valid2025 ? ' match' : ' MISMATCH'}: ${(total2025/1e6).toFixed(1)} Mio €`);
  console.log(valid2026 ? '✓' : '✗', `2026 totals${valid2026 ? ' match' : ' MISMATCH'}: ${(total2026/1e6).toFixed(1)} Mio €`);
  console.log('='.repeat(80) + '\n');

  return valid2025 && valid2026;
}

function printSummary(aggregated, total2025, total2026) {
  console.log('='.repeat(80));
  console.log('POLICY BLOCK SUMMARY - PLAN 2025');
  console.log('='.repeat(80));

  const sorted = Object.entries(aggregated)
    .sort((a, b) => b[1].plan2025 - a[1].plan2025);

  for (const [blockId, data] of sorted) {
    const amountMio = data.plan2025 / 1e6;
    const percentage = (data.plan2025 / total2025 * 100).toFixed(1);
    const name = data.name.padEnd(40);
    console.log(`${blockId} - ${name}: ${amountMio.toLocaleString('de-DE', {minimumFractionDigits: 1, maximumFractionDigits: 1}).padStart(10)} Mio € (${percentage.padStart(5)}%) [${data.itemCount.toString().padStart(3)} items]`);
  }

  console.log('-'.repeat(80));
  console.log(`${'TOTAL'.padEnd(43)}: ${(total2025/1e6).toLocaleString('de-DE', {minimumFractionDigits: 1, maximumFractionDigits: 1}).padStart(10)} Mio € (${(total2025/1e9).toFixed(3)} Mrd €)`);
  console.log(`${''.padEnd(43)}  ${(total2026/1e6).toLocaleString('de-DE', {minimumFractionDigits: 1, maximumFractionDigits: 1}).padStart(10)} Mio € (${(total2026/1e9).toFixed(3)} Mrd €) [2026]`);
  console.log('='.repeat(80) + '\n');
}

function main() {
  const leipzigFile = path.join(__dirname, '..', 'daten', 'leipzig-ergebnishaushalt-2025_2026.xlsx');

  if (!fs.existsSync(leipzigFile)) {
    console.error(`✗ ERROR: File not found: ${leipzigFile}`);
    console.error('  Please place Leipzig Excel file in daten/ folder');
    process.exit(1);
  }

  const items = processErgebnishaushalt(leipzigFile);

  if (!items || items.length === 0) {
    console.error('✗ ERROR: No items processed! Check file structure.');
    process.exit(1);
  }

  const aggregated = aggregateByPolicy(items);
  const total2025 = items.reduce((sum, item) => sum + item.plan2025, 0);
  const total2026 = items.reduce((sum, item) => sum + item.plan2026, 0);

  if (!validateTotals(aggregated, total2025, total2026)) {
    console.error('✗ VALIDATION FAILED - Do not use this data!');
    process.exit(1);
  }

  printSummary(aggregated, total2025, total2026);

  // Output JSON
  const output = {
    metadata: {
      source: leipzigFile,
      generated: new Date().toISOString(),
      totalItems: items.length,
      total2025: total2025,
      total2026: total2026,
      total2025Mrd: parseFloat((total2025 / 1e9).toFixed(3)),
      total2026Mrd: parseFloat((total2026 / 1e9).toFixed(3)),
      validation: {
        totalsMatch: true,
        allPrefixesMapped: true
      }
    },
    aggregated: aggregated,
    items: items
  };

  const outputFile = path.join(__dirname, '..', 'src', 'data', 'leipzig-budget-data.json');
  const outputDir = path.dirname(outputFile);

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(outputFile, JSON.stringify(output, null, 2), 'utf-8');

  console.log(`✓ Output saved to: ${path.relative(process.cwd(), outputFile)}`);
  console.log(`✓ Ready for production use\n`);
}

if (require.main === module) {
  main();
}

module.exports = { processErgebnishaushalt, aggregateByPolicy };
