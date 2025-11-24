// src/components/AdminHeader.tsx
import { useState, useEffect, useRef } from 'react'
import '../assets/styles/AdminHeader.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBell, faUser } from '@fortawesome/free-solid-svg-icons'
import { useNavigate } from 'react-router-dom'
import { apiRequest } from '../config/api' // matches your api helper

interface Member {
  _id: string
  name?: string
  email?: string
  contact?: string
  batch?: string
  address?: string
  joinDate?: string
  [key: string]: any
}

interface UserInterface {
  id: string,
  name: string,
  email: string,
  contact: string,
  gymName: string,
  gymLocation: string
}

function AdminHeader() {
  const [unread,] = useState(1)
  const [members, setMembers] = useState<Member[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const searchRef = useRef<HTMLDivElement | null>(null)
  const [user, setUser] = useState<UserInterface | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const initialize = async () => {
      await getUserData(); // load user
    };

    initialize();
  }, []);

  useEffect(() => {
    if (!user) return;

    const fetch = async () => {
      await fetchMembers();
    };

    fetch();
  }, [user]);

  // close dropdown on outside click
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!searchRef.current) return
      if (!(e.target instanceof Node)) return
      if (!searchRef.current.contains(e.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])
  const fetchMembers = async () => {
    try {
      const res = await apiRequest<{ message: string; data: Member[] }>({
        method: 'GET',
        endpoint: '/member/getAllMembers',
        body: { id: user?.id }
      })
      setMembers(res.data || [])
    } catch (err) {
      console.error('Failed to fetch members', err)
    }
  }
  const getUserData = async () => {
    const stored = localStorage.getItem("user");
    console.log("User: ", stored);

    if (!stored) {
      setUser(null); // no user found
      return;
    }

    try {
      const parsed: UserInterface = JSON.parse(stored);
      setUser(parsed);
    } catch (err) {
      console.error("Failed to parse stored user", err);
      setUser(null);
    }
  };

  const openMember = (id: string) => {
    setShowDropdown(false)
    navigate(`/members/${id}/payments`)
  }

  const openAllMembersPage = () => {
    setShowDropdown(false)
    navigate('/members', { state: { userId: user?.id } })
  }

  return (
    <div className='adminHeader'>
      <div className="adminHeader1"><h1>Welcome {user?.name ?? "User"}!</h1> <sub>Here's your gym's performance overview for today.</sub></div>

      <div className="adminHeader2" ref={searchRef} style={{ position: 'relative' }}>
        {/* keep the same input markup and classes */}
        <input
          type="text"
          placeholder='Search Members...'
          onFocus={() => setShowDropdown(true)} // when user clicks/focus the search, show members
          readOnly // readOnly so typing doesn't change layout; remove if you want typing search
        />
        {showDropdown && (
          <div
            className="adminSearchResults"
            style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              left: 0,
              right: 0,
              zIndex: 9999,
              background: 'var(--primary-100)'
            }}
          >
            <div style={{ padding: 8, borderBottom: '1px solid #eee', display: 'flex', color: "white", justifyContent: 'space-between', alignItems: 'center' }}>
              <strong style={{ fontSize: 14 }}>Members</strong>
              <button onClick={openAllMembersPage} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
                View all
              </button>
            </div>

            <div style={{ maxHeight: 280, overflowY: 'auto', color: "white" }}>
              {members.length === 0 && <div style={{ padding: 12 }}>No members</div>}
              {members.map(m => (
                <div
                  key={m._id}
                  onClick={() => openMember(m._id)}
                  style={{ padding: 10, cursor: 'pointer', borderBottom: '1px solid #f3f3f3' }}
                >
                  <div style={{ fontWeight: 600 }}>{m.name || '—'}</div>
                  <div style={{ fontSize: 12, opacity: 0.8 }}>{m.email || m.contact || 'No contact'}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="adminHeader3">
        <div className="adminNotificationIcon relative">
          <FontAwesomeIcon icon={faBell} />
          {unread > 0 && (
            <span className="adminUnreadDot"></span>
          )}
        </div>
        <FontAwesomeIcon icon={faUser} className='userIcon' />
      </div>
    </div>
  )
}

export default AdminHeader
