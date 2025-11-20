// src/pages/Admin/StaffSignup.tsx
import { useState } from 'react';
import { Eye, EyeOff, Shield, Lock, Settings, Users, Phone, Mail, KeyRound, Briefcase } from 'lucide-react';
import { apiRequest } from '../../config/api';
import { setAccessToken as storeAccessToken } from '../../config/auth';
import { useNavigate } from 'react-router-dom';

// Separate data file content
const staffHubData = {
  branding: {
    name: "StaffHub",
    logo: "👨‍💼"
  },
  hero: {
    title: "Empower Your Team Management",
    description: "Create and manage staff accounts with comprehensive permission controls. Build a secure and efficient workforce management system.",
    features: [
      {
        icon: "shield",
        title: "Role-based access control",
        color: "tertiary-300"
      },
      {
        icon: "lock",
        title: "Secure authentication system",
        color: "tertiary-400"
      },
      {
        icon: "settings",
        title: "Granular permission settings",
        color: "secondary-100"
      }
    ]
  },
  form: {
    title: "Create Staff Account",
    subtitle: "Fill in the details to register a new staff member",
    fields: [
      {
        name: "fullName",
        label: "Full Name",
        type: "text",
        placeholder: "Enter full name",
        icon: "user",
        required: true
      },
      {
        name: "contactNumber",
        label: "Contact Number",
        type: "tel",
        placeholder: "Enter contact number",
        icon: "phone",
        required: true
      },
      {
        name: "email",
        label: "Email Address",
        type: "email",
        placeholder: "staff@company.com",
        icon: "mail",
        required: true
      },
      {
        name: "password",
        label: "Password",
        type: "password",
        placeholder: "Minimum 8 characters",
        icon: "key",
        required: true,
        helperText: "Must be at least 8 characters long"
      },
      {
        name: "role",
        label: "Role",
        type: "text",
        placeholder: "e.g., Manager, Developer, Support",
        icon: "briefcase",
        required: true
      }
    ],
    permissionLevels: [
      {
        value: "view",
        label: "View: Read-only access"
      },
      {
        value: "view-add",
        label: "View+Add: Read and create new entries"
      },
      {
        value: "view-add-update",
        label: "View+Add+Update: Read, create and modify"
      },
      {
        value: "all",
        label: "All: Full administrative access"
      }
    ]
  },
  stats: [
    {
      value: "500+",
      label: "Active Staff"
    },
    {
      value: "99.9%",
      label: "Uptime"
    },
    {
      value: "24/7",
      label: "Support"
    }
  ]
};

// Icon Component
const IconComponent = ({ name, className = "" }: { name: string; className?: string }) => {
  const icons: Record<string, any> = {
    shield: Shield,
    lock: Lock,
    settings: Settings,
    user: Users,
    phone: Phone,
    mail: Mail,
    key: KeyRound,
    briefcase: Briefcase
  };
  const Icon = icons[name] || Users;
  return <Icon className={className} />;
};

// Feature Card Component
const FeatureCard = ({ feature }: { feature: any }) => {
  return (
    <div className="flex items-center gap-3 mb-3">
      <div className={`w-8 h-8 rounded-lg bg-[var(--${feature.color})] bg-opacity-20 flex items-center justify-center flex-shrink-0`}>
        <IconComponent name={feature.icon} className={`w-4 h-4 text-[var(--${feature.color})]`} />
      </div>
      <span className="text-[var(--tertiary-500)] text-sm">{feature.title}</span>
    </div>
  );
};

// Input Field Component
const InputField = ({ field, value, onChange, showPassword, togglePassword }: any) => {
  const isPassword = field.type === 'password';
  
  return (
    <div className="mb-4">
      <label className="flex items-center gap-2 text-sm text-[var(--tertiary-500)] mb-2">
        <IconComponent name={field.icon} className="w-4 h-4" />
        {field.label}
      </label>
      <div className="relative">
        <input
          type={isPassword && showPassword ? 'text' : field.type}
          name={field.name}
          placeholder={field.placeholder}
          value={value || ''}
          onChange={onChange}
          required={field.required}
          className="w-full bg-[var(--primary-200)] text-white px-4 py-3 rounded-lg border border-[var(--primary-100)] focus:border-[var(--secondary-100)] focus:outline-none transition-colors placeholder:text-[var(--tertiary-500)] placeholder:opacity-60"
        />
        {isPassword && (
          <button
            type="button"
            onClick={togglePassword}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--tertiary-500)] hover:text-white transition-colors"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        )}
      </div>
      {field.helperText && (
        <p className="text-xs text-[var(--tertiary-500)] mt-1">{field.helperText}</p>
      )}
    </div>
  );
};

