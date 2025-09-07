"use client"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export type Charge = { name?: string; amount?: number; currency?: string }

export function ChargesEditor({ value, onChange, defaultCurrency = 'KES' }: { value: Charge[]; onChange: (next: Charge[]) => void; defaultCurrency?: string }) {
  const rows = value
  const set = (idx: number, patch: Partial<Charge>) => {
    const next = rows.slice()
    next[idx] = { ...next[idx], ...patch }
    onChange(next)
  }
  const add = () => onChange([...(rows || []), { currency: defaultCurrency }])
  const remove = (idx: number) => onChange(rows.filter((_, i) => i !== idx))

  return (
    <div className='space-y-2'>
      <div className='text-sm font-medium'>Charges</div>
      {(rows || []).map((c, i) => (
        <div key={i} className='grid grid-cols-[1fr_1fr_140px_auto] gap-2'>
          <Input placeholder='Name' value={c.name ?? ''} onChange={(e) => set(i, { name: e.target.value })} />
          <Input type='number' inputMode='numeric' placeholder='Amount' value={String(c.amount ?? '')} onChange={(e) => set(i, { amount: e.target.value === '' ? undefined : Number(e.target.value) })} />
          <Select value={c.currency ?? defaultCurrency} onValueChange={(v) => set(i, { currency: v })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='KES'>KES</SelectItem>
              <SelectItem value='USD'>USD</SelectItem>
            </SelectContent>
          </Select>
          <Button type='button' variant='outline' onClick={() => remove(i)}>Remove</Button>
        </div>
      ))}
      <Button type='button' variant='secondary' size='sm' onClick={add}>Add charge</Button>
    </div>
  )
}
