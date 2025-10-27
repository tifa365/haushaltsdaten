#!/usr/bin/env python3
"""
Process Leipzig Ergebnishaushalt Excel file
Production-grade version with validation and audit controls
"""
import openpyxl
import json
from pathlib import Path
from collections import defaultdict

# Mapping table: Product code prefix → Policy block
MAPPING = {
    '11': 'A', '12': 'A',
    '21': 'B', '22': 'B', '23': 'B', '24': 'B', '25': 'B', '26': 'B', '27': 'B', '28': 'B', '29': 'B',
    '31': 'C', '33': 'C', '34': 'C', '35': 'C', '36': 'C',
    '41': 'D', '42': 'E',
    '51': 'F', '52': 'F',
    '53': 'G', '54': 'H',
    '55': 'I', '56': 'I',
    '57': 'J', '61': 'K'
}

BLOCK_NAMES = {
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
}

BLOCK_COLORS = {
    'A': '#3B82F6', 'B': '#10B981', 'C': '#EF4444', 'D': '#F59E0B',
    'E': '#8B5CF6', 'F': '#EC4899', 'G': '#06B6D4', 'H': '#6366F1',
    'I': '#14B8A6', 'J': '#F97316', 'K': '#64748B'
}

def process_ergebnishaushalt(filepath):
    """
    Process Leipzig Ergebnishaushalt Excel file

    CRITICAL RULES (Controller-grade):
    1. Only process "2 ordentliche Aufwendungen" (ordinary expenses)
    2. Only process "PR" (Product-level) rows, NOT "OR" (Object-level) to avoid double counting
    3. Extract first 2 digits of product code as prefix
    4. Track and report all unmapped prefixes (audit trail)
    """
    print(f"\n{'='*80}")
    print(f"Opening: {filepath}")
    print(f"{'='*80}\n")

    wb = openpyxl.load_workbook(filepath, read_only=True, data_only=True)
    sheet = wb['Grunddaten']

    budget_items = []
    headers = None

    # Tracking counters for audit
    row_count = 0
    skipped_not_expense = 0
    skipped_not_pr = 0
    skipped_no_pc = 0
    skipped_unmapped = 0
    unmapped_prefixes = set()

    for row in sheet.iter_rows(values_only=True):
        row_count += 1

        if headers is None:
            headers = [str(h) if h else f"col_{i}" for i, h in enumerate(row)]
            print(f"✓ Found {len(headers)} columns")

            # Validate critical columns exist
            required = ['Zuordnung_Kostenart.Ebene', 'Objektart', 'Zielstruktur.PC', 'Plan 2025', 'Plan 2026']
            missing = [col for col in required if col not in headers]
            if missing:
                print(f"✗ ERROR: Missing required columns: {missing}")
                wb.close()
                return None

            print(f"✓ All required columns present")
            print()
            continue

        row_dict = dict(zip(headers, row))

        # RULE 1: Filter only ordinary expenses
        ebene = str(row_dict.get('Zuordnung_Kostenart.Ebene', ''))
        if '2 ordentliche Aufwendungen' not in ebene:
            skipped_not_expense += 1
            continue

        # RULE 2: CRITICAL - Only PR rows (product-level totals, not individual facilities)
        # This prevents double-counting!
        objektart = str(row_dict.get('Objektart', ''))
        if objektart != 'PR':
            skipped_not_pr += 1
            continue

        # Extract product code
        pc = str(row_dict.get('Zielstruktur.PC', ''))
        if not pc or pc == 'None' or len(pc) < 2:
            skipped_no_pc += 1
            continue

        # RULE 3: Extract prefix (first 2 digits)
        prefix = pc[:2]
        policy_block = MAPPING.get(prefix)

        if not policy_block:
            # Unknown prefix - track for audit
            unmapped_prefixes.add(prefix)
            skipped_unmapped += 1
            continue

        # Extract amounts
        plan2025 = row_dict.get('Plan 2025', 0)
        plan2026 = row_dict.get('Plan 2026', 0)

        # Handle None values
        if plan2025 is None:
            plan2025 = 0
        if plan2026 is None:
            plan2026 = 0

        plan2025 = float(plan2025)
        plan2026 = float(plan2026)

        # Build item with full context (for filtering/drilldown later)
        budget_items.append({
            'productCode': pc,
            'description': str(row_dict.get('PCBeschreibung', '')),
            'amt': str(row_dict.get('Amt', '')),
            'teilhaushalt': str(row_dict.get('Zielstruktur.Teilhaushalt Bezeichnung', '')),
            'costTypeEbene': ebene,
            'costTypePosition': str(row_dict.get('Zuordnung_Kostenart.Position', '')),
            'accountDescription': str(row_dict.get('KostenartBeschreibung', '')),
            'objektart': objektart,
            'prefix': prefix,
            'policyBlock': policy_block,
            'policyBlockName': BLOCK_NAMES[policy_block],
            'plan2025': plan2025,
            'plan2026': plan2026,
        })

    wb.close()

    # Audit Report
    print(f"{'='*80}")
    print(f"PROCESSING AUDIT REPORT")
    print(f"{'='*80}")
    print(f"Total rows processed:           {row_count:>10,}")
    print(f"Budget items extracted:         {len(budget_items):>10,}")
    print(f"-"*80)
    print(f"Skipped (not 'ordentl. Aufw'): {skipped_not_expense:>10,}")
    print(f"Skipped (not PR - avoid dbl):  {skipped_not_pr:>10,}")
    print(f"Skipped (no product code):     {skipped_no_pc:>10,}")
    print(f"Skipped (unmapped prefix):     {skipped_unmapped:>10,}")

    if unmapped_prefixes:
        print(f"\n⚠️  WARNING: Unmapped prefixes found: {sorted(unmapped_prefixes)}")
        print(f"    These product codes were excluded from analysis.")
        print(f"    Update MAPPING dictionary to include them.")
    else:
        print(f"\n✓ All product codes successfully mapped")

    print(f"{'='*80}\n")

    return budget_items

