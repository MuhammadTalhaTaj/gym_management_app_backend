// src/pages/Login.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dumbbell, TrendingUp, Users, CreditCard, Calendar, BarChart3, Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { loginRequest } from '../../services/auth';
import CustomAlert from '../../Components/CustomAlert'; // <-- added

// ============= DATA FILE =============
const loginData = {
  branding: {
    title: "Gym Management System",
    subtitle: "Admin Login Portal"
  },
  welcomeSection: {
    heading: "Welcome Back",
    description: "Sign in to access your dashboard"
  },
  features: [
    {
      id: 1,
      icon: "Users",
      title: "Member Management",
      color: "tertiary-300"
    },
    {
      id: 2,
      icon: "CreditCard",
      title: "Payment Tracking",
      color: "tertiary-400"
    },
    // {
    //   id: 3,
    //   icon: "Calendar",
    //   title: "Class Scheduling",
    //   color: "secondary-100"
    // },
    {
      id: 4,
      icon: "BarChart3",
      title: "Analytics & Reports",
      color: "tertiary-200"
    }
  ],
  testimonial: {
    quote: "This system has transformed how we manage our gym. Everything is organized and efficient!",
    author: {
      name: "Mike Johnson",
      role: "Gym Owner",
      avatar: "MJ"
    }
  },
  rightSide: {
    title: "Manage Your Gym",
    description: "Streamline operations, track members, and grow your fitness business with our comprehensive management system."
  }
};

// ============= ICON MAPPER =============
const IconMapper = ({ iconName, className }: { iconName: string, className?: string }) => {
  const icons: Record<string, any> = {
    Users: Users,
    CreditCard: CreditCard,
    Calendar: Calendar,
    BarChart3: BarChart3,
    TrendingUp: TrendingUp,
    Dumbbell: Dumbbell
  };
  const IconComponent = icons[iconName] || Users;
  return <IconComponent className={className} />;
};

// ============= LOGO COMPONENT =============
const Logo = ({ title, subtitle }: { title: string, subtitle: string }) => (
  <div className="text-center mb-8">
    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--secondary-100)] mb-4">
      <Dumbbell className="w-8 h-8 text-white" />
    </div>
    <h1 className="text-2xl font-bold text-[var(--primary-200)] mb-1">
      {title}
    </h1>
    <p className="text-[var(--primary-300)] text-sm">
      {subtitle}
    </p>
  </div>
);

// ============= INPUT FIELD COMPONENT =============
const InputField = ({ label, type, placeholder, icon: Icon, value, onChange }: any) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputType = type === 'password' && showPassword ? 'text' : type;

  return (
    <div className="mb-4">
      <label className="flex items-center text-sm font-medium text-[var(--primary-200)] mb-2">
        {Icon && <Icon className="w-4 h-4 mr-2" />}
        {label}
      </label>
      <div className="relative">
        <input
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[var(--tertiary-400)] focus:border-transparent text-[var(--primary-200)] placeholder-[var(--primary-300)]"
        />
        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--primary-300)] hover:text-[var(--primary-200)]"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        )}
      </div>
    </div>
  );
};

// ============= FEATURE ITEM COMPONENT =============
const FeatureItem = ({ icon, title }: any) => (
  <div className="flex items-center space-x-3 mb-4">
    <div className={`w-10 h-10 rounded-full bg-[var(--primary-300})] flex items-center justify-center flex-shrink-0`}>
      <IconMapper iconName={icon} className="w-5 h-5 text-white" />
    </div>
    <span className="text-white/90 font-medium">{title}</span>
  </div>
);

// ============= TESTIMONIAL COMPONENT =============
const Testimonial = ({ quote, author }: any) => (
  <div className="mt-8 p-6 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
    <p className="text-white/70 italic text-sm mb-4">"{quote}"</p>
    <div className="flex items-center space-x-3">
      <div className="w-10 h-10 rounded-full bg-[var(--tertiary-400)] flex items-center justify-center text-white font-bold">
        {author.avatar}
      </div>
      <div>
        <p className="text-white font-semibold text-sm">{author.name}</p>
        <p className="text-white/60 text-xs">{author.role}</p>
      </div>
    </div>
  </div>
);

