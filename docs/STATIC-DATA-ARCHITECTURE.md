# Static Data Architecture

## Overview

This project uses **static JSON files** instead of a database. This architectural decision provides:

- ✅ **Zero configuration** - No `.env` files, no database credentials
- ✅ **Perfect reproducibility** - Git commit = exact dataset
- ✅ **Maximum performance** - CDN-served, edge-cached
- ✅ **Zero cost** - No database hosting fees
- ✅ **Open source friendly** - Anyone can `npm install && npm run dev`
- ✅ **Audit trail** - All data changes tracked in Git

## Data Flow

```
Leipzig Excel File (daten/*.xlsx)
         ↓
  [1. Process] npm run data:process
         ↓
  src/data/leipzig-budget-data.json (intermediate)
         ↓
  [2. Generate] npm run data:generate
         ↓
  public/data/{year}/*.json (static files)
         ↓
  [3. Serve] Next.js serves from /public
         ↓
  [4. Load] Frontend fetches JSON via fetch()
```

## File Structure

```
public/data/
├── meta.json                       # Available years, metadata
├── 2025/
│   ├── summary.json                # Top-level stats (~5KB)
│   ├── treemap.json                # Hierarchical data for D3 (~500KB-2MB)
│   ├── list.json                   # Flat list for detail view (~300KB-1MB)
│   └── blocks/                     # Individual policy blocks (lazy-loaded)
│       ├── A-verwaltung-sicherheit.json
│       ├── B-bildung-kultur.json
│       ├── C-soziales-jugend.json
│       └── ...
└── 2026/
    └── ... (same structure)
```

## Commands

### Process Leipzig Excel → JSON
```bash
npm run data:process
```

**Input:** `daten/leipzig-ergebnishaushalt-2025_2026.xlsx`
**Output:** `src/data/leipzig-budget-data.json`

**What it does:**
- Reads Excel "Grunddaten" sheet
- Filters for `"2 ordentliche Aufwendungen"` (expenses only)
- Filters for `Objektart = "PR"` (product-level only, prevents double-counting)
- Maps product codes to policy blocks
- Validates totals
- Outputs intermediate JSON

### Generate Static Files
```bash
npm run data:generate
```

**Input:** `src/data/leipzig-budget-data.json`
**Output:** `public/data/{year}/*.json`

**What it does:**
- Creates treemap hierarchy
- Creates summary stats
- Creates flat lists
- Splits by year (2025, 2026)
- Generates per-block detail files

### Full Pipeline
```bash
npm run data:build
```

Runs both `data:process` and `data:generate` in sequence.

## Development Workflow

### Initial Setup (One Time)
```bash
# 1. Clone repo
git clone <repo-url>
cd haushaltsdaten

# 2. Install dependencies
npm install

# 3. Place Leipzig Excel file
cp ~/Downloads/leipzig-ergebnishaushalt-2025_2026.xlsx daten/

# 4. Process data
npm run data:build

# 5. Start dev server
npm run dev
```

**No `.env` file needed!** Just works.

### Updating Data (When New Budget Released)
```bash
# 1. Get new Excel file
cp ~/Downloads/leipzig-ergebnishaushalt-2027_2028.xlsx daten/

# 2. Rebuild data
npm run data:build

# 3. Review changes
git diff public/data/

# 4. Commit
git add public/data/
git commit -m "data: update to 2027/2028 budget"
git push

# 5. Deploy (Vercel picks up automatically)
```

## Data Loading in Frontend

### Load Treemap Data
```typescript
import { loadTreemapData } from '@/lib/staticData/loadBudgetData';

const treemap = await loadTreemapData(2025);
// Use with D3 treemap component
```

### Load Summary Stats
```typescript
import { loadSummaryStats } from '@/lib/staticData/loadBudgetData';

const stats = await loadSummaryStats(2025);
console.log(stats.totalMrd); // 2.824
console.log(stats.blocks[0].name); // "Soziales & Jugend"
```

### Load List Data
```typescript
import { loadListData, filterListData } from '@/lib/staticData/loadBudgetData';

const allItems = await loadListData(2025);

// Filter by policy block
const filtered = filterListData(allItems, {
  group: 'C' // Soziales & Jugend
});
```

## Why Static Over Database?

### For This Project Specifically:

| Requirement | Static JSON | Database (PostgreSQL) |
|-------------|-------------|----------------------|
| Data updates | 2x per year | 2x per year |
| Query complexity | Simple hierarchies | Simple hierarchies |
| User personalization | None needed | None needed |
| Real-time updates | Not needed | Not needed |
| **Result** | **Perfect fit** | **Overkill** |

