// Shared lightweight types used by frontend components.
export type Job = {
  id: number
  title: string
  company: string
  status: string
  notes?: string
  source?: string
  date_applied?: string
  place?: string
  salary?: number
}
