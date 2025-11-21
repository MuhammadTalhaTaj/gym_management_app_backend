import React, { useState } from 'react';
import { Search, Download, Filter, Eye, Edit, Trash2, UserPlus, Users, UserCheck, Building2 } from 'lucide-react';

// Mock data file simulation
const staffData = [
  {
    id: 1,
    name: 'Sarah Johnson',
    email: 'sarah.johnson@company.com',
    phone: '+1 (555) 123-4567',
    role: 'Project Manager',
    permissions: 'All',
    created: 'Jan 15, 2024',
    status: 'Active',
    avatar: 'https://i.pravatar.cc/150?img=1'
  },
  {
    id: 2,
    name: 'Michael Chen',
    email: 'michael.chen@company.com',
    phone: '+1 (555) 234-5678',
    role: 'Senior Developer',
    permissions: 'View + Add + Update',
    created: 'Dec 8, 2023',
    status: 'Active',
    avatar: 'https://i.pravatar.cc/150?img=2'
  },
  {
    id: 3,
    name: 'Emma Davis',
    email: 'emma.davis@company.com',
    phone: '+1 (555) 345-6789',
    role: 'UX Designer',
    permissions: 'View + Add',
    created: 'Feb 22, 2024',
    status: 'Active',
    avatar: 'https://i.pravatar.cc/150?img=3'
  },
  {
    id: 4,
    name: 'David Wilson',
    email: 'david.wilson@company.com',
    phone: '+1 (555) 456-7890',
    role: 'HR Manager',
    permissions: 'View',
    created: 'Nov 10, 2023',
    status: 'Inactive',
    avatar: 'https://i.pravatar.cc/150?img=4'
  }
];

const statsData = [
  { label: 'Total Staff', value: 24, icon: Users, color: 'bg-[#11BF7F]/10', iconColor: 'text-[#11BF7F]', borderColor: 'border-l-[#11BF7F]' },
  { label: 'Active Staff', value: 18, icon: UserCheck, color: 'bg-[#3D8BF2]/10', iconColor: 'text-[#3D8BF2]', borderColor: 'border-l-[#3D8BF2]' },
  { label: 'Departments', value: 6, icon: Building2, color: 'bg-[#EC9A0E]/10', iconColor: 'text-[#EC9A0E]', borderColor: 'border-l-[#EC9A0E]' },
  { label: 'New This Month', value: 3, icon: UserPlus, color: 'bg-[#F27117]/10', iconColor: 'text-[#F27117]', borderColor: 'border-l-[#F27117]' }
];

