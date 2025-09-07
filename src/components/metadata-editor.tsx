/** @jsxImportSource react */
'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

type Row = {
  id: string
  key: string
  type: 'string' | 'number' | 'boolean' | 'array'
  value: string
}

function toObject(rows: Row[]): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const r of rows) {
    const k = r.key?.trim()
    if (!k) continue
    if (r.type === 'number') {
      const n = parseFloat(r.value)
      if (!Number.isNaN(n)) out[k] = n
    } else if (r.type === 'boolean') {
      const v = r.value.toLowerCase()
      if (v === 'true' || v === 'false') out[k] = v === 'true'
    } else if (r.type === 'array') {
      const arr = r.value
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
      if (arr.length) out[k] = arr
    } else {
      const s = r.value.trim()
      if (s !== '') out[k] = s
    }
  }
  return out
}

export function MetadataEditor({
  value,
  onChange,
  disabled,
  title = 'Additional details',
}: {
  value: Record<string, unknown>
  onChange: (next: Record<string, unknown>) => void
  disabled?: boolean
  title?: string
}) {
  const [rows, setRows] = React.useState<Row[]>(() => {
    const init: Row[] = Object.entries(value ?? {}).map(([k, v]) => {
      const type: Row['type'] = Array.isArray(v)
        ? 'array'
        : typeof v === 'boolean'
          ? 'boolean'
          : typeof v === 'number'
            ? 'number'
            : 'string'
      const val = Array.isArray(v)
        ? (v as any[]).map((x) => (typeof x === 'object' ? JSON.stringify(x) : String(x))).join(', ')
        : typeof v === 'object' && v !== null
          ? JSON.stringify(v)
          : String(v ?? '')
      return { id: crypto.randomUUID(), key: k, type, value: val }
    })
    return init.length ? init : [{ id: crypto.randomUUID(), key: '', type: 'string', value: '' }]
  })

  const emit = (next: Row[]) => {
    setRows(next)
    onChange(toObject(next))
  }

  const addRow = () => emit([...rows, { id: crypto.randomUUID(), key: '', type: 'string', value: '' }])
  const removeRow = (id: string) => emit(rows.filter((r) => r.id !== id))
  const update = (id: string, patch: Partial<Row>) => emit(rows.map((r) => (r.id === id ? { ...r, ...patch } : r)))

  return (
    <div className='space-y-2'>
      <div className='text-sm font-medium'>{title}</div>
      <div className='grid grid-cols-1 gap-2'>
        {rows.map((r) => (
          <div key={r.id} className='grid grid-cols-1 gap-2 sm:grid-cols-[1fr_120px_1fr_auto] sm:items-center'>
            <Input
              aria-label='Key'
              placeholder='key (e.g., bedrooms)'
              value={r.key}
              onChange={(e) => update(r.id, { key: e.target.value })}
              disabled={disabled}
            />
            <Select value={r.type} onValueChange={(v) => update(r.id, { type: v as Row['type'], value: '' })} disabled={disabled}>
              <SelectTrigger className='sm:w-[120px]'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='string'>string</SelectItem>
                <SelectItem value='number'>number</SelectItem>
                <SelectItem value='boolean'>boolean</SelectItem>
                <SelectItem value='array'>array</SelectItem>
              </SelectContent>
            </Select>
            {r.type === 'number' ? (
              <Input aria-label='Value (number)' type='number' inputMode='numeric' placeholder='0' value={r.value} onChange={(e) => update(r.id, { value: e.target.value })} disabled={disabled} />
            ) : r.type === 'boolean' ? (
              <Select value={(r.value || '').toString().toLowerCase() === 'true' ? 'true' : (r.value || '').toString().toLowerCase() === 'false' ? 'false' : ''} onValueChange={(v) => update(r.id, { value: v })} disabled={disabled}>
                <SelectTrigger>
                  <SelectValue placeholder='true | false' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='true'>true</SelectItem>
                  <SelectItem value='false'>false</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <Input aria-label='Value' placeholder={r.type === 'array' ? 'a, b, c' : 'value'} value={r.value} onChange={(e) => update(r.id, { value: e.target.value })} disabled={disabled} />
            )}
            <Button variant='outline' type='button' onClick={() => removeRow(r.id)} disabled={disabled}>
              Remove
            </Button>
          </div>
        ))}
      </div>
      <div className='pt-1'>
        <Button type='button' variant='secondary' size='sm' onClick={addRow} disabled={disabled}>
          Add field
        </Button>
      </div>
    </div>
  )
}
