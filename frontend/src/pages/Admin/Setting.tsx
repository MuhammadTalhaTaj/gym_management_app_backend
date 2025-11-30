// src/components/Setting.tsx
import React, { useEffect, useState } from 'react';
import { User, Mail, Phone, MapPin, Building2, Lock, Camera, Save, X, Eye, EyeOff, Check } from 'lucide-react';
import { apiRequest } from '../../config/api'; // keep using the unified API helper
import CustomAlert from '../../Components/CustomAlert'; // <-- CustomAlert (adjust path if your project uses different casing)

// types.ts - Type definitions
interface AdminProfile {
  name: string;
  email: string;
  contact: string;
  gymName: string;
  gymLocation: string;
}

interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface ValidationErrors {
  [key: string]: string;
}

/*
  NOTE: static example data removed from runtime (kept commented here for reference)
*/

// Helper to read userId (tries multiple locations)
function readUserId(): string | null {
  try {
    const ls = localStorage.getItem('userId');
    if (ls) return ls;
    const ss = sessionStorage.getItem('userId');
    if (ss) return ss;

    const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (userStr) {
      try {
        const userObj = JSON.parse(userStr);
        return userObj?.id ?? userObj?._id ?? null;
      } catch {
        // parse fail
      }
    }
  } catch {
    // storage error
  }
  return null;
}

// Input Component
interface InputFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  type?: string;
  placeholder?: string;
  icon: React.ReactNode;
  error?: string;
  disabled?: boolean;
  isTextarea?: boolean;
  rows?: number;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  name,
  value,
  onChange,
  type = 'text',
  placeholder,
  icon,
  error,
  disabled = false,
  isTextarea = false,
  rows = 3
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputType = type === 'password' && showPassword ? 'text' : type;

  const inputClasses = `w-full pl-12 pr-4 py-3 bg-[#364659] border-2 transition-all duration-300 rounded-lg
    ${error 
      ? 'border-[#F24949] focus:border-[#F24949]' 
      : 'border-[#8C9BB0] focus:border-[#EC9A0E]'
    }
    text-white placeholder-[#8C9BB0] focus:outline-none focus:ring-2 focus:ring-[#EC9A0E]/20
    disabled:opacity-50 disabled:cursor-not-allowed`;

  return (
    <div className="mb-6">
      <label htmlFor={name} className="block text-sm font-semibold text-[#94A3B8] mb-2">
        {label}
      </label>
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8C9BB0] z-10">
          {icon}
        </div>
        {isTextarea ? (
          <textarea
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            rows={rows}
            className={inputClasses}
          />
        ) : (
          <>
            <input
              id={name}
              name={name}
              type={inputType}
              value={value}
              onChange={onChange}
              placeholder={placeholder}
              disabled={disabled}
              className={inputClasses}
            />
            {type === 'password' && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8C9BB0] hover:text-[#EC9A0E] transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            )}
          </>
        )}
      </div>
      {error && (
        <p className="mt-2 text-sm text-[#F24949] flex items-center gap-2">
          <X size={16} />
          {error}
        </p>
      )}
    </div>
  );
};

// Profile Picture Component (kept in file for future use but NOT rendered)
const ProfilePicture: React.FC = () => {
  const [imageSrc, setImageSrc] = useState<string>('');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageSrc(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col items-center mb-8">
      <div className="relative group">
        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#EC9A0E] to-[#F47117] p-1 shadow-lg">
          <div className="w-full h-full rounded-full bg-[#1E293B] flex items-center justify-center overflow-hidden">
            {imageSrc ? (
              <img src={imageSrc} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User size={48} className="text-[#8C9BB0]" />
            )}
          </div>
        </div>
        <label htmlFor="profile-upload" className="absolute bottom-0 right-0 bg-[#EC9A0E] hover:bg-[#F47117] p-3 rounded-full cursor-pointer shadow-lg transition-all duration-300 hover:scale-110">
          <Camera size={18} className="text-white" />
          <input
            id="profile-upload"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
        </label>
      </div>
      <p className="mt-3 text-sm text-[#8C9BB0]">Click camera icon to update</p>
    </div>
  );
};

