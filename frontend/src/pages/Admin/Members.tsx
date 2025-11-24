// src/pages/Members.tsx
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, MoreVertical, Bell } from 'lucide-react';
import { apiRequest } from '../../config/api';
import { useLocation } from 'react-router-dom';
// Mock data in a separate structure (simulating a separate file)
const MOCK_DATA = {
  members: [
    {
      id: 1,
      name: "John Doe",
      email: "john.doe@example.com",
      phone: "+1 234 567 890",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
      membershipPlan: "Annual Gold",
      expiryDate: "2026-10-15",
      status: "Active"
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane.smith@example.com",
      phone: "+1 987 654 321",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jane",
      membershipPlan: "Monthly Basic",
      expiryDate: "2025-11-30",
      status: "Due"
    },
    {
      id: 3,
      name: "Sam Wilson",
      email: "sam.wilson@example.com",
      phone: "+1 555 123 456",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sam",
      membershipPlan: "Quarterly Pro",
      expiryDate: "2025-08-20",
      status: "Expired"
    },
    {
      id: 4,
      name: "Emily Carter",
      email: "emily.carter@example.com",
      phone: "+1 444 555 666",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emily",
      membershipPlan: "Annual Gold",
      expiryDate: "2027-01-05",
      status: "Active"
    }
  ],
  admin: {
    name: "Jane Doe",
    role: "Administrator",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin"
  }
};

// ---------- UI subcomponents (unchanged styling) ----------

export const StatusBadge = ({ status }: { status: string }) => {
  const statusConfig: Record<string, string> = {
    Active: "bg-green-100 text-green-700",
    Due: "bg-orange-100 text-orange-700",
    Expired: "bg-red-100 text-red-700"
  };

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusConfig[status] ?? 'bg-gray-100 text-gray-700'}`}>
      {status}
    </span>
  );
};

export const SearchInput = ({ value, onChange, placeholder }: { value: string; onChange: (e: any) => void; placeholder?: string }) => {
  return (
    <div className="relative flex-1 max-w-md">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
      />
    </div>
  );
};

export const Dropdown = ({ label, value, onChange, options }: { label: string; value: string; onChange: (e: any) => void; options: string[] }) => {
  return (
    <div className="flex items-center gap-2">
      <span className="text-gray-700 font-medium whitespace-nowrap">{label}</span>
      <select
        value={value}
        onChange={onChange}
        className="px-4 py-2.5 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent cursor-pointer"
      >
        {options.map(option => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </div>
  );
};

export const Header = ({ admin }: { admin: any }) => {
  const [adminData, setAdminData] = useState(admin || {})



  return (
    <div className="flex items-center justify-between mb-8">
      <h1 className="text-4xl font-bold text-gray-900">Member Management</h1>
      <div className="flex items-center gap-4">
        <button className="relative p-2 hover:bg-gray-100 rounded-full transition-colors">
          <Bell className="w-6 h-6 text-gray-600" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        <div className="flex items-center gap-3">
          <div className="hidden sm:block">
            <div className="text-sm font-semibold text-gray-900">{admin.name}</div>
            <div className="text-xs text-gray-500">{admin.role}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const FilterBar = ({ searchTerm, setSearchTerm, batch, setBatch, status, setStatus }: any) => {
  const navigate = useNavigate();
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
      <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
        <SearchInput
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search members by name, email..."
        />
        <div className="flex flex-col sm:flex-row gap-4 lg:gap-4">
          <Dropdown
            label="Batch:"
            value={batch}
            onChange={(e) => setBatch(e.target.value)}
            options={["All Batches", "morning", "evening", "afternoon", "night"]}
          />
          <Dropdown
            label="Status:"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            options={["All Status", "Active", "Due", "Expired"]}
          />
        </div>
        <button onClick={() => navigate('/addmember')} className="lg:ml-auto bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 whitespace-nowrap">
          <Plus className="w-5 h-5" />
          Add New Member
        </button>
      </div>
    </div>
  );
};

export const TableHeader = () => {
  return (
    <thead className="bg-gray-50 border-b border-gray-200">
      <tr>
        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
          Member Name
        </th>
        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider hidden md:table-cell">
          Contact
        </th>
        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider hidden lg:table-cell">
          Membership Plan
        </th>
        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider hidden xl:table-cell">
          Expiry Date
        </th>
        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
          Status
        </th>
        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
          Actions
        </th>
      </tr>
    </thead>
  );
};

// ---------- helpers ----------
export const formatDateISO = (input: any) => {
  if (!input) return '';
  const d = typeof input === 'string' || typeof input === 'number' ? new Date(input) : input instanceof Date ? input : null;
  if (!d || isNaN(d.getTime())) return String(input);
  return d.toISOString().split('T')[0];
};

export const addDurationToDate = (joinDate: any, duration: number, durationType: string) => {
  if (!joinDate) return '';
  const d = new Date(joinDate);
  if (isNaN(d.getTime())) return '';
  const dt = (durationType ?? '').toString().toLowerCase();
  if (dt.includes('month')) {
    d.setMonth(d.getMonth() + Number(duration || 0));
  } else if (dt.includes('week')) {
    d.setDate(d.getDate() + (Number(duration || 0) * 7));
  } else if (dt.includes('day')) {
    d.setDate(d.getDate() + Number(duration || 0));
  } else {
    // unknown type -> fallback: return joinDate formatted
    return formatDateISO(joinDate);
  }
  return formatDateISO(d);
};

// ---------- data normalization ----------
export const normalizeMember = (raw: any, idx: number) => {
  const id = raw.id ?? raw._id ?? (idx + 1);
  const name =
    raw.name ??
    raw.fullName ??
    (raw.firstName || raw.lastName ? `${raw.firstName ?? ''} ${raw.lastName ?? ''}`.trim() : `Member ${id}`);
  const email = raw.email ?? raw.contactEmail ?? raw.emailAddress ?? '';
  // backend uses "contact" field in example response
  const phone = String(raw.phone ?? raw.contact ?? raw.phoneNumber ?? raw.mobile ?? '');
  const avatar = raw.avatar ?? raw.avatarUrl ?? raw.profilePic ?? raw.picture ?? raw.image ??
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`;

  // plan may be a string id, string name, or an object - handle object shape
  let membershipPlan = '—';
  let expiryDate = '';
  if (raw.plan) {
    if (typeof raw.plan === 'object') {
      membershipPlan = raw.plan.name ?? raw.plan.planName ?? raw.plan.title ?? '—';
      // compute expiry from joinDate + plan duration if possible
      if (raw.joinDate && raw.plan.duration) {
        expiryDate = addDurationToDate(raw.joinDate, raw.plan.duration, raw.plan.durationType ?? '');
      }
    } else {
      membershipPlan = String(raw.plan);
    }
  } else if (raw.planName) {
    membershipPlan = String(raw.planName);
  }

  // fallback expiry fields that might exist directly
  if (!expiryDate) {
    const expiryRaw = raw.expiryDate ?? raw.expiresAt ?? raw.subscriptionEnd ?? raw.endDate ?? raw.joinDate ?? '';
    expiryDate = formatDateISO(expiryRaw);
  }

  const status = raw.status ?? raw.paymentStatus ?? raw.membershipStatus ?? (raw.dueAmount ? 'Due' : 'Active');
  const batch = raw.batch ?? '—';

  return { id, name, email, phone, avatar, membershipPlan, expiryDate, status, batch };
};