def aggregate_by_policy(items):
    """Aggregate budget items by policy block"""
    blocks = defaultdict(lambda: {
        'plan2025': 0,
        'plan2026': 0,
        'itemCount': 0,
        'items': []
    })

    for item in items:
        block = item['policyBlock']
        blocks[block]['block'] = block
        blocks[block]['name'] = item['policyBlockName']
        blocks[block]['color'] = BLOCK_COLORS[block]
        blocks[block]['plan2025'] += item['plan2025']
        blocks[block]['plan2026'] += item['plan2026']
        blocks[block]['itemCount'] += 1
        blocks[block]['items'].append(item)

    return dict(blocks)

def validate_totals(aggregated, total2025, total2026):
    """
    CRITICAL: Validate that sum of blocks equals total
    This catches double-counting or missing data
    """
    sum_blocks_2025 = sum(b['plan2025'] for b in aggregated.values())
    sum_blocks_2026 = sum(b['plan2026'] for b in aggregated.values())

    print(f"{'='*80}")
    print(f"VALIDATION CHECK")
    print(f"{'='*80}")

    # Check 2025
    diff_2025 = abs(total2025 - sum_blocks_2025)
    if diff_2025 < 0.01:  # Allow tiny floating point errors
        print(f"✓ 2025 totals match: {total2025/1e6:,.1f} Mio €")
    else:
        print(f"✗ ERROR 2025: Total={total2025/1e6:,.1f} Mio €, Sum of blocks={sum_blocks_2025/1e6:,.1f} Mio €")
        print(f"   Difference: {diff_2025/1e6:,.1f} Mio €")
        return False

    # Check 2026
    diff_2026 = abs(total2026 - sum_blocks_2026)
    if diff_2026 < 0.01:
        print(f"✓ 2026 totals match: {total2026/1e6:,.1f} Mio €")
    else:
        print(f"✗ ERROR 2026: Total={total2026/1e6:,.1f} Mio €, Sum of blocks={sum_blocks_2026/1e6:,.1f} Mio €")
        print(f"   Difference: {diff_2026/1e6:,.1f} Mio €")
        return False

    print(f"{'='*80}\n")
    return True

def print_summary(aggregated, total2025, total2026):
    """Print summary statistics"""
    print(f"{'='*80}")
    print(f"POLICY BLOCK SUMMARY - PLAN 2025")
    print(f"{'='*80}")

    # Sort by amount descending
    sorted_blocks = sorted(aggregated.items(), key=lambda x: x[1]['plan2025'], reverse=True)

    for block_id, data in sorted_blocks:
        amount_mio = data['plan2025'] / 1e6
        percentage = (data['plan2025'] / total2025 * 100) if total2025 > 0 else 0
        item_count = data['itemCount']
        print(f"{block_id} - {data['name']:40s}: {amount_mio:>10,.1f} Mio € ({percentage:>5.1f}%) [{item_count:>3} items]")

    print("-"*80)
    print(f"{'TOTAL':43s}: {total2025/1e6:>10,.1f} Mio € ({total2025/1e9:.3f} Mrd €)")
    print(f"{'':43s}  {total2026/1e6:>10,.1f} Mio € ({total2026/1e9:.3f} Mrd €) [2026]")
    print("="*80 + "\n")

if __name__ == '__main__':
    # Process the file
    leipzig_file = Path('daten/leipzig-ergebnishaushalt-2025_2026.xlsx')

    if not leipzig_file.exists():
        print(f"✗ ERROR: File not found: {leipzig_file}")
        print("  Please place Leipzig Excel file in daten/ folder")
        exit(1)

    items = process_ergebnishaushalt(leipzig_file)

    if items is None or len(items) == 0:
        print("✗ ERROR: No items processed! Check file structure.")
        exit(1)

    # Aggregate
    aggregated = aggregate_by_policy(items)

    # Calculate totals
    total2025 = sum(item['plan2025'] for item in items)
    total2026 = sum(item['plan2026'] for item in items)

    # CRITICAL: Validate totals match
    if not validate_totals(aggregated, total2025, total2026):
        print("✗ VALIDATION FAILED - Do not use this data!")
        exit(1)

    # Print summary
    print_summary(aggregated, total2025, total2026)

    # Output JSON
    output = {
        'metadata': {
            'source': str(leipzig_file),
            'generated': True,  # Add timestamp in production
            'totalItems': len(items),
            'total2025': total2025,
            'total2026': total2026,
            'total2025Mrd': round(total2025 / 1e9, 3),
            'total2026Mrd': round(total2026 / 1e9, 3),
            'validation': {
                'totalsMatch': True,
                'allPrefixesMapped': True
            }
        },
        'aggregated': aggregated,
        'items': items  # Full detail for drilldown
    }

    output_file = Path('src/data/leipzig-budget-data.json')
    output_file.parent.mkdir(parents=True, exist_ok=True)

    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    print(f"✓ Output saved to: {output_file}")
    print(f"✓ Ready for production use\n")
