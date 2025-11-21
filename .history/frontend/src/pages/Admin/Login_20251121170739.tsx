// src/pages/Login.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dumbbell, TrendingUp, Users, CreditCard, Calendar, BarChart3, Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { loginRequest } from '../../services/auth';

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
    {
      id: 3,
      icon: "Calendar",
      title: "Class Scheduling",
      color: "secondary-100"
    },
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
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);

    try {
      await loginRequest({ email, password, role }, rememberMe);
      // res has { accessToken, refreshToken, user }
      // navigate to dashboard
      navigate('/dashboard');
    } catch (err: any) {
      // preserve message from backend when available
      setError(err?.message || 'Login failed. Please check your credentials.');
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
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-[var(--tertiary-400)] border-gray-300 rounded focus:ring-[var(--tertiary-400)]"
              />
              <span className="ml-2 text-sm text-[var(--primary-300)]">Remember me</span>
            </label>
            <button className="text-sm text-[var(--tertiary-400)] hover:underline">
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

          {error && (
            <div className="mb-4 text-sm text-red-600">
              {error}
            </div>
          )}

          <p className="text-center text-sm text-[var(--primary-300)]">
            Don't have an account?{' '}
            <button className="text-[var(--tertiary-400)] hover:underline font-semibold">
              Sign up here
            </button>
          </p>
        </div>
      </div>
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
