import fs from 'node:fs'
import path from 'node:path'

const csvPath = process.argv[2] || 'data-template.csv'
const raw = fs.readFileSync(path.resolve(process.cwd(), csvPath), 'utf-8').replace(/^\uFEFF/, '')

function parseCsv(text) {
  const rows = []
  let row = []
  let field = ''
  let inQuotes = false
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        field += ch
      }
    } else if (ch === '"') {
      inQuotes = true
    } else if (ch === ',') {
      row.push(field.trim())
      field = ''
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++
      row.push(field.trim())
      if (row.some((c) => c.length > 0)) rows.push(row)
      row = []
      field = ''
    } else {
      field += ch
    }
  }
  row.push(field.trim())
  if (row.some((c) => c.length > 0)) rows.push(row)
  return rows
}

const rows = parseCsv(raw)
if (rows.length < 2) throw new Error(`CSV file "${csvPath}" has no data rows.`)

const headers = rows[0]
const CATEGORY_MAP = {
  desk: 'desk',
  '书桌': 'desk',
  shelf: 'shelf',
  '置物架': 'shelf',
  cabinet: 'cabinet',
  '收纳柜': 'cabinet',
  '小型收纳柜': 'cabinet',
}
const ASSEMBLY_MAP = {
  assembled: 'assembled',
  '整装': 'assembled',
  '整装不可拆': 'assembled',
  tool: 'tool',
  '需工具': 'tool',
  '需工具组装': 'tool',
  toolfree: 'toolfree',
  '免工具': 'toolfree',
  '免工具拆装': 'toolfree',
}

const numOrNull = (s, col, lineNo) => {
  const t = (s ?? '').trim()
  if (!t) return null
  const n = Number(t)
  if (Number.isNaN(n)) throw new Error(`第 ${lineNo} 行 ${col} 不是有效数字: "${s}"`)
  return n
}

const boolOrNull = (s, lineNo) => {
  const t = (s ?? '').trim().toLowerCase()
  if (!t) return null
  if (['yes', 'true', '是', '需要', '1'].includes(t)) return true
  if (['no', 'false', '否', '不需要', '免打孔', '0'].includes(t)) return false
  throw new Error(`第 ${lineNo} 行 needsDrill 无效: "${s}"（请填 是/否 或留空）`)
}

const seenIds = new Set()
const items = rows.slice(1).map((cols, idx) => {
  const lineNo = idx + 2
  const row = Object.fromEntries(headers.map((h, i) => [h, (cols[i] ?? '').trim()]))
  const id = row.id || `ITEM_${idx + 1}`
  if (seenIds.has(id)) throw new Error(`第 ${lineNo} 行 id 重复: "${id}"`)
  seenIds.add(id)
  if (!row.name) throw new Error(`第 ${lineNo} 行缺少商品名称 name`)

  const category = CATEGORY_MAP[row.category]
  if (!category) {
    throw new Error(`第 ${lineNo} 行 category 无效: "${row.category}"（仅支持 书桌/置物架/收纳柜 或 desk/shelf/cabinet）`)
  }

  let assembly = null
  if (row.assembly) {
    assembly = ASSEMBLY_MAP[row.assembly]
    if (!assembly) {
      throw new Error(`第 ${lineNo} 行 assembly 无效: "${row.assembly}"（请填 整装/需工具/免工具 或留空）`)
    }
  }

  return {
    id,
    name: row.name,
    category,
    price: numOrNull(row.price, 'price', lineNo),
    extraFee: numOrNull(row.extraFee, 'extraFee', lineNo),
    width: numOrNull(row.width, 'width', lineNo),
    depth: numOrNull(row.depth, 'depth', lineNo),
    height: numOrNull(row.height, 'height', lineNo),
    packageMinSide: numOrNull(row.packageMinSide, 'packageMinSide', lineNo),
    operationDepth: numOrNull(row.operationDepth, 'operationDepth', lineNo),
    needsDrill: boolOrNull(row.needsDrill, lineNo),
    assembly,
    weight: numOrNull(row.weight, 'weight', lineNo),
    source: row.source || '人工核验',
    checkedAt: row.checkedAt || null,
    isSample: !row.checkedAt,
    isManual: false,
  }
})

const missingPkg = items.filter((i) => i.packageMinSide === null).length
const missingDrill = items.filter((i) => i.needsDrill === null).length
const missingOp = items.filter((i) => i.operationDepth === null).length
console.log(`已解析 ${items.length} 条商品（未披露包装尺寸 ${missingPkg} 条，未披露打孔 ${missingDrill} 条，未披露使用空间 ${missingOp} 条）。`)

if (process.argv.includes('--write')) {
  const outPath = path.resolve(process.cwd(), 'src/data/sample.ts')
  const code = `import type { FurnitureItem } from '@/engine/types'\n\nexport const SAMPLE_ITEMS: FurnitureItem[] = ${JSON.stringify(items, null, 2)}\n`
  fs.writeFileSync(outPath, code, 'utf-8')
  console.log(`已写入 ${outPath}`)
}