// Permission Select Component (fixed: include name so onChange works)
const PermissionSelect = ({ value, onChange, levels }: any) => {
  return (
    <div className="mb-6">
      <label className="flex items-center gap-2 text-sm text-[var(--tertiary-500)] mb-2">
        <Shield className="w-4 h-4" />
        Permission Level
      </label>
      <select
        name="permissionLevel"              // <-- important: name so generic onChange handler works
        value={value}
        onChange={onChange}
        className="w-full bg-[var(--primary-200)] text-white px-4 py-3 rounded-lg border border-[var(--primary-100)] focus:border-[var(--secondary-100)] focus:outline-none transition-colors appearance-none cursor-pointer"
      >
        <option value="">Select permission level</option>
        {levels.map((level: any) => (
          <option key={level.value} value={level.value}>
            {level.label}
          </option>
        ))}
      </select>
      
      <div className="mt-3 bg-[var(--primary-200)] rounded-lg p-4 border border-[var(--primary-100)]">
        <div className="flex items-start gap-2 mb-2">
          <div className="w-5 h-5 rounded-full bg-[var(--tertiary-400)] bg-opacity-20 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-[var(--tertiary-400)] text-xs">i</span>
          </div>
          <div className="flex-1">
            <p className="text-xs font-medium text-white mb-2">Permission Levels:</p>
            <ul className="space-y-1">
              {levels.map((level: any, index: number) => (
                <li key={index} className="text-xs text-[var(--tertiary-500)] flex items-start gap-2">
                  <span className="text-[var(--tertiary-300)] mt-0.5">•</span>
                  <span>{level.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ stat }: { stat: any }) => {
  return (
    <div className="text-center">
      <div className="text-3xl md:text-4xl font-bold text-white mb-1">{stat.value}</div>
      <div className="text-sm text-[var(--tertiary-500)]">{stat.label}</div>
    </div>
  );
};

// ---------- Helpers ----------
const EMAIL_RE = /^\S+@\S+\.\S+$/;
const CONTACT_RE = /^[0-9+\s\-()]{7,20}$/; // basic validation, adjust to your rules
const PASSWORD_MIN = 8;

/**
 * Try to decode JWT access token payload (no external deps).
 * Looks for common fields: userId, id, sub
 */
function getUserIdFromStoredToken(): string | null {
  const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const payload = parts[1];
    // base64url -> base64
    const b64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const json = JSON.parse(decodeURIComponent(atob(b64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join('')));
    return json.userId ?? json.id ?? json.sub ?? null;
  } catch (e) {
    return null;
  }
}

/**
 * Map frontend permission keys to backend enum strings
 */
function mapPermissionValue(frontendVal: string) {
  if (!frontendVal) return '';
  if (frontendVal === 'view-add') return 'view+add';
  if (frontendVal === 'view-add-update') return 'view+add+update';
  return frontendVal; // 'view' or 'all' already match
}

// Main Component
const StaffSignup = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<any>({
    fullName: '',
    contactNumber: '',
    email: '',
    password: '',
    role: '',
    permissionLevel: ''
  });
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: value
    }));
  };

  const validate = () => {
    if (!formData.fullName?.trim()) return "Full name is required";
    if (!formData.contactNumber?.trim()) return "Contact number is required";
    if (!CONTACT_RE.test(formData.contactNumber)) return "Contact number format is invalid";
    if (!formData.email?.trim()) return "Email is required";
    if (!EMAIL_RE.test(formData.email)) return "Email format is invalid";
    if (!formData.password) return "Password is required";
    if ((formData.password || '').length < PASSWORD_MIN) return `Password must be at least ${PASSWORD_MIN} characters`;
    if (!formData.role?.trim()) return "Role is required";
    if (!formData.permissionLevel) return "Permission level is required";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const err = validate();
    if (err) {
      setError(err);
      return;
    }

    // get userId from stored access token (admin who is creating staff)
    const userId = getUserIdFromStoredToken();
    if (!userId) {
      // not authenticated — redirect to login
      setError("Not authenticated. Please sign in as an admin and try again.");
      // small delay to show message, then redirect
      setTimeout(() => navigate('/login'), 900);
      return;
    }

    const payload = {
      name: formData.fullName.trim(),
      contact: formData.contactNumber.trim(),
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
      role: formData.role.trim(),
      permission: mapPermissionValue(formData.permissionLevel),
      userId
    };

    setLoading(true);
    try {
      const res = await apiRequest<{ accessToken?: string; staff?: any }>({
        method: "POST",
        endpoint: "/staff/signup",
        body: payload
      });

      // success: backend returns accessToken and staff
      if (res?.accessToken) {
        try {
          storeAccessToken(res.accessToken, true);
        } catch (e) {
          // ignore storage errors
        }
      }

      // redirect to staff list or show success
      alert('Staff account created successfully!');
      navigate('/staff');
    } catch (err: any) {
      // display user-friendly message
      const msg = err?.message || 'Failed to create staff';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      fullName: '',
      contactNumber: '',
      email: '',
      password: '',
      role: '',
      permissionLevel: ''
    });
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[var(--primary-100)] text-white">
      <div className="grid lg:grid-cols-2 min-h-screen">
        {/* Left Section - Hero */}
        <div className="flex flex-col justify-between p-8 lg:p-12 xl:p-16 bg-[var(--primary-200)]">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-12 lg:mb-0">
            <div className="w-10 h-10 bg-[var(--secondary-100)] rounded-lg flex items-center justify-center text-2xl">
              {staffHubData.branding.logo}
            </div>
            <span className="text-xl font-semibold">{staffHubData.branding.name}</span>
          </div>

          {/* Hero Content */}
          <div className="flex-1 flex flex-col justify-center max-w-xl">
            <h1 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
              {staffHubData.hero.title}
            </h1>
            <p className="text-[var(--tertiary-500)] text-lg mb-8 leading-relaxed">
              {staffHubData.hero.description}
            </p>

            {/* Features */}
            <div className="space-y-3 mb-12">
              {staffHubData.hero.features.map((feature, index) => (
                <FeatureCard key={index} feature={feature} />
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 pt-8 border-t border-[var(--primary-100)]">
            {staffHubData.stats.map((stat, index) => (
              <StatCard key={index} stat={stat} />
            ))}
          </div>
        </div>

        {/* Right Section - Form */}
        <div className="flex items-center justify-center p-8 lg:p-12 xl:p-16">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2">{staffHubData.form.title}</h2>
              <p className="text-[var(--tertiary-500)] text-sm">{staffHubData.form.subtitle}</p>
            </div>

            {error && (
              <div className="mb-4 text-sm text-red-400 bg-[rgba(255,255,255,0.03)] p-3 rounded">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-1" noValidate>
              {staffHubData.form.fields.map((field) => (
                <InputField
                  key={field.name}
                  field={field}
                  value={formData[field.name]}
                  onChange={handleInputChange}
                  showPassword={showPassword}
                  togglePassword={() => setShowPassword(!showPassword)}
                />
              ))}

              <PermissionSelect
                value={formData.permissionLevel}
                onChange={handleInputChange}
                levels={staffHubData.form.permissionLevels}
              />

              <div className="space-y-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[var(--secondary-100)] hover:bg-opacity-90 text-white font-semibold py-3 rounded-lg transition-all duration-200 transform hover:scale-[1.02]"
                >
                  {loading ? 'Creating…' : 'Create Staff Account'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="w-full bg-[var(--primary-200)] hover:bg-opacity-80 text-white font-semibold py-3 rounded-lg border border-[var(--primary-100)] transition-all duration-200"
                >
                  Cancel
                </button>
              </div>

              <div className="text-center pt-4">
                <span className="text-sm text-[var(--tertiary-500)]">
                  Already have an account?{' '}
                  <a href="#" className="text-[var(--secondary-100)] hover:underline font-medium">
                    Sign In
                  </a>
                </span>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffSignup;
