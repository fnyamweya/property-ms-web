export type Transaction = {
  id: number
  date: string
  description: string
  category: string
  status: 'Completed' | 'Pending' | 'Failed'
  reviewer: string
  amount: number
  balance: number
}
