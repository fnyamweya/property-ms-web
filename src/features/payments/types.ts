export type Currency = 'KES' | 'USD'

export type PaymentStatus = 'Pending' | 'Completed' | 'Failed' | 'Refunded'
export type PaymentMethod = 'Mpesa' | 'Card' | 'Bank' | 'Cash'
export type PaymentDirection = 'Incoming' | 'Outgoing'

export type Payment = {
  id: string
  reference: string
  tenantName: string
  unit?: string
  propertyName?: string
  method: PaymentMethod
  amount: number
  currency: Currency
  status: PaymentStatus
  direction: PaymentDirection
  createdAt: Date
  notes?: string
  invoiceId?: string
}

export type PaymentsQuery = {
  q?: string
  status?: PaymentStatus | 'All'
  method?: PaymentMethod | 'All'
  direction?: PaymentDirection | 'All'
  propertyId?: string | 'All'
  dateFrom?: Date | null
  dateTo?: Date | null
  page?: number
  pageSize?: number
}