// ---------- row / pagination components ----------
export const TableRow = ({ member }: { member: any }) => {
  // --- Phone formatting ---
  const phoneStr = member.contact != null ? String(member.contact) : '';
  const phoneParts = phoneStr.split(' ').filter(Boolean);
  const firstLine = phoneParts.slice(0, 2).join(' ') || phoneStr || '';
  const secondLine = phoneParts.slice(2).join(' ') || '';

  // --- Plan details ---
  const plan = member.plan;
  const planName = plan?.name ?? '';
  const planDuration = plan ? `${plan.duration ?? ''} ${plan.durationType ?? ''}` : '';

  // --- Calculate expiry date ---
  let expiryDate: Date | null = null;
  if (plan && member.joinDate) {
    const joinDate = new Date(member.joinDate);
    const duration = Number(plan.duration) || 0;

    switch (plan.durationType) {
      case 'Month':
        joinDate.setMonth(joinDate.getMonth() + duration);
        break;
      case 'Year':
        joinDate.setFullYear(joinDate.getFullYear() + duration);
        break;
      case 'Day':
        joinDate.setDate(joinDate.getDate() + duration);
        break;
      default:
        break;
    }

    expiryDate = joinDate;
  }

  // --- Compute status dynamically ---
  const status = expiryDate && expiryDate < new Date() ? 'Expired' : 'Active';

  // --- Format expiry date as YYYY-MM-DD ---
  const expiryDateStr = expiryDate
    ? expiryDate.toISOString().split('T')[0]
    : '—'; // e.g., "2025-11-15"


  return (
    <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div>
            <div className="font-semibold text-gray-900">{member.name}</div>
            <div className="text-sm text-gray-500">{member.email}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 hidden md:table-cell">
        <div className="text-sm text-gray-900">{firstLine}</div>
        <div className="text-sm text-gray-900">{secondLine}</div>
      </td>
      <td className="px-6 py-4 hidden lg:table-cell">
        <div className="text-sm text-gray-900">{planName}</div>
        <div className="text-sm text-gray-900">{planDuration}</div>
      </td>
      <td className="px-6 py-4 text-sm text-gray-900 hidden xl:table-cell">
        {expiryDateStr}
      </td>
      <td className="px-6 py-4">
        <StatusBadge status={status} />
      </td>
      <td className="px-6 py-4">
        <button className="p-1 hover:bg-gray-100 rounded transition-colors">
          <MoreVertical className="w-5 h-5 text-gray-600" />
        </button>
      </td>
    </tr>
  );
};


