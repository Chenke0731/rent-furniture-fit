import fs from 'node:fs'
import path from 'node:path'

const csvPath = process.argv[2] || 'data-template.csv'
const raw = fs.readFileSync(path.resolve(process.cwd(), csvPath), 'utf-8').replace(/^\uFEFF/, '')
const lines = raw.split(/\r?\n/).filter((l) => l.trim().length > 0)
const headers = lines[0].split(',').map((h) => h.trim())

const numOrNull = (s) => {
  const t = (s ?? '').trim()
  if (!t) return null
  const n = Number(t)
  if (Number.isNaN(n)) throw new Error(`Invalid number: "${s}"`)
  return n
}

const boolOrNull = (s) => {
  const t = (s ?? '').trim().toLowerCase()
  if (!t) return null
  if (t === 'yes' || t === 'true' || t === '是' || t === '1') return true
  if (t === 'no' || t === 'false' || t === '否' || t === '0') return false
  throw new Error(`Invalid needsDrill value: "${s}" (use yes/no or leave empty)`)
}

const items = lines.slice(1).map((line, idx) => {
  const cols = line.split(',')
  const row = Object.fromEntries(headers.map((h, i) => [h, (cols[i] ?? '').trim()]))
  if (!['desk', 'shelf', 'cabinet'].includes(row.category)) {
    throw new Error(`Row ${idx + 2}: category must be desk, shelf, or cabinet (got "${row.category}")`)
  }
  const asm = row.assembly || null
  if (asm && !['assembled', 'tool', 'toolfree'].includes(asm)) {
    throw new Error(`Row ${idx + 2}: assembly must be assembled, tool, toolfree, or empty (got "${asm}")`)
  }
  return {
    id: row.id || `ITEM_${idx + 1}`,
    name: row.name,
    category: row.category,
    price: numOrNull(row.price),
    extraFee: numOrNull(row.extraFee),
    width: numOrNull(row.width),
    depth: numOrNull(row.depth),
    height: numOrNull(row.height),
    packageMinSide: numOrNull(row.packageMinSide),
    operationDepth: numOrNull(row.operationDepth),
    needsDrill: boolOrNull(row.needsDrill),
    assembly: asm,
    weight: numOrNull(row.weight),
    source: row.source || '人工核验',
    checkedAt: row.checkedAt || null,
    isSample: !row.checkedAt,
    isManual: false,
  }
})

console.log(`Parsed ${items.length} items from ${csvPath}.`)
if (process.argv.includes('--write')) {
  const outPath = path.resolve(process.cwd(), 'src/data/sample.ts')
  const code = `import type { FurnitureItem } from '@/engine/types'\n\nexport const SAMPLE_ITEMS: FurnitureItem[] = ${JSON.stringify(items, null, 2)}\n`
  fs.writeFileSync(outPath, code, 'utf-8')
  console.log(`Wrote ${items.length} items to ${outPath}`)
}