### Advantages

**1. Developer Experience**
- Clone → Install → Run (3 commands, no secrets)
- No "ask for credentials" friction
- Works offline
- Fast local dev

**2. Deployment**
- Push to Git → Auto-deploy (Vercel/Netlify)
- No database provisioning
- No connection pool management
- No query optimization needed

**3. Performance**
- CDN-cached globally
- < 50ms latency
- Unlimited scale
- No cold starts

**4. Cost**
- Storage: $0 (in Git)
- Serving: $0 (CDN)
- Database: $0 (none needed)
- **Total: $0/month**

**5. Auditability**
- Every data version in Git history
- Reproducible visualizations
- Clear data provenance
- Compliance-friendly

### When You WOULD Need a Database

- ✅ Data updates daily/hourly
- ✅ Complex JOIN queries across many tables
- ✅ User-specific data (auth, permissions)
- ✅ Write operations (forms, comments)
- ✅ Aggregations too expensive client-side
- ✅ Dataset > 100MB per file

**None of these apply to Leipzig budget visualization.**

## Migration from Database (Completed)

### What Was Removed
- ✅ All database query dependencies
- ✅ Database client initialization code
- ✅ Remote data fetching functions
- ✅ Database connection env vars from `.env.example`

### What Was Added
- ✅ `scripts/process-leipzig-data.js` (Node.js Excel processing)
- ✅ `scripts/generate-static-json.js` (Static file generation)
- ✅ Static JSON data loading utilities
- ✅ `npm run data:*` scripts in package.json
- ✅ `xlsx` package for Excel reading

## File Sizes

Typical sizes for Leipzig (~2.8 Mrd € budget, ~700 products):

| File | Size | Load When |
|------|------|-----------|
| `meta.json` | 1 KB | Homepage |
| `summary.json` | 5 KB | Homepage |
| `treemap.json` | 500KB-2MB | Visualization page |
| `list.json` | 300KB-1MB | Visualization page |
| `blocks/*.json` | 10-50 KB each | On drill-down (lazy) |

**Total initial load:** ~1-3 MB (acceptable for data viz)

**Optimization tips:**
- Serve gzipped (automatic on Vercel)
- Use `getStaticProps` for pre-loading
- Lazy-load block details
- Consider splitting large files if needed

## Deployment Checklist

### Before Each Deploy
- [ ] Run `npm run data:build`
- [ ] Verify JSON files generated in `public/data/`
- [ ] Test locally: `npm run dev`
- [ ] Check browser console for errors
- [ ] Verify treemap renders
- [ ] Check file sizes (< 5MB total ideal)

### Deploy
```bash
git add public/data/
git commit -m "data: update Leipzig budget 2025/2026"
git push origin main
```

Vercel automatically:
1. Detects push
2. Runs `npm run build`
3. Serves `public/data/` from CDN
4. Done ✅

## Troubleshooting

### "No data found"
**Cause:** JSON files missing
**Fix:** Run `npm run data:build`

### "Failed to load treemap data"
**Cause:** File path wrong or not deployed
**Fix:** Check `public/data/2025/treemap.json` exists

### "Totals don't match"
**Cause:** Excel file structure changed
**Fix:** Review `process-leipzig-data.js` mapping

### Numbers seem wrong
**Cause:** Double-counting (OR vs PR rows)
**Fix:** Verify script filters `Objektart === 'PR'`

## Future Enhancements

### If Dataset Grows Large (> 10MB)
1. **Option:** Split by policy block
2. **Option:** Add API route for filtering
3. **Option:** Use IndexedDB for client-side cache

### If Need Dynamic Filters
1. **Option:** Pre-generate all filter combinations
2. **Option:** Add lightweight `/api/filter` endpoint
3. **Keep:** JSON as backing store (don't add database)

### If Multiple Cities
1. **Structure:** `public/data/leipzig/`, `public/data/dresden/`
2. **Route:** `/leipzig/visualisierung`, `/dresden/visualisierung`
3. **Stay static:** One JSON set per city

## Summary

**Static JSON is the right architecture for Leipzig budget visualization because:**

1. Data updates rarely (2x/year)
2. No complex queries needed
3. No user accounts/auth
4. Perfect developer experience
5. Zero infrastructure cost
6. Maximum performance
7. Full audit trail

**Don't add a database unless requirements fundamentally change.**
