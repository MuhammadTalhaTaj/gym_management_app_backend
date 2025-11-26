// src/components/Setting.tsx
import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Building2, Lock, Camera, Save, X, Eye, EyeOff, Check } from 'lucide-react';
import { apiRequest } from '../../config/api'; // keep using the unified API helper

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

// profileData.ts - Initial data
const initialProfileData: AdminProfile = {
  name: 'John Doe',
  email: 'john.doe@gymadmin.com',
  contact: '+1 234 567 8900',
  gymName: 'FitZone Elite',
  gymLocation: '123 Fitness Street, New York, NY 10001'
};

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

// Profile Picture Component
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

// Success Toast
interface ToastProps {
  message: string;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, onClose }) => {
  React.useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div className="bg-[#11BF7F] text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3">
        <div className="bg-white/20 p-1 rounded-full">
          <Check size={20} />
        </div>
        <span className="font-medium">{message}</span>
        <button onClick={onClose} className="ml-4 hover:bg-white/20 p-1 rounded transition-colors">
          <X size={18} />
        </button>
      </div>
    </div>
  );
};

// Main Component
const Setting: React.FC = () => {
  const [profile, setProfile] = useState<AdminProfile>(initialProfileData);
  const [passwords, setPasswords] = useState<PasswordData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [showToast, setShowToast] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
   * Validation helpers - they set error messages but DO NOT stop submission.
   * This ensures the PATCH request is still sent even when some fields are empty.
   */
  const validateProfile = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!profile.name.trim()) newErrors.name = 'Name is recommended';
    if (!profile.email.trim()) newErrors.email = 'Email is recommended';
    else if (!/\S+@\S+\.\S+/.test(profile.email)) newErrors.email = 'Invalid email format';
    if (!profile.contact.trim()) newErrors.contact = 'Contact is recommended';
    if (!profile.gymName.trim()) newErrors.gymName = 'Gym name is recommended';
    if (!profile.gymLocation.trim()) newErrors.gymLocation = 'Gym location is recommended';

    // set errors for UI feedback but DO NOT block submission
    setErrors(prev => ({ ...prev, ...newErrors }));
    return true; // always allow submit to proceed
  };

  const validatePasswords = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (passwords.newPassword || passwords.confirmPassword || passwords.currentPassword) {
      if (!passwords.currentPassword) newErrors.currentPassword = 'Current password is required to change password';
      if (!passwords.newPassword) newErrors.newPassword = 'New password is required';
      else if (passwords.newPassword.length < 8) newErrors.newPassword = 'Password must be at least 8 characters';
      if (passwords.newPassword !== passwords.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    // set password-related errors but do not block submit
    setErrors(prev => ({ ...prev, ...newErrors }));
    return true; // always allow submit to proceed
  };

  const handleSubmit = async () => {
    // Run validations for user feedback (but they won't block submission)
    validateProfile();
    validatePasswords();

    setIsSubmitting(true);

    try {
      // Build payload with all profile fields present (could be empty strings)
      const payload: Record<string, any> = {
        name: profile.name ?? '',
        email: profile.email ?? '',
        contact: profile.contact ?? '',
        gymName: profile.gymName ?? '',
        gymLocation: profile.gymLocation ?? '',
        // permission is required by backend; prefer localStorage value and fallback to 'all'
        permission: localStorage.getItem('permission') || 'all'
      };

      // include password only when user provided a new password
      if (passwords.newPassword) {
        payload.password = passwords.newPassword;
      }

      // include identifiers when present in localStorage (staffId or userId or both)
      const staffId = localStorage.getItem('staffId');
      const userId = localStorage.getItem('userId');

      if (staffId) payload.staffId = staffId;
      if (userId) payload.userId = userId;

      // Always call the same PATCH endpoint as requested
      const res = await apiRequest<{ message?: string; staff?: any }>({
        method: 'PATCH',
        endpoint: '/staff/updateStaff',
        body: payload
      });

      // Sync returned fields into local state if available
      if (res && res.staff) {
        setProfile(prev => ({
          ...prev,
          name: res.staff.name ?? prev.name,
          email: res.staff.email ?? prev.email,
          contact: res.staff.contact ?? prev.contact,
          // keep gym fields as they might not be returned; guard with existing values
          gymName: (res.staff.gymName as string) ?? prev.gymName,
          gymLocation: (res.staff.gymLocation as string) ?? prev.gymLocation
        }));
      }

      setIsSubmitting(false);
      setShowToast(true);

      // Clear password fields after successful update
      setPasswords({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      if (res && res.message) console.log('API:', res.message);
    } catch (err: any) {
      console.error('Update failed:', err);
      setIsSubmitting(false);
      // simple user-visible feedback (keeps UI intact)
      alert(err?.message || 'Failed to update profile. Please try again.');
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
          {/* Profile Picture Section */}
          <SectionCard title="Profile Picture" subtitle="Upload your profile photo">
            <ProfilePicture />
          </SectionCard>

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
          </SectionCard>

          {/* Submit Button */}
          <div className="flex flex-col sm:flex-row gap-4 justify-end">
            <button
              type="button"
              className="px-8 py-4 bg-[#8C9BB0]/20 text-[#94A3B8] rounded-lg font-semibold hover:bg-[#8C9BB0]/30 transition-all duration-300 border border-[#8C9BB0]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-8 py-4 bg-gradient-to-r from-[#EC9A0E] to-[#F47117] text-white rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Saving Changes...
                </>
              ) : (
                <>
                  <Save size={20} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>

        {showToast && (
          <Toast message="Profile updated successfully!" onClose={() => setShowToast(false)} />
        )}
      </div>
    </div>
  );
};

export default Setting;
