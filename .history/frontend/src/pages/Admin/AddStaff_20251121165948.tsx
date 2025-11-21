// src/pages/AddStaff.tsx
import React, { useState } from 'react';
import { Eye, EyeOff, Users, UserCheck, UserPlus, Shield, User, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../../config/api';

// ---------- Data (kept the same) ----------
export const staffData = {
  teamOverview: {
    totalStaff: 24,
    activeStaff: 22,
    newThisMonth: 3
  },
  permissionLevels: [
    {
      id: 'view-only',
      name: 'View Only',
      description: 'Can only view data',
      color: 'bg-gray-400'
    },
    {
      id: 'view-add',
      name: 'View + Add',
      description: 'Can view and add new records',
      color: 'bg-[var(--secondary-100)]'
    },
    {
      id: 'view-add-update',
      name: 'View + Add + Update',
      description: 'Can modify existing records',
      color: 'bg-[var(--tertiary-400)]'
    },
    {
      id: 'full-access',
      name: 'Full Access',
      description: 'Complete system access',
      color: 'bg-[var(--tertiary-300)]'
    }
  ],
  recentActivity: [
    {
      id: 1,
      name: 'Sarah Chen',
      action: 'joined',
      time: '2 hours ago',
      avatar: 'https://i.pravatar.cc/150?img=1'
    },
    {
      id: 2,
      name: 'Mike Johnson',
      action: 'updated',
      time: '1 day ago',
      avatar: 'https://i.pravatar.cc/150?img=2'
    },
    {
      id: 3,
      name: 'Emma Davis',
      action: 'added',
      time: '3 days ago',
      avatar: 'https://i.pravatar.cc/150?img=3'
    }
  ],
  jobRoles: [
    'Select role',
    'Administrator',
    'Manager',
    'Developer',
    'Designer',
    'Analyst',
    'Support Staff'
  ],
  permissions: [
    'Select permission',
    'View Only',
    'View + Add',
    'View + Add + Update',
    'Full Access'
  ]
};

// ---------- Types ----------
type FormData = {
  fullName: string;
  contactNumber: string;
  email: string;
  password: string;
  jobRole: string;
  permission: string;
};

// ---------- Helper mapping (UI permission -> backend enum) ----------
const permissionMap: Record<string, 'all' | 'view' | 'view+add' | 'view+add+update'> = {
  'Full Access': 'all',
  'View Only': 'view',
  'View + Add': 'view+add',
  'View + Add + Update': 'view+add+update'
};

// ---------- UI Subcomponents (typed) ----------
const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-[var(--primary-100)] rounded-lg shadow-sm ${className}`}>
    {children}
  </div>
);

const Input: React.FC<{
  label?: string;
  placeholder?: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  showPasswordToggle?: boolean;
  onTogglePassword?: () => void;
  showPassword?: boolean;
  helperText?: string;
}> = ({ label, placeholder, type = 'text', value, onChange, showPasswordToggle, onTogglePassword, showPassword, helperText }) => (
  <div className="flex flex-col gap-2 ">
    {label && (
      <label className="text-sm font-medium text-[var(--primary-300)]">
        {label}
      </label>
    )}
    <div className="relative">
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full px-4 py-3 bg-[var(--primary-100)] border border-gray-200 rounded-lg text-sm text-[var(--primary-300)] placeholder-[var(--primary-300)] focus:outline-none focus:ring-2 focus:ring-[var(--tertiary-400)] focus:border-transparent transition-all"
      />
      {showPasswordToggle && (
        <button
          type="button"
          onClick={onTogglePassword}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--primary-300)] hover:text-[var(--primary-100)] transition-colors"
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      )}
    </div>
    {helperText && (
      <span className="text-xs text-[var(--primary-300)]">{helperText}</span>
    )}
  </div>
);

const Select: React.FC<{
  label?: string;
  options: string[];
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}> = ({ label, options, value, onChange }) => (
  <div className="flex flex-col gap-2">
    {label && (
      <label className="text-sm font-medium text-[var(--primary-100)]">
        {label}
      </label>
    )}
    <select
      value={value}
      onChange={onChange}
      className="w-full px-4 py-3 bg-[var(--primary-100)] border border-gray-200 rounded-lg text-sm text-[var(--primary-300)] focus:outline-none focus:ring-2 focus:ring-[var(--tertiary-400)] focus:border-transparent transition-all appearance-none cursor-pointer"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23364659' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 1rem center'
      }}
    >
      {options.map((option, index) => (
        <option key={index} value={option}>
          {option}
        </option>
      ))}
    </select>
  </div>
);

const Button: React.FC<{
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  onClick?: () => void;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  disabled?: boolean;
}> = ({ children, variant = 'primary', onClick, icon: Icon, disabled }) => {
  const variants: Record<string, string> = {
    primary: 'bg-[var(--tertiary-400)] hover:bg-[var(--tertiary-400)]/60 text-white',
    secondary: 'bg-[var(--primary-100)] hover:bg-[var(--primary-200)] text-[var(--primary-300)] border border-gray-300'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-6 py-3 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 ${variants[variant]} ${disabled ? 'opacity-60 pointer-events-none' : ''}`}
    >
      {Icon && <Icon size={18} />}
      {children}
    </button>
  );
};