// Components
const StatCard = ({ stat }) => {
  const Icon = stat.icon;
  return (
    <div className={`bg-[var(--primary-100)] rounded-xl p-6 border-l-4 ${stat.borderColor} shadow-sm hover:shadow-md transition-shadow`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[#8C9BB0] text-sm font-medium mb-2">{stat.label}</p>
          <h3 className="text-[var(--primary-300)] text-4xl font-bold">{stat.value}</h3>
        </div>
        <div className={`${stat.color} ${stat.iconColor} p-3 rounded-lg`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};

const SearchBar = ({ value, onChange }) => (
  <div className="relative flex-1 max-w-md">
    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--secondary-100)]" />
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Search staff by name, email, or role..."
      className="w-full pl-12 pr-4 py-3 rounded-lg border border-[#8C9BB0]/30 focus:outline-none focus:ring-2 focus:ring-[#3D8BF2] focus:border-transparent text-[var(--primary-300)] placeholder:text-[var(--primary-300)]"
    />
  </div>
);

const FilterButton = ({ children, onClick }) => (
  <button
    onClick={onClick}
    className="px-5 py-3 rounded-lg border border-[#8C9BB0]/30 text-[#1E293B] font-medium hover:bg-[#F8FAFC] transition-colors flex items-center gap-2"
  >
    {children}
  </button>
);

const ActionButton = ({ icon: Icon, onClick, variant = 'default' }) => {
  const colors = {
    view: 'text-[#3D8BF2] hover:bg-[#3D8BF2]/10',
    edit: 'text-[#EC9A0E] hover:bg-[#EC9A0E]/10',
    delete: 'text-[#F24949] hover:bg-[#F24949]/10'
  };
  
  return (
    <button
      onClick={onClick}
      className={`p-2 rounded-lg transition-colors ${colors[variant]}`}
    >
      <Icon className="w-4 h-4" />
    </button>
  );
};

const StatusBadge = ({ status }) => {
  const isActive = status === 'Active';
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
      isActive 
        ? 'bg-[#11BF7F]/10 text-[#11BF7F]' 
        : 'bg-[#EC9A0E]/10 text-[#EC9A0E]'
    }`}>
      {status}
    </span>
  );
};

const RoleBadge = ({ role }) => {
  const colors = {
    'Project Manager': 'bg-[#3D8BF2]/10 text-[#3D8BF2]',
    'Senior Developer': 'bg-[#11BF7F]/10 text-[#11BF7F]',
    'UX Designer': 'bg-[#F27117]/10 text-[#F27117]',
    'HR Manager': 'bg-[#8C9BB0]/10 text-[#8C9BB0]'
  };
  
  return (
    <span className={`px-3 py-1 rounded-md text-xs font-semibold ${colors[role] || 'bg-gray-100 text-gray-700'}`}>
      {role}
    </span>
  );
};

const PermissionBadge = ({ permissions }) => {
  const getColor = () => {
    if (permissions === 'All') return 'text-[#11BF7F]';
    if (permissions.includes('Update')) return 'text-[#EC9A0E]';
    if (permissions.includes('Add')) return 'text-[#8C9BB0]';
    return 'text-[#8C9BB0]';
  };
  
  return (
    <span className={`text-sm font-medium ${getColor()}`}>
      {permissions}
    </span>
  );
};

const StaffTable = ({ data, onView, onEdit, onDelete }) => (
  <div className="overflow-x-auto">
    <table className="w-full">
      <thead>
        <tr className="border-b border-[#8C9BB0]/20">
          <th className="text-left py-4 px-4 text-xs font-semibold text-[var(--primary-300)] uppercase tracking-wider">Staff Member</th>
          <th className="text-left py-4 px-4 text-xs font-semibold text-[var(--primary-300)] uppercase tracking-wider">Contact</th>
          <th className="text-left py-4 px-4 text-xs font-semibold text-[var(--primary-300)] uppercase tracking-wider">Role</th>
          <th className="text-left py-4 px-4 text-xs font-semibold text-[var(--primary-300)] uppercase tracking-wider">Permissions</th>
          <th className="text-left py-4 px-4 text-xs font-semibold text-[var(--primary-300)] uppercase tracking-wider">Created</th>
          <th className="text-left py-4 px-4 text-xs font-semibold text-[var(--primary-300)] uppercase tracking-wider">Status</th>
          <th className="text-left py-4 px-4 text-xs font-semibold text-[var(--primary-300)]uppercase tracking-wider">Actions</th>
        </tr>
      </thead>
      <tbody>
        {data.map((staff) => (
          <tr key={staff.id} className="border-b border-[#8C9BB0]/10 hover:bg-[#F8FAFC] transition-colors">
            <td className="py-4 px-4">
              <div className="flex items-center gap-3">
                <img src={staff.avatar} alt={staff.name} className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <p className="font-semibold text-[#1E293B]">{staff.name}</p>
                  <p className="text-sm text-[#8C9BB0]">{staff.email}</p>
                </div>
              </div>
            </td>
            <td className="py-4 px-4 text-[#1E293B]">{staff.phone}</td>
            <td className="py-4 px-4">
              <RoleBadge role={staff.role} />
            </td>
            <td className="py-4 px-4">
              <PermissionBadge permissions={staff.permissions} />
            </td>
            <td className="py-4 px-4 text-[#1E293B]">{staff.created}</td>
            <td className="py-4 px-4">
              <StatusBadge status={staff.status} />
            </td>
            <td className="py-4 px-4">
              <div className="flex items-center gap-1">
                <ActionButton icon={Eye} onClick={() => onView(staff.id)} variant="view" />
                <ActionButton icon={Edit} onClick={() => onEdit(staff.id)} variant="edit" />
                <ActionButton icon={Trash2} onClick={() => onDelete(staff.id)} variant="delete" />
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const Pagination = ({ currentPage, totalPages, onPageChange }) => (
  <div className="flex items-center justify-between mt-6">
    <p className="text-sm text-[#8C9BB0]">
      Showing 1 to 4 of {staffData.length} results
    </p>
    <div className="flex gap-2">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-4 py-2 rounded-lg border border-[#8C9BB0]/30 text-[#1E293B] font-medium hover:bg-[#F8FAFC] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Previous
      </button>
      {[...Array(totalPages)].map((_, i) => (
        <button
          key={i + 1}
          onClick={() => onPageChange(i + 1)}
          className={`w-10 h-10 rounded-lg font-medium transition-colors ${
            currentPage === i + 1
              ? 'bg-[#3D8BF2] text-white'
              : 'border border-[#8C9BB0]/30 text-[#1E293B] hover:bg-[#F8FAFC]'
          }`}
        >
          {i + 1}
        </button>
      ))}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-4 py-2 rounded-lg border border-[#8C9BB0]/30 text-[#1E293B] font-medium hover:bg-[#F8FAFC] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Next
      </button>
    </div>
  </div>
);

// Main Component
const Staff = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRole, setSelectedRole] = useState('All Roles');
  const [selectedPermission, setSelectedPermission] = useState('All Permissions');

  const filteredData = staffData.filter(staff => 
    staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staff.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staff.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleView = (id) => console.log('View staff:', id);
  const handleEdit = (id) => console.log('Edit staff:', id);
  const handleDelete = (id) => console.log('Delete staff:', id);

  return (
    <div className="min-h-screen bg-[var(--primary-200)]">
      {/* Header */}
      <header className="bg-[var(--primary-200)] shadow-md">
        <div className="max-w-[1600px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-[var(--secondary-100)] p-3 rounded-xl">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-white text-2xl font-bold">Staff Management</h1>
          </div>
          <div className="flex items-center gap-4">
            <button className="bg-[#11BF7F] hover:bg-[#11BF7F]/90 text-white px-6 py-2.5 rounded-lg font-semibold flex items-center gap-2 transition-colors shadow-lg">
              <UserPlus className="w-5 h-5" />
              Add Staff
            </button>
            <button className="bg-[#1E293B] hover:bg-[#1E293B]/90 text-white w-11 h-11 rounded-lg flex items-center justify-center transition-colors">
              <Users className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1600px] mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsData.map((stat, index) => (
            <StatCard key={index} stat={stat} />
          ))}
        </div>

        {/* Filters Section */}
        <div className="bg-[var(--primary-100)] rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            <SearchBar value={searchTerm} onChange={setSearchTerm} />
            <div className="flex flex-wrap gap-3">
              <FilterButton>
                {selectedRole}
                <span className="text-[#8C9BB0]">▼</span>
              </FilterButton>
              <FilterButton>
                {selectedPermission}
                <span className="text-[#8C9BB0]">▼</span>
              </FilterButton>
              <button className="px-5 py-3 rounded-lg bg-[#1E293B] text-white font-medium hover:bg-[#1E293B]/90 transition-colors flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filter
              </button>
              <button className="px-5 py-3 rounded-lg border border-[#8C9BB0]/30 text-[#1E293B] font-medium hover:bg-[#F8FAFC] transition-colors flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Staff Table */}
        <div className="bg-[var(--primary-100)] rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-[#8C9BB0]/20">
            <h2 className="text-xl font-bold text-[var(--primary-300)]">Staff Members</h2>
            <p className="text-[var(--primary-300)] text-sm mt-1">Manage your team members and their permissions</p>
          </div>
          
          <StaffTable 
            data={filteredData}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
          
          <div className="p-6 border-t border-[#8C9BB0]/20">
            <Pagination 
              currentPage={currentPage}
              totalPages={3}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Staff;