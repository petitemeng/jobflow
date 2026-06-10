import { Job, Stats } from './types'

const BASE = '/api'

export const api = {
  getJobs: (): Promise<Job[]> =>
    fetch(`${BASE}/jobs`).then(r => r.json()),

  getStats: (): Promise<Stats> =>
    fetch(`${BASE}/stats`).then(r => r.json()),

  createJob: (data: Partial<Job>): Promise<Job> =>
    fetch(`${BASE}/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(r => r.json()),

  updateJob: (id: number, data: Partial<Job>): Promise<Job> =>
    fetch(`${BASE}/jobs/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(r => r.json()),

  deleteJob: (id: number): Promise<void> =>
    fetch(`${BASE}/jobs/${id}`, { method: 'DELETE' }).then(() => undefined)
}
