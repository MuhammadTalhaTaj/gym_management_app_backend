// src/pages/AdminMemberTable.tsx
import  { useEffect, useState } from 'react';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { apiRequest } from '../config/api'; // uses your existing apiRequest helper

// Data file - membersData.js (fallback)
const membersData = [
  {
    id: 1,
    name: 'Jessica Miller',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    contact: '+1 234 567 890',
    plan: 'Gold Annual',
    status: 'Expired',
    statusType: 'danger',
    expiryDate: '2025-11-10'
  },
  {
    id: 2,
    name: 'David Chen',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
    contact: '+1 987 654 321',
    plan: 'Silver Monthly',
    status: 'Expired',
    statusType: 'danger',
    expiryDate: '2025-11-06'
  },
  {
    id: 3,
    name: 'Michael Brown',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
    contact: '+1 555 123 456',
    plan: 'Platinum Quarterly',
    status: 'Expired',
    statusType: 'danger',
    expiryDate: '2025-11-15'
  }
];

// Avatar Component (unchanged)
// const Avatar = ({ src, alt, size = 'md' }: any) => {
//   const sizeClasses: Record<string, string> = {
//     sm: 'w-8 h-8',
//     md: 'w-12 h-12',
//     lg: 'w-16 h-16'
//   };

//   return (
//     <div className={`${sizeClasses[size]} rounded-full overflow-hidden flex-shrink-0`}>
//       <img src={src} alt={alt} className="w-full h-full object-cover" />
//     </div>
//   );
// };

// Status Badge Component (unchanged)
const StatusBadge = ({ status, type }: { status: string; type: string }) => {
  const styles: Record<string, string> = {
    danger: 'bg-red-900/40 text-red-400 border border-red-800/50',
    warning: 'bg-orange-900/40 text-orange-400 border border-orange-800/50',
    success: 'bg-green-900/40 text-green-400 border border-green-800/50'
  };

  return (
    <span className={`px-3 py-1.5 rounded text-sm font-medium inline-block ${styles[type] || styles.success}`}>
      {status}
    </span>
  );
};

// Action Button Component (unchanged)
const ActionButton = ({ icon: Icon, onClick, label }: any) => {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 rounded transition-all duration-200"
    >
      <Icon size={18} />
    </button>
  );
};

// Member Row Component (unchanged)
const MemberRow = ({ member, onView, onEdit, onDelete }: any) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[2fr_1.5fr_1.5fr_1.2fr_1.2fr_1fr] gap-4 lg:gap-6 items-center py-6 px-4 lg:px-6 border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors">
      {/* Member Info */}
      <div className="flex items-center gap-4">
        {/* <Avatar src={member.avatar} alt={member.name} size="md" /> */}
        <h3 className="text-slate-200 font-medium text-base lg:text-lg">{member.name}</h3>
      </div>

      {/* Contact */}
      {/* <div className="lg:block">
        <span className="lg:hidden text-slate-400 text-sm mr-2">Contact:</span>
        <span className="text-slate-300 text-sm lg:text-base">{member.contact}</span>
      </div> */}

      {/* Plan */}
      <div className="lg:block">
        <span className="lg:hidden text-slate-400 text-sm mr-2">Plan:</span>
        <span className="text-slate-400 text-sm lg:text-base">{member.plan}</span>
      </div>

      {/* Status */}
      <div className="lg:block">
        <span className="lg:hidden text-slate-400 text-sm mr-2 inline-block">Status:</span>
        <StatusBadge status={member.status} type={member.statusType} />
      </div>

      {/* Expiry Date */}
      <div className="lg:block">
        <span className="lg:hidden text-slate-400 text-sm mr-2">Expires:</span>
        <span className="text-slate-400 text-sm lg:text-base">{member.expiryDate}</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 justify-start lg:justify-end">
        <ActionButton icon={Eye} onClick={() => onView(member.id)} label="View" />
        <ActionButton icon={Pencil} onClick={() => onEdit(member.id)} label="Edit" />
        <ActionButton icon={Trash2} onClick={() => onDelete(member.id)} label="Delete" />
      </div>
    </div>
  );
};

// Table Header Component (unchanged)
const TableHeader = () => {
  return (
    <div className="hidden lg:grid lg:grid-cols-[2fr_1.5fr_1.5fr_1.2fr_1.2fr_1fr] gap-6 px-6 py-4 border-b border-slate-700/50">
      <div className="text-slate-400 text-sm font-medium uppercase tracking-wider">Member Name</div>
      {/* <div className="text-slate-400 text-sm font-medium uppercase tracking-wider">Contact</div> */}
      <div className="text-slate-400 text-sm font-medium uppercase tracking-wider">Plan</div>
      <div className="text-slate-400 text-sm font-medium uppercase tracking-wider">Status</div>
      <div className="text-slate-400 text-sm font-medium uppercase tracking-wider">Expiry Date</div>
      <div className="text-slate-400 text-sm font-medium uppercase tracking-wider text-right">Actions</div>
    </div>
  );
};