// Section Card Component
interface SectionCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

const SectionCard: React.FC<SectionCardProps> = ({ title, subtitle, children, icon }) => {
  return (
    <div className="bg-[#1E293B] rounded-xl shadow-xl p-6 md:p-8 border border-[#8C9BB0]/20">
      <div className="flex items-center gap-3 mb-6">
        {icon && (
          <div className="p-3 bg-[#EC9A0E]/10 rounded-lg text-[#EC9A0E]">
            {icon}
          </div>
        )}
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white">{title}</h2>
          {subtitle && <p className="text-sm text-[#8C9BB0] mt-1">{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  );
};

// Password Strength Indicator
interface PasswordStrengthProps {
  password: string;
}

const PasswordStrength: React.FC<PasswordStrengthProps> = ({ password }) => {
  const getStrength = (pwd: string): { strength: number; label: string; color: string } => {
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (pwd.length >= 12) strength++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++;
    if (/\d/.test(pwd)) strength++;
    if (/[^a-zA-Z0-9]/.test(pwd)) strength++;

    if (strength <= 2) return { strength, label: 'Weak', color: '#F24949' };
    if (strength <= 3) return { strength, label: 'Fair', color: '#F47117' };
    if (strength <= 4) return { strength, label: 'Good', color: '#EC9A0E' };
    return { strength, label: 'Strong', color: '#11BF7F' };
  };

  if (!password) return null;

  const { strength, label, color } = getStrength(password);

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs text-[#8C9BB0]">Password Strength</span>
        <span className="text-xs font-semibold" style={{ color }}>{label}</span>
      </div>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((level) => (
          <div
            key={level}
            className="h-1.5 flex-1 rounded-full transition-all duration-300"
            style={{
              backgroundColor: level <= strength ? color : '#8C9BB0'
            }}
          />
        ))}
      </div>
    </div>
  );
};

// Main Component
const Setting: React.FC = () => {
  // start with empty profile — no static fallback shown ever
  const [profile, setProfile] = useState<AdminProfile>({
    name: '',
    email: '',
    contact: '',
    gymName: '',
    gymLocation: ''
  });

  const [passwords, setPasswords] = useState<PasswordData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isProfileSubmitting, setIsProfileSubmitting] = useState(false);
  const [isPasswordSubmitting, setIsPasswordSubmitting] = useState(false);

  // central toast state using your CustomAlert
  const [toast, setToast] = useState<{ open: boolean; text: string; severity: 'success'|'error'|'warning'|'info' }>({
    open: false,
    text: '',
    severity: 'success'
  });

  const showToast = (text: string, severity: 'success'|'error'|'warning'|'info' = 'success') => {
    setToast({ open: true, text, severity });
  };
  const closeToast = () => setToast(prev => ({ ...prev, open: false }));

  // Initialize from real localStorage user if present (NOT static example)
  useEffect(() => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        setProfile(prev => ({
          name: user?.name ?? prev.name,
          email: user?.email ?? prev.email,
          contact: user?.contact ?? prev.contact,
          gymName: user?.gymName ?? prev.gymName,
          gymLocation: user?.gymLocation ?? prev.gymLocation
        }));
      }
    } catch (e) {
      // ignore parse errors; keep empty fields
    }
  }, []);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswords(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  /**
   * Validation helpers - used for UI feedback.
   */
  const validateProfile = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!profile.name.trim()) newErrors.name = 'Name is recommended';
    if (!profile.email.trim()) newErrors.email = 'Email is recommended';
    else if (!/\S+@\S+\.\S+/.test(profile.email)) newErrors.email = 'Invalid email format';
    if (!profile.contact.trim()) newErrors.contact = 'Contact is recommended';
    if (!profile.gymName.trim()) newErrors.gymName = 'Gym name is recommended';
    if (!profile.gymLocation.trim()) newErrors.gymLocation = 'Gym location is recommended';

    setErrors(prev => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const validatePasswords = (): boolean => {
    const newErrors: ValidationErrors = {};

    // For password update we require the current and new password fields
    if (!passwords.currentPassword) newErrors.currentPassword = 'Current password is required to change password';
    if (!passwords.newPassword) newErrors.newPassword = 'New password is required';
    else if (passwords.newPassword.length < 8) newErrors.newPassword = 'Password must be at least 8 characters';
    if (passwords.newPassword !== passwords.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(prev => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  // Submit profile -> calls /admin/updateAdmin
  const handleProfileSubmit = async () => {
    // validate for UI feedback (will not populate static example data)
    const valid = validateProfile();
    if (!valid) {
      showToast('Some fields need attention. Please check the highlighted items.', 'warning');
      return;
    }

    const userId = readUserId();
    if (!userId) {
      showToast('We could not find your account. Please sign in and try again.', 'error');
      return;
    }

    // backend expects Id field (capital I)
    const payload = {
      Id: userId,
      email: profile.email ?? '',
      contact: profile.contact ?? '',
      gymName: profile.gymName ?? '',
      gymLocation: profile.gymLocation ?? ''
    };

    setIsProfileSubmitting(true);
    try {
      const res = await apiRequest<{ message?: string; admin?: any }>({
        method: 'PATCH',
        endpoint: '/admin/updateAdmin',
        body: payload
      });

      // update only with backend-returned admin fields; if backend returns nothing, do not show static defaults
      if (res && (res as any).admin) {
        const admin = (res as any).admin;
        setProfile(prev => ({
          name: admin.name ?? prev.name,
          email: admin.email ?? prev.email,
          contact: admin.contact ?? prev.contact,
          gymName: admin.gymName ?? prev.gymName,
          gymLocation: admin.gymLocation ?? prev.gymLocation
        }));
      }

      // friendly success message for lay users
      showToast('Profile updated successfully.', 'success');
      if (res && (res as any).message) console.log('API:', (res as any).message);
    } catch (err: any) {
      console.error('Update admin failed:', err);
      // map common shapes to friendly text
      let msg = 'Unable to save changes. Please try again.';
      const lower = (err?.message || '').toString().toLowerCase();
      if (lower.includes('network') || lower.includes('failed to fetch')) {
        msg = 'Unable to save. Check your internet connection and try again.';
      } else if (err?.status === 400) {
        msg = 'Some details were invalid. Please check the form and try again.';
      } else if (err?.status === 401) {
        msg = 'You are not authorized to make this change. Please sign in again.';
      } else if (err?.status === 500) {
        msg = 'Server error while saving. Try again in a few minutes.';
      } else if (err?.message) {
        // prefer backend message when it is user-friendly
        msg = err.message;
      }

      showToast(msg, 'error');
    } finally {
      setIsProfileSubmitting(false);
    }
  };

  // Submit password -> calls /admin/updatePassword
  const handlePasswordSubmit = async () => {
    // run validations, block submit if missing/invalid
    const ok = validatePasswords();
    if (!ok) {
      showToast('Please fix the password fields highlighted above.', 'warning');
      return;
    }

    const userId = readUserId();
    if (!userId) {
      showToast('We could not find your account. Please sign in and try again.', 'error');
      return;
    }

    // backend expects Id, email and password
    const payload = {
      Id: userId,
      email: profile.email ?? '',
      password: passwords.newPassword
    };

    setIsPasswordSubmitting(true);
    try {
      const res = await apiRequest<{ message?: string; newPassword?: string; data?: any }>({
        method: 'PATCH',
        endpoint: '/admin/updatePassword',
        body: payload
      });

      // backend returns newPassword and data; do not display password but show success toast
      showToast('Password updated successfully.', 'success');

      // clear password fields
      setPasswords({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      if (res && (res as any).message) console.log('API:', (res as any).message);
    } catch (err: any) {
      console.error('Update password failed:', err);
      let msg = 'Unable to update password. Please try again.';
      const lower = (err?.message || '').toString().toLowerCase();
      if (lower.includes('network') || lower.includes('failed to fetch')) {
        msg = 'Unable to update password. Check your internet connection and try again.';
      } else if (err?.status === 400) {
        msg = 'Password change failed. Please check the information and try again.';
      } else if (err?.status === 401) {
        msg = 'Current password is incorrect.';
      } else if (err?.message) {
        msg = err.message;
      }
      showToast(msg, 'error');
    } finally {
      setIsPasswordSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#364659] via-[#1E293B] to-[#364659] py-8 px-4">
      <style>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>

      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Update Your Profile
          </h1>
          <p className="text-[#8C9BB0]">Manage your account information and settings</p>
        </div>

        <div className="space-y-6">
          {/* Personal Information */}
          <SectionCard 
            title="Personal Information" 
            subtitle="Update your personal details"
            icon={<User size={24} />}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="Full Name"
                name="name"
                value={profile.name}
                onChange={handleProfileChange}
                placeholder="Enter your full name"
                icon={<User size={20} />}
                error={errors.name}
              />
              <InputField
                label="Email Address"
                name="email"
                type="email"
                value={profile.email}
                onChange={handleProfileChange}
                placeholder="your.email@example.com"
                icon={<Mail size={20} />}
                error={errors.email}
              />
            </div>
            <InputField
              label="Contact Number"
              name="contact"
              type="tel"
              value={profile.contact}
              onChange={handleProfileChange}
              placeholder="+1 234 567 8900"
              icon={<Phone size={20} />}
              error={errors.contact}
            />
          </SectionCard>

          {/* Gym Information */}
          <SectionCard 
            title="Gym Information" 
            subtitle="Update your gym details"
            icon={<Building2 size={24} />}
          >
            <InputField
              label="Gym Name"
              name="gymName"
              value={profile.gymName}
              onChange={handleProfileChange}
              placeholder="Enter gym name"
              icon={<Building2 size={20} />}
              error={errors.gymName}
            />
            <InputField
              label="Gym Location"
              name="gymLocation"
              value={profile.gymLocation}
              onChange={handleProfileChange}
              placeholder="Enter full gym address"
              icon={<MapPin size={20} />}
              error={errors.gymLocation}
              isTextarea
              rows={3}
            />

            {/* Inline profile save (kept) */}
            <div className="flex justify-end mt-4">
              <button
                type="button"
                onClick={handleProfileSubmit}
                disabled={isProfileSubmitting}
                className="px-6 py-3 bg-gradient-to-r from-[#EC9A0E] to-[#F47117] text-white rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isProfileSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Save Profile
                  </>
                )}
              </button>
            </div>
          </SectionCard>

          {/* Password Section */}
          <SectionCard 
            title="Change Password" 
            subtitle="Update your account password"
            icon={<Lock size={24} />}
          >
            <InputField
              label="Current Password"
              name="currentPassword"
              type="password"
              value={passwords.currentPassword}
              onChange={handlePasswordChange}
              placeholder="Enter current password"
              icon={<Lock size={20} />}
              error={errors.currentPassword}
            />
            <InputField
              label="New Password"
              name="newPassword"
              type="password"
              value={passwords.newPassword}
              onChange={handlePasswordChange}
              placeholder="Enter new password (min 8 characters)"
              icon={<Lock size={20} />}
              error={errors.newPassword}
            />
            <PasswordStrength password={passwords.newPassword} />
            <InputField
              label="Confirm New Password"
              name="confirmPassword"
              type="password"
              value={passwords.confirmPassword}
              onChange={handlePasswordChange}
              placeholder="Re-enter new password"
              icon={<Lock size={20} />}
              error={errors.confirmPassword}
            />

            {/* Password-specific update button — styled like Save Changes (gradient) */}
            <div className="flex justify-end mt-4">
              <button
                type="button"
                onClick={handlePasswordSubmit}
                disabled={isPasswordSubmitting}
                className="px-6 py-3 bg-gradient-to-r from-[#EC9A0E] to-[#F47117] text-white rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPasswordSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Updating...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Update Password
                  </>
                )}
              </button>
            </div>
          </SectionCard>
        </div>

        {/* Central CustomAlert */}
        <CustomAlert
          text={toast.text}
          open={toast.open}
          onClose={closeToast}
          severity={toast.severity}
        />
      </div>
    </div>
  );
};

export default Setting;
