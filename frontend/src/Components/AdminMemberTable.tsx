// src/pages/AdminMemberTable.tsx
import { useEffect, useState } from 'react';
import { Eye, Pencil, Trash2 } from 'lucide-react';

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
  const expiryDate = "2025-11-10T05:35:00.000Z";
  const formattedDate = new Date(expiryDate).toISOString().slice(0, 10);
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[2fr_1.5fr_1.5fr_1.2fr_1.2fr_1fr] gap-4 lg:gap-6 items-center py-6 px-4 lg:px-6 border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors">
      {/* Member Info */}
      <div className="flex items-center gap-4">
        {/* <Avatar src={member.avatar} alt={member.name} size="md" /> */}
        <h3 className="text-slate-200 font-medium text-base lg:text-lg">{member.name}</h3>
      </div>

      {/* Plan */}
      <div className="lg:block">
        <span className="lg:hidden text-slate-400 text-sm mr-2">Plan:</span>
        <span className="text-slate-400 text-sm lg:text-base">{member.planName}</span>
      </div>

      {/* Status */}
      <div className="lg:block">
        <span className="lg:hidden text-slate-400 text-sm mr-2 inline-block">Status:</span>
        <StatusBadge status={member.status} type={member.statusType} />
      </div>

      {/* Expiry Date */}
      <div className="lg:block">
        <span className="lg:hidden text-slate-400 text-sm mr-2">Expires:</span>
        <span className="text-slate-400 text-sm lg:text-base">{formattedDate}</span>
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

// Main Component (fetches expired members from dashboard controller)
const AdminMemberTable = ({data}:{data:any}) => {
  const [members,setMembers] = useState<any[]>([]);
  const handleView = (id: any) => { console.log('View member:', id); };
  const handleEdit = (id: any) => { console.log('Edit member:', id); };
  const handleDelete = (id: any) => { console.log('Delete member:', id); };

  useEffect(()=>{
    if(data){
      console.log("Data: ",data);
      
      setMembers(data.expiredMembersList)
    }
  },[data])
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
            {data?.expiredMembersList.map((member:any) => (
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
            Showing {members.length} members
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminMemberTable;