const StatsCard: React.FC<{ icon: React.ComponentType<any>; label: string; value: number | string; iconBg?: string; iconColor?: string; }> = ({ icon: Icon, label, value, iconBg = '', iconColor = '' }) => (
  <div className="flex items-center gap-3">
    <div className={`w-10 h-10 rounded-lg ${iconBg} flex items-center justify-center`}>
      <Icon size={20} className={iconColor} />
    </div>
    <div>
      <p className="text-xs text-[var(--primary-300)]">{label}</p>
      <p className="text-2xl font-bold text-[var(--primary-300)]">{value}</p>
    </div>
  </div>
);

const ActivityItem: React.FC<{ activity: any }> = ({ activity }) => (
  <div className="flex items-center gap-3">
    <img
      src={activity.avatar}
      alt={activity.name}
      className="w-10 h-10 rounded-full object-cover"
    />
    <div className="flex-1">
      <p className="text-sm font-medium text-[var(--primary-300)]">
        {activity.name} {activity.action}
      </p>
      <p className="text-xs text-[var(--primary-300)]">{activity.time}</p>
    </div>
  </div>
);

const PermissionItem: React.FC<{ permission: any }> = ({ permission }) => (
  <div className="flex items-start gap-3">
    <div className={`w-3 h-3 rounded-full ${permission.color} mt-1`}></div>
    <div className="flex-1">
      <p className="text-sm font-semibold text-[var(--primary-300)]">{permission.name}</p>
      <p className="text-xs text-[var(--primary-300)]">{permission.description}</p>
    </div>
  </div>
);

const SectionHeader: React.FC<{ icon: React.ComponentType<any>; title: string; iconBg?: string; iconColor?: string; }> = ({ icon: Icon, title, iconBg = '', iconColor = '' }) => (
  <div className="flex items-center gap-3 mb-6">
    <div className={`w-8 h-8 rounded-lg ${iconBg} flex items-center justify-center`}>
      <Icon size={18} className={iconColor} />
    </div>
    <h3 className="text-lg font-semibold text-[var(--primary-300)]">{title}</h3>
  </div>
);

