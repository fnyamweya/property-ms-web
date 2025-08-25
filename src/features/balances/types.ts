export type Currency = 'KES' | 'USD'
export type BalanceKind = 'AR' | 'AP' // Receivable/Payable

export type AgingBucket = '0-30' | '31-60' | '61-90' | '90+'

export type LedgerEntry = {
  id: string
  date: Date
  reference: string
  description?: string
  debit: number // positive
  credit: number // positive
  currency: Currency
}

export type BalanceRow = {
  id: string
  kind: BalanceKind
  entityName: string // Tenant/Vendor name
  unit?: string
  propertyName?: string
  currency: Currency
  openingBalance: number
  totalDebits: number
  totalCredits: number
  balance: number
  dueDate?: Date // for aging
  aging?: Record<AgingBucket, number> // amounts bucketed
  ledger: LedgerEntry[]
}
