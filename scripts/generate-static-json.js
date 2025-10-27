#!/usr/bin/env node
/**
 * Generate static JSON files for Leipzig budget visualization
 * Pure Node.js - no database needed
 */

const fs = require('fs');
const path = require('path');

function loadProcessedData() {
  const dataFile = path.join(__dirname, '..', 'src', 'data', 'leipzig-budget-data.json');

  if (!fs.existsSync(dataFile)) {
    console.error('✗ ERROR: leipzig-budget-data.json not found');
    console.error('  Run: npm run data:process first');
    return null;
  }

  const raw = fs.readFileSync(dataFile, 'utf-8');
  return JSON.parse(raw);
}

function createTreemapHierarchy(budgetData, year) {
  const aggregated = budgetData.aggregated;
  const field = year === '2025' ? 'plan2025' : 'plan2026';

  const children = [];

  for (const blockId of Object.keys(aggregated).sort()) {
    const blockData = aggregated[blockId];

    // Group items by product code
    const products = {};

    for (const item of blockData.items) {
      const pc = item.productCode;

      if (!products[pc]) {
        products[pc] = {
          value: 0,
          description: item.description,
          items: []
        };
      }

      products[pc].value += item[field];
      products[pc].items.push({
        name: item.accountDescription,
        value: item[field],
        amt: item.amt
      });
    }

    // Build product children
    const productChildren = Object.entries(products).map(([pc, prodData]) => ({
      id: pc,
      name: prodData.description,
      value: prodData.value,
      children: prodData.items.length > 1 ? prodData.items : []
    }));

    // Add block
    children.push({
      id: blockId,
      name: blockData.name,
      value: blockData[field],
      color: blockData.color,
      children: productChildren
    });
  }

  return {
    id: 'root',
    name: `Leipzig Haushalt ${year}`,
    children: children
  };
}

function createSummaryStats(budgetData, year) {
  const field = year === '2025' ? 'plan2025' : 'plan2026';
  const fieldMrd = year === '2025' ? 'total2025Mrd' : 'total2026Mrd';
  const aggregated = budgetData.aggregated;

  const sorted = Object.entries(aggregated)
    .sort((a, b) => b[1][field] - a[1][field]);

  const total = budgetData.metadata[`total${year}`];

  const blocksSummary = sorted.map(([blockId, blockData]) => ({
    id: blockId,
    name: blockData.name,
    shortName: blockData.name,
    color: blockData.color,
    value: blockData[field],
    valueMio: Math.round(blockData[field] / 1e6 * 10) / 10,
    percentage: Math.round((blockData[field] / total * 100) * 10) / 10,
    itemCount: blockData.itemCount
  }));

  return {
    year: parseInt(year),
    total: total,
    totalMrd: budgetData.metadata[fieldMrd],
    totalMio: Math.round(total / 1e6 * 10) / 10,
    itemCount: budgetData.metadata.totalItems,
    blockCount: Object.keys(aggregated).length,
    blocks: blocksSummary
  };
}

function createFlatList(budgetData, year) {
  const field = year === '2025' ? 'plan2025' : 'plan2026';
  const items = budgetData.items;

  const flatList = items.map(item => ({
    id: item.productCode,
    title: item.description,
    amount: item[field],
    group: item.policyBlockName,
    groupId: item.policyBlock,
    district: item.amt,
    productCode: item.productCode,
    costType: item.costTypePosition
  }));

  flatList.sort((a, b) => b.amount - a.amount);

  return flatList;
}

function createBlocksDetail(budgetData, year) {
  const field = year === '2025' ? 'plan2025' : 'plan2026';
  const aggregated = budgetData.aggregated;

  const blocksDetail = {};

  for (const [blockId, blockData] of Object.entries(aggregated)) {
    const products = blockData.items.map(item => ({
      productCode: item.productCode,
      description: item.description,
      amt: item.amt,
      teilhaushalt: item.teilhaushalt,
      value: item[field],
      costType: item.costTypePosition,
      accountDescription: item.accountDescription
    }));

    blocksDetail[blockId] = {
      id: blockId,
      name: blockData.name,
      color: blockData.color,
      value: blockData[field],
      valueMio: Math.round(blockData[field] / 1e6 * 10) / 10,
      itemCount: blockData.itemCount,
      products: products
    };
  }

  return blocksDetail;
}

function writeJSON(filepath, data) {
  const dir = path.dirname(filepath);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf-8');

  const sizeKB = fs.statSync(filepath).size / 1024;
  const relativePath = path.relative(process.cwd(), filepath);
  console.log(`  ✓ ${relativePath.padEnd(50)} (${sizeKB.toFixed(1).padStart(6)} KB)`);
}

function main() {
  console.log('\n' + '='.repeat(80));
  console.log('GENERATING STATIC JSON FILES');
  console.log('='.repeat(80) + '\n');

  const budgetData = loadProcessedData();
  if (!budgetData) {
    process.exit(1);
  }

  const outputBase = path.join(__dirname, '..', 'public', 'data');

  // Generate for both years
  for (const year of ['2025', '2026']) {
    console.log(`\nGenerating ${year} data...`);
    const yearDir = path.join(outputBase, year);

    // 1. Summary stats
    const summary = createSummaryStats(budgetData, year);
    writeJSON(path.join(yearDir, 'summary.json'), summary);

    // 2. Treemap hierarchy
    const treemap = createTreemapHierarchy(budgetData, year);
    writeJSON(path.join(yearDir, 'treemap.json'), treemap);

    // 3. Flat list
    const flatList = createFlatList(budgetData, year);
    writeJSON(path.join(yearDir, 'list.json'), flatList);

    // 4. Detailed blocks
    const blocksDetail = createBlocksDetail(budgetData, year);
    const blocksDir = path.join(yearDir, 'blocks');

    for (const [blockId, blockData] of Object.entries(blocksDetail)) {
      const filename = `${blockId}-${blockData.name.toLowerCase().replace(/ /g, '-').replace(/&/g, 'und')}.json`;
      writeJSON(path.join(blocksDir, filename), blockData);
    }
  }

  // 5. Meta file
  const meta = {
    years: [2025, 2026],
    defaultYear: 2025,
    source: budgetData.metadata.source,
    generated: budgetData.metadata.generated,
    dataType: 'Ergebnishaushalt',
    city: 'Leipzig',
    totalItems: budgetData.metadata.totalItems
  };
  writeJSON(path.join(outputBase, 'meta.json'), meta);

  console.log('\n' + '='.repeat(80));
  console.log('✓ STATIC JSON GENERATION COMPLETE');
  console.log('='.repeat(80));
  console.log('\nNext steps:');
  console.log('  1. Review generated files in public/data/');
  console.log('  2. Test: npm run dev');
  console.log('  3. No .env needed - it just works!\n');
}

if (require.main === module) {
  main();
}

module.exports = { createTreemapHierarchy, createSummaryStats, createFlatList };
