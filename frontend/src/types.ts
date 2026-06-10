export type Status = 'saved' | 'applied' | 'interview' | 'offer' | 'rejected'

export interface Job {
  id: number
  company: string
  role: string
  url?: string
  location?: string
  salary?: string
  status: Status
  notes?: string
  applied_date?: string
  created_at: string
  updated_at: string
}

export interface Stats {
  total: string
  applied: string
  interviews: string
  offers: string
  rejected: string
}