// ============= LEFT PANEL - LOGIN FORM =============
const LoginForm = ({ data }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // new: role selection
  const [role, setRole] = useState<'Admin' | 'Staff'>('Admin');

  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  // CustomAlert (toast) state
  const [toastOpen, setToastOpen] = useState(false);
  const [toastText, setToastText] = useState('');
  const [toastSeverity, setToastSeverity] = useState<'success' | 'error' | 'warning' | 'info'>('success');

  const navigate = useNavigate();

  const showToast = (text: string, severity: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    setToastText(text);
    setToastSeverity(severity);
    setToastOpen(true);
  };

  const handleToastClose = () => {
    setToastOpen(false);
  };

  const handleSubmit = async () => {
    // friendly client-side validation
    if (!email?.trim() || !password) {
      showToast('Please enter both your email and password so we can sign you in.', 'warning');
      return;
    }

    setLoading(true);

    try {
      await loginRequest({ email: email.trim(), password, role });
      // success: show friendly success toast then navigate
      showToast('Welcome back! Taking you to your dashboard...', 'success');

      // small delay so user sees the toast (keeps UI same otherwise)
      setTimeout(() => {
        navigate('/dashboard');
      }, 700);
    } catch (err: any) {
      // produce normal-user-friendly messages
      // many backends return status on the thrown object; try common shapes
      const status = err?.status ?? err?.response?.status ?? null;
      const msg = (err?.message || '').toString().toLowerCase();

      if (status === 400) {
        showToast('That email or password doesn’t look right. Please try again.', 'error');
      } else if (status === 401) {
        showToast('You are not authorized to sign in. If this is a mistake, contact the admin.', 'error');
      } else if (status >= 500) {
        showToast('Our server is having trouble. Please try again in a little while.', 'error');
      } else if (msg.includes('failed to fetch') || msg.includes('network')) {
        showToast('Cannot reach the server. Check your internet connection and try again.', 'error');
      } else {
        // generic friendly fallback
        showToast('Sign in failed. Please double-check your details and try again.', 'error');
      }

      // also log for developers
      // eslint-disable-next-line no-console
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full lg:w-1/2 bg-white p-8 lg:p-12 flex items-center justify-center">
      <div className="w-full max-w-md">
        <Logo title={data.branding.title} subtitle={data.branding.subtitle} />

        <div className="mb-8">
          <h2 className="text-3xl font-bold text-[var(--primary-200)] mb-2">
            {data.welcomeSection.heading}
          </h2>
          <p className="text-[var(--primary-300)]">
            {data.welcomeSection.description}
          </p>
        </div>

        <div>
          <InputField
            label="Email Address"
            type="email"
            placeholder="Enter your email address"
            icon={Mail}
            value={email}
            onChange={(e: any) => setEmail(e.target.value)}
          />

          <InputField
            label="Password"
            type="password"
            placeholder="Enter your password"
            icon={Lock}
            value={password}
            onChange={(e: any) => setPassword(e.target.value)}
          />

          {/* NEW: Role radio buttons (Admin / Staff) */}
          <div className="mb-4">
            <label className="flex items-center text-sm font-medium text-[var(--primary-200)] mb-2">
              Role
            </label>
            <div className="flex items-center space-x-4">
              <label className="flex items-center cursor-pointer text-[var(--primary-300)]">
                <input
                  type="radio"
                  name="role"
                  value="Admin"
                  checked={role === 'Admin'}
                  onChange={() => setRole('Admin')}
                  className="w-4 h-4 text-[var(--tertiary-400)] border-gray-300 rounded focus:ring-[var(--tertiary-400)]"
                />
                <span className="ml-2 text-sm">Admin</span>
              </label>

              <label className="flex items-center cursor-pointer text-[var(--primary-300)]">
                <input
                  type="radio"
                  name="role"
                  value="Staff"
                  checked={role === 'Staff'}
                  onChange={() => setRole('Staff')}
                  className="w-4 h-4 text-[var(--tertiary-400)] border-gray-300 rounded focus:ring-[var(--tertiary-400)]"
                />
                <span className="ml-2 text-sm">Staff</span>
              </label>
            </div>
          </div>
          {/* END role radios */}

          <div className="flex items-center justify-between mb-6">
            {/* <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-[var(--tertiary-400)] border-gray-300 rounded focus:ring-[var(--tertiary-400)]"
              />
              <span className="ml-2 text-sm text-[var(--primary-300)]">Remember me</span>
            </label> */}
            <button
            onClick={()=>{navigate('/ForgetPassword')}}
            className="text-sm text-[var(--tertiary-400)] hover:underline">
              Forgot password?
            </button>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-[var(--tertiary-400)] text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity mb-6 flex items-center justify-center"
          >
            <span className="mr-2">{loading ? 'Signing in...' : '→'}</span>
            {loading ? 'Please wait' : 'Sign In'}
          </button>

          {/* Replaced the raw error area with CustomAlert (toast) - no UI layout changes */}
          <p className="text-center text-sm text-[var(--primary-300)]">
            Don't have an account?{' '}
            <button className="text-[var(--tertiary-400)] hover:underline font-semibold"
              onClick={() => { navigate('/signup') }}>
              Sign up here
            </button>
          </p>
        </div>
      </div>

      {/* CustomAlert: shows both success and error messages in plain language */}
      <CustomAlert
        text={toastText}
        open={toastOpen}
        onClose={handleToastClose}
        severity={toastSeverity}
      />
    </div>
  );
};

// ============= RIGHT PANEL - INFO SECTION =============
const InfoPanel = ({ data }: any) => (
  <div className="hidden lg:flex w-1/2 bg-[var(--primary-200)] relative overflow-hidden">
    {/* Background overlay */}
    <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary-200)] to-[var(--primary-100)] opacity-95"></div>

    {/* Decorative elements */}
    <div className="absolute top-20 right-20 w-64 h-64 bg-[var(--secondary-100)] rounded-full opacity-10 blur-3xl"></div>
    <div className="absolute bottom-20 left-20 w-96 h-96 bg-[var(--tertiary-400)] rounded-full opacity-10 blur-3xl"></div>

    <div className="relative z-10 p-12 flex flex-col justify-center w-full max-w-xl mx-auto">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--secondary-100)] mb-6">
        <TrendingUp className="w-8 h-8 text-white" />
      </div>

      <h2 className="text-4xl font-bold text-white mb-4">
        {data.rightSide.title}
      </h2>

      <p className="text-white/70 mb-8 leading-relaxed">
        {data.rightSide.description}
      </p>

      <div className="space-y-4 mb-8">
        {data.features.map((feature: any) => (
          <FeatureItem
            key={feature.id}
            icon={feature.icon}
            title={feature.title}
            color={feature.color}
          />
        ))}
      </div>

      <Testimonial
        quote={data.testimonial.quote}
        author={data.testimonial.author}
      />
    </div>
  </div>
);

// ============= MAIN APP COMPONENT =============
export default function Login() {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gray-50">
      <LoginForm data={loginData} />
      <InfoPanel data={loginData} />
    </div>
  );
}
