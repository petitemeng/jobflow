import { useState, useEffect } from 'react'
import { Job, Stats, Status } from './types'
import { api } from './api'

const STATUS_COLORS: Record<Status, { bg: string; text: string }> = {
  saved:     { bg: '#e8e8e0', text: '#444' },
  applied:   { bg: '#dbeafe', text: '#1e40af' },
  interview: { bg: '#fef9c3', text: '#854d0e' },
  offer:     { bg: '#dcfce7', text: '#166534' },
  rejected:  { bg: '#fee2e2', text: '#991b1b' },
}

const STATUS_OPTIONS: Status[] = ['saved', 'applied', 'interview', 'offer', 'rejected']

const EMPTY_FORM = {
  company: '', role: '', url: '', location: '', salary: '', status: 'saved' as Status, notes: '', applied_date: ''
}

export default function App() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [filter, setFilter] = useState<Status | 'all'>('all')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    const [j, s] = await Promise.all([api.getJobs(), api.getStats()])
    setJobs(j)
    setStats(s)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const filtered = filter === 'all' ? jobs : jobs.filter(j => j.status === filter)

  const openAdd = () => {
    setForm(EMPTY_FORM)
    setEditingId(null)
    setShowForm(true)
  }

  const openEdit = (job: Job) => {
    setForm({
      company: job.company,
      role: job.role,
      url: job.url || '',
      location: job.location || '',
      salary: job.salary || '',
      status: job.status,
      notes: job.notes || '',
      applied_date: job.applied_date || ''
    })
    setEditingId(job.id)
    setShowForm(true)
  }

  const handleSubmit = async () => {
    if (!form.company || !form.role) return
    if (editingId) {
      await api.updateJob(editingId, form)
    } else {
      await api.createJob(form)
    }
    setShowForm(false)
    load()
  }

  const handleStatusChange = async (id: number, status: Status) => {
    await api.updateJob(id, { status })
    load()
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Remove this job?')) return
    await api.deleteJob(id)
    load()
  }

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '2rem 1rem' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.5px' }}>JobFlow</h1>
          <p style={{ color: '#666', fontSize: 14, marginTop: 2 }}>Track your job search pipeline</p>
        </div>
        <button onClick={openAdd} style={{
          background: '#1a1a1a', color: '#fff', border: 'none',
          borderRadius: 8, padding: '10px 18px', fontSize: 14, fontWeight: 500
        }}>+ Add job</button>
      </div>

      {/* Stats */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: '2rem' }}>
          {[
            { label: 'Total', value: stats.total },
            { label: 'Applied', value: stats.applied },
            { label: 'Interviews', value: stats.interviews },
            { label: 'Offers', value: stats.offers },
            { label: 'Rejected', value: stats.rejected },
          ].map(s => (
            <div key={s.label} style={{
              background: '#fff', borderRadius: 10, padding: '14px 16px',
              border: '1px solid #e8e8e0'
            }}>
              <div style={{ fontSize: 22, fontWeight: 700 }}>{s.value}</div>
              <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: '1.5rem' }}>
        {(['all', ...STATUS_OPTIONS] as const).map(s => (
          <button key={s} onClick={() => setFilter(s)} style={{
            padding: '6px 14px', borderRadius: 20, fontSize: 13, border: '1px solid #ddd',
            background: filter === s ? '#1a1a1a' : '#fff',
            color: filter === s ? '#fff' : '#444',
            fontWeight: filter === s ? 600 : 400
          }}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Jobs list */}
      {loading ? (
        <p style={{ color: '#888', textAlign: 'center', padding: '3rem' }}>Loading...</p>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#888' }}>
          <p style={{ fontSize: 16, marginBottom: 8 }}>No jobs here yet.</p>
          <p style={{ fontSize: 14 }}>Add your first job to get started.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(job => (
            <div key={job.id} style={{
              background: '#fff', borderRadius: 10, padding: '16px 20px',
              border: '1px solid #e8e8e0', display: 'flex', alignItems: 'center', gap: 16
            }}>
              {/* Company initial */}
              <div style={{
                width: 40, height: 40, borderRadius: 8, background: '#f0f0e8',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: 16, flexShrink: 0
              }}>
                {job.company[0].toUpperCase()}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{job.role}</div>
                <div style={{ fontSize: 13, color: '#666', marginTop: 2 }}>
                  {job.company}
                  {job.location && <span> · {job.location}</span>}
                  {job.salary && <span> · {job.salary}</span>}
                </div>
              </div>

              {/* Status dropdown */}
              <select
                value={job.status}
                onChange={e => handleStatusChange(job.id, e.target.value as Status)}
                style={{
                  padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                  border: 'none', cursor: 'pointer',
                  background: STATUS_COLORS[job.status].bg,
                  color: STATUS_COLORS[job.status].text
                }}
              >
                {STATUS_OPTIONS.map(s => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 8 }}>
                {job.url && (
                  <a href={job.url} target="_blank" rel="noreferrer" style={{
                    fontSize: 12, color: '#1a1a1a', padding: '4px 10px',
                    border: '1px solid #ddd', borderRadius: 6, textDecoration: 'none'
                  }}>View</a>
                )}
                <button onClick={() => openEdit(job)} style={{
                  fontSize: 12, padding: '4px 10px', border: '1px solid #ddd',
                  borderRadius: 6, background: '#fff', color: '#1a1a1a'
                }}>Edit</button>
                <button onClick={() => handleDelete(job.id)} style={{
                  fontSize: 12, padding: '4px 10px', border: '1px solid #fee2e2',
                  borderRadius: 6, background: '#fff', color: '#991b1b'
                }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal form */}
      {showForm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
        }}>
          <div style={{
            background: '#fff', borderRadius: 14, padding: '28px 32px',
            width: '100%', maxWidth: 480, boxShadow: '0 20px 60px rgba(0,0,0,0.15)'
          }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>
              {editingId ? 'Edit job' : 'Add job'}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {([
                { key: 'company', label: 'Company *', type: 'text' },
                { key: 'role', label: 'Role *', type: 'text' },
                { key: 'url', label: 'Job URL', type: 'url' },
                { key: 'location', label: 'Location', type: 'text' },
                { key: 'salary', label: 'Salary range', type: 'text' },
                { key: 'applied_date', label: 'Applied date', type: 'date' },
              ] as const).map(field => (
                <div key={field.key}>
                  <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 }}>
                    {field.label}
                  </label>
                  <input
                    type={field.type}
                    value={form[field.key]}
                    onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                    style={{
                      width: '100%', padding: '8px 12px', border: '1px solid #ddd',
                      borderRadius: 8, fontSize: 14
                    }}
                  />
                </div>
              ))}

              <div>
                <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 }}>Status</label>
                <select
                  value={form.status}
                  onChange={e => setForm(f => ({ ...f, status: e.target.value as Status }))}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14 }}
                >
                  {STATUS_OPTIONS.map(s => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 }}>Notes</label>
                <textarea
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  rows={3}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, resize: 'vertical' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 24, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowForm(false)} style={{
                padding: '9px 18px', border: '1px solid #ddd', borderRadius: 8,
                background: '#fff', fontSize: 14
              }}>Cancel</button>
              <button onClick={handleSubmit} style={{
                padding: '9px 18px', border: 'none', borderRadius: 8,
                background: '#1a1a1a', color: '#fff', fontSize: 14, fontWeight: 500
              }}>
                {editingId ? 'Save changes' : 'Add job'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