export const Pagination = ({ currentPage, totalPages, onPageChange, showingFrom, showingTo, totalItems }: { currentPage: number; totalPages: number; onPageChange: (p: number) => void; showingFrom: number; showingTo: number; totalItems: number }) => {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
      <div className="text-sm text-gray-600">
        Showing <span className="font-medium">{showingFrom}</span> - <span className="font-medium">{showingTo}</span> of <span className="font-medium">{totalItems}</span>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map(page => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${currentPage === page
              ? 'bg-indigo-600 text-white'
              : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
          >
            {page}
          </button>
        ))}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
};

// ---------- MAIN COMPONENT ----------
const Members: React.FC = () => {
  const PAGE_SIZE = 10;
  const [searchTerm, setSearchTerm] = useState('');
  const [batch, setBatch] = useState('All Batches');
  const [status, setStatus] = useState('All Status');
  const [currentPage, setCurrentPage] = useState(1);
  // const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user") || "")
  const role = localStorage.getItem("role")
  const userId = role == "Admin" ? user?.id : user?.createdBy;
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadMembers = async () => {
      setLoading(true);
      try {
        const res = await apiRequest({
          method: 'GET',
          endpoint: '/member/getAllMembers',
          body: { id: userId }
        });
        console.log("Result: ", res)
        setMembers(res.data)
      } catch (err: any) {
        if (err.data.status == 404) {
          setMembers([])
        }
        else {
          console.error("Error fetching members: ", err)
        }
      } finally {
        setLoading(false);
      }
    };

    loadMembers();
    getAdminDetail();
  }, []);

  const getAdminDetail = async () => {
    try {
      const res = await apiRequest({
        method: 'GET',
        endpoint: '/staff/getAdmin',
        body: { id: user?.id }
      });
      setMembers(res.data)
    } catch (err: any) {

    }
  }

  // filter (search + status + batch)
  const filtered = useMemo(() => {
    return (members ?? []).filter(member => {
      const matchesSearch = (member.name ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (member.email ?? '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = status === 'All Status' || member.status === status;
      const matchesBatch = batch === 'All Batches' || member.batch === batch;
      return matchesSearch && matchesStatus && matchesBatch;
    });
  }, [members, searchTerm, status, batch]);


  // recompute pagination when filtered changes
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1);
  }, [totalPages, currentPage]);

  // Reset to page 1 whenever filters change (search/status/batch)
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, status, batch]);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    return filtered.slice(start, end);
  }, [filtered, currentPage]);

  const showingFrom = filtered.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const showingTo = Math.min(filtered.length, currentPage * PAGE_SIZE);

  return (
    <div className="min-h-screen w-full bg-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <Header admin={MOCK_DATA.admin} />

        <FilterBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          batch={batch}
          setBatch={setBatch}
          status={status}
          setStatus={setStatus}
        />

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <TableHeader />
              <tbody>
                {paginated.map(member => (
                  <TableRow key={member.id} member={member} />
                ))}
                {paginated.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500">
                      {loading ? 'Loading members...' : 'No members found.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(p) => setCurrentPage(Math.max(1, Math.min(totalPages, p)))}
            showingFrom={showingFrom}
            showingTo={showingTo}
            totalItems={filtered.length}
          />
        </div>

        <div className="mt-4 text-right text-sm text-gray-600">
          {loading ? 'Loading members...' : `Showing ${filtered.length} members`}
        </div>
      </div>
    </div>
  );
};

export default Members;
