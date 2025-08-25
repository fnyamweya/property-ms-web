import type { AgingBucket, BalanceRow } from './types'

export function bucketFor(days: number): AgingBucket {
  if (days <= 30) return '0-30'
  if (days <= 60) return '31-60'
  if (days <= 90) return '61-90'
  return '90+'
}

export function computeAging(
  row: BalanceRow,
  asOf = new Date()
): Record<AgingBucket, number> {
  const buckets: Record<AgingBucket, number> = {
    '0-30': 0,
    '31-60': 0,
    '61-90': 0,
    '90+': 0,
  }
  if (!row.dueDate || row.balance <= 0) return buckets
  const days = Math.floor(
    (asOf.getTime() - row.dueDate.getTime()) / (1000 * 60 * 60 * 24)
  )
  const b = bucketFor(days < 0 ? 0 : days)
  buckets[b] = row.balance
  return buckets
}

export function formatMoney(v: number, currency: string) {
  return `${currency} ${Math.round(v).toLocaleString('en-KE')}`
}