// ---------- Main Component ----------
const AddStaff: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    contactNumber: '',
    email: '',
    password: '',
    jobRole: staffData.jobRoles[0],
    permission: staffData.permissions[0]
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleInputChange = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // read current logged-in user id from storage (localStorage first, then sessionStorage)
  const readCurrentUserId = (): string | null => {
    try {
      const idFromLS = localStorage.getItem('userId');
      if (idFromLS) return idFromLS;

      const idFromSession = sessionStorage.getItem('userId');
      if (idFromSession) return idFromSession;

      // fallback: try parse user object
      const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
      if (userStr) {
        try {
          const userObj = JSON.parse(userStr);
          // try common fields
          return userObj?.id ?? userObj?._id ?? null;
        } catch {
          // ignore parse errors
        }
      }
    } catch {
      // ignore storage errors
    }
    return null;
  };

  // Basic client-side validators (these mirror backend expectations but don't replace server validation)
  const isEmailValid = (email: string) => /^\S+@\S+\.\S+$/.test(email);
  const isContactValid = (contact: string) => {
    // allow digits, spaces, +, -, parentheses; require at least 7 digits total
    const digits = contact.replace(/\D/g, '');
    return digits.length >= 7;
  };

  const handleSubmit = async () => {
    setError(null);
    setSuccessMessage(null);

    // client-side validations
    if (!formData.fullName.trim()) {
      setError('Full name is required.');
      return;
    }
    if (!formData.contactNumber.trim()) {
      setError('Contact number is required.');
      return;
    }
    if (!isContactValid(formData.contactNumber.trim())) {
      setError('Please enter a valid contact number.');
      return;
    }
    if (!formData.email.trim()) {
      setError('Email address is required.');
      return;
    }
    if (!isEmailValid(formData.email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!formData.password) {
      setError('Password is required.');
      return;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (!formData.jobRole || formData.jobRole === staffData.jobRoles[0]) {
      setError('Please select a job role.');
      return;
    }
    if (!formData.permission || formData.permission === staffData.permissions[0]) {
      setError('Please select a permission level.');
      return;
    }

    const userId = readCurrentUserId();
    if (!userId) {
      setError('Cannot determine current user. Please login again.');
      return;
    }

    // map permission to backend enum
    const mappedPermission = permissionMap[formData.permission] ?? 'view';

    const payload = {
      name: formData.fullName.trim(),
      email: formData.email.trim().toLowerCase(),
      contact: formData.contactNumber.trim(),
      password: formData.password,
      role: formData.jobRole,
      permission: mappedPermission,
      userId
    };

    setLoading(true);
    try {
      // call backend endpoint
      const data = await apiRequest<{ accessToken?: string; staff?: any }>({
        method: 'POST',
        endpoint: '/staff/signup',
        body: payload
      });

      // Backend returns accessToken and staff object on success (201). We intentionally DO NOT overwrite currently stored admin tokens.
      // Show success and redirect to staff list.
      setSuccessMessage('Staff member created successfully.');
      // small delay to let user see success message before redirect (optional)
      setTimeout(() => {
        navigate('/staff');
      }, 700);
    } catch (err: any) {
      // show backend message if present
      const msg = err?.message || String(err) || 'Failed to create staff member.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setError(null);
    setSuccessMessage(null);
    setFormData({
      fullName: '',
      contactNumber: '',
      email: '',
      password: '',
      jobRole: staffData.jobRoles[0],
      permission: staffData.permissions[0]
    });
  };

  return (
    <div className="min-h-screen w-full bg-[var(--primary-200)]">
      {/* Header */}
      <header className="bg-[var(--primary-200)] text-white px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[var(--secondary-100)] rounded-lg flex items-center justify-center">
              <Users size={24} />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-[var(--primary-300)]">Staff Management</h1>
              <p className="text-sm text-[var(--primary-300)]">Add new team member</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center text-[var(--primary-300)] gap-2 text-sm hover:text-gray-300 transition-colors">
              <span className="hidden sm:inline">← Back to Staff List</span>
              <span className="sm:hidden">← Back</span>
            </button>
            <img
              src="https://i.pravatar.cc/150?img=5"
              alt="User"
              className="w-10 h-10 rounded-full object-cover border-2 border-[var(--tertiary-400)]"
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Form */}
          <div className="lg:col-span-2">
            <Card className="p-6 sm:p-8">
              {/* Form Header */}
              <div className="bg-[var(--primary-100)] text-[var(--primary-300)] border-b-1 border-b-[var(--primary-300)] -mx-6 sm:-mx-8 -mt-6 sm:-mt-8 px-6 sm:px-8 py-6 rounded-t-lg mb-8">
                <h2 className="text-xl font-bold mb-1">Add New Staff Member</h2>
                <p className="text-sm text-[var(--primary-300)]">Fill in the details to create a new staff account</p>
              </div>

              <div className="space-y-8">
                {/* Personal Information */}
                <div>
                  <SectionHeader
                    icon={User}
                    title="Personal Information"
                    iconBg="bg-blue-100"
                    iconColor="text-blue-600"
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Full Name"
                      placeholder="Enter full name"
                      value={formData.fullName}
                      onChange={handleInputChange('fullName')}
                    />
                    <Input
                      label="Contact Number"
                      placeholder="Enter phone number"
                      type="tel"
                      value={formData.contactNumber}
                      onChange={handleInputChange('contactNumber')}
                    />
                  </div>
                  <div className="mt-4">
                    <Input
                      label="Email Address"
                      placeholder="Enter email address"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange('email')}
                    />
                  </div>
                </div>

                {/* Security & Access */}
                <div>
                  <SectionHeader
                    icon={Lock}
                    title="Security & Access"
                    iconBg="bg-red-100"
                    iconColor="text-red-600"
                  />
                  <Input
                    label="Password"
                    placeholder="Enter secure password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleInputChange('password')}
                    showPasswordToggle
                    onTogglePassword={() => setShowPassword(!showPassword)}
                    showPassword={showPassword}
                    helperText="Minimum 8 characters required"
                  />
                </div>

                {/* Role & Permissions */}
                <div>
                  <SectionHeader
                    icon={Shield}
                    title="Role & Permissions"
                    iconBg="bg-green-100"
                    iconColor="text-green-600"
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select
                      label="Job Role"
                      options={staffData.jobRoles}
                      value={formData.jobRole}
                      onChange={handleInputChange('jobRole')}
                    />
                    <Select
                      label="Permission Level"
                      options={staffData.permissions}
                      value={formData.permission}
                      onChange={handleInputChange('permission')}
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button variant="secondary" onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button variant="primary" onClick={handleSubmit} icon={UserPlus} disabled={loading}>
                    {loading ? 'Creating…' : 'Add Staff Member'}
                  </Button>
                </div>

                {/* feedback */}
                {error && <div className="text-sm text-red-600 mt-2">{error}</div>}
                {successMessage && <div className="text-sm text-green-600 mt-2">{successMessage}</div>}
              </div>
            </Card>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Team Overview */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-[var(--primary-300)] mb-4">Team Overview</h3>
              <div className="space-y-4">
                <StatsCard
                  icon={Users}
                  label="Total Staff"
                  value={staffData.teamOverview.totalStaff}
                  iconBg="bg-blue-100"
                  iconColor="text-blue-600"
                />
                <StatsCard
                  icon={UserCheck}
                  label="Active"
                  value={staffData.teamOverview.activeStaff}
                  iconBg="bg-green-100"
                  iconColor="text-green-600"
                />
                <StatsCard
                  icon={UserPlus}
                  label="New This Month"
                  value={staffData.teamOverview.newThisMonth}
                  iconBg="bg-orange-100"
                  iconColor="text-orange-600"
                />
              </div>
            </Card>

            {/* Permission Levels */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-[var(--primary-300)] mb-4">Permission Levels</h3>
              <div className="space-y-4">
                {staffData.permissionLevels.map(permission => (
                  <PermissionItem key={permission.id} permission={permission} />
                ))}
              </div>
            </Card>

            {/* Recent Activity */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-[var(--primary-300)] mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {staffData.recentActivity.map(activity => (
                  <ActivityItem key={activity.id} activity={activity} />
                ))}
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AddStaff;
