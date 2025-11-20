// src/pages/MemberDetailPage.tsx
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { apiRequest } from '../../config/api'

interface Member {
  _id: string
  name?: string
  email?: string
  contact?: string
  batch?: string
  address?: string
  plan?: string
  joinDate?: string
  admissionAmount?: number
  admissionFee?: number
  discount?: number
  collectedAmount?: number
  dueAmount?: number
  createdAt?: string
  updatedAt?: string
  [key: string]: any
}

const MemberDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [member, setMember] = useState<Member | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        // backend does not expose GET /member/:id in your snippet,
        // so fetch all and find by id (safe fallback).
        const res = await apiRequest<{ message: string; data: Member[] }>({
          method: 'GET',
          endpoint: '/member/getallmember'
        })
        const found = (res.data || []).find((m: Member) => m._id === id) || null
        setMember(found)
      } catch (err) {
        console.error('Failed to load member', err)
        setMember(null)
      } finally {
        setLoading(false)
      }
    }
    if (id) load()
    else setLoading(false)
  }, [id])

  if (loading) return <div style={{ padding: 20 }}>Loading...</div>
  if (!member) return <div style={{ padding: 20 }}>Member not found</div>

  const entries = [
    ['Name', member.name],
    ['Email', member.email],
    ['Contact', member.contact],
    ['Batch', member.batch],
    ['Address', member.address],
    ['Plan', member.plan],
    ['Join Date', member.joinDate ? new Date(member.joinDate).toLocaleString() : '—'],
    ['Admission Amount', member.admissionAmount ?? '—'],
    ['Admission Fee', member.admissionFee ?? '—'],
    ['Discount', member.discount ?? '—'],
    ['Collected Amount', member.collectedAmount ?? '—'],
    ['Due Amount', member.dueAmount ?? '—'],
    ['Created At', member.createdAt ? new Date(member.createdAt).toLocaleString() : '—'],
    ['Updated At', member.updatedAt ? new Date(member.updatedAt).toLocaleString() : '—']
  ]

  return (
    <div className="memberDetailPage w-full bg-[var(--primary-200)] text-[var(--primary-300)]" style={{ padding: 20 }}>
      <h2 className='text-3xl font-bold mb-9'>Member Details</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <tbody>
          {entries.map(([k, v]) => (
            <tr key={k} style={{ border: '1px solid var(--primary-300)' }}>
              <td style={{ padding: 10, width: 220, fontWeight: 700,fontSize: '1.2rem',borderRight:'2px solid var(--primary-300)' }}>{k}</td>
              <td style={{ padding: 10,fontSize: '1.1rem',backgroundColor:'var(--primary-100)',color:'var(--primary-300)' }}>{v !== undefined && v !== null ? String(v) : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default MemberDetail