// helper to format date -> YYYY-MM-DD (keeps same style as fallback)
const formatDateISO = (input: any) => {
  if (!input) return '';
  const d = typeof input === 'string' || typeof input === 'number' ? new Date(input) : input instanceof Date ? input : null;
  if (!d || isNaN(d.getTime())) return String(input);
  return d.toISOString().split('T')[0];
};

// normalize backend member -> frontend shape (keeps existing normalization, adds expiry formatting)
const normalizeMember = (raw: any, idx: number) => {
  const id = raw.id ?? raw._id ?? (idx + 1);
  const name =
    raw.name ??
    raw.fullName ??
    (raw.firstName || raw.lastName ? `${raw.firstName ?? ''} ${raw.lastName ?? ''}`.trim() : `Member ${id}`);
  const avatar = raw.avatar ?? raw.avatarUrl ?? raw.profilePic ?? raw.picture ?? raw.image ?? '';
  const contact = raw.contact ?? raw.phone ?? raw.phoneNumber ?? raw.mobile ?? '';
  const plan = raw.planName ?? raw.plan ?? raw.subscription ?? raw.membershipPlan ?? '—';
  const status = raw.status ?? raw.paymentStatus ?? raw.subscriptionStatus ?? (raw.dueAmount ? 'Payment Due' : 'Active');
  const rawStatusType = (raw.statusType ?? raw.statusTypeName ?? raw.paymentStatus ?? '').toString().toLowerCase();
  let statusType = 'success';
  if (rawStatusType.includes('due') || rawStatusType.includes('overdue') || rawStatusType.includes('pending') || rawStatusType.includes('failed')) {
    statusType = 'danger';
  } else if (rawStatusType.includes('expire') || rawStatusType.includes('expiring') || rawStatusType.includes('soon')) {
    statusType = 'warning';
  } else if (raw.dueAmount && Number(raw.dueAmount) > 0) {
    statusType = 'danger';
  }

  const expiryDateRaw = raw.expiryDate ?? raw.expiresAt ?? raw.subscriptionEnd ?? raw.endDate ?? raw.joinDate ?? '';
  const expiryDate = formatDateISO(expiryDateRaw);

  return { id, name, avatar, contact, plan, status, statusType, expiryDate };
};

// Main Component (fetches expired members from dashboard controller)
const AdminMemberTable = () => {
  const [members, setMembers] = useState<any[]>(membersData);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadMembers = async () => {
      setLoading(true);

      try {
        // call dashboard endpoint that returns expiredMembersList
        const data = await apiRequest({
          method: 'GET',
          endpoint: '/auth/dashboard'
        });

        // possible keys where expired list is returned
        let rawList: any[] = [];
        if (Array.isArray(data.expiredMembersList)) rawList = data.expiredMembersList;
        else if (Array.isArray(data.expiredMembers)) rawList = data.expiredMembers;
        else if (Array.isArray(data.data)) rawList = data.data;
        else {
          // try to find any array inside response
          const values = Object.values(data || {});
          const firstArray = values.find(v => Array.isArray(v));
          if (Array.isArray(firstArray)) rawList = firstArray as any[];
        }

        if (!Array.isArray(rawList) || rawList.length === 0) {
          // no expired members returned -> use fallback (membersData)
          if (mounted) {
            setMembers(membersData);
          }
          setLoading(false);
          return;
        }

        // normalize and set members
        const normalized = rawList.map((r, i) => normalizeMember(r, i));
        if (mounted) setMembers(normalized);
      } catch (err) {
        // on any error (network, auth, 5xx), fallback to provided membersData
        console.warn('Failed to fetch expired members from /auth/dashboard — using fallback membersData', err);
        if (mounted) setMembers(membersData);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadMembers();
    return () => { mounted = false; };
  }, []);

  const handleView = (id: any) => { console.log('View member:', id); };
  const handleEdit = (id: any) => { console.log('Edit member:', id); };
  const handleDelete = (id: any) => { console.log('Delete member:', id); };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">Member Status</h1>
        </div>

        {/* Table Card */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-2xl border border-slate-700/50 overflow-hidden">
          <TableHeader />

          {/* Member Rows */}
          <div className="divide-y divide-slate-700/50">
            {members.map((member) => (
              <MemberRow
                key={member.id}
                member={{ ...member, status: 'Expired', statusType: 'danger' }}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-6 text-center">
          <p className="text-slate-400 text-sm">
            Showing {members.length} members {loading ? ' (loading...)' : ''}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminMemberTable;
