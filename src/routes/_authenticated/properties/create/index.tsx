import { createFileRoute } from '@tanstack/react-router'
import { CreatePropertyPage } from '@/features/portfolio/properties/create'

export const Route = createFileRoute('/_authenticated/properties/create/')({
  component: CreatePropertyPage,
})
