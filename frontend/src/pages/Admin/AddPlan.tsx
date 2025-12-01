// src/pages/AddPlan.tsx
import React, { useState } from 'react';
import { apiRequest } from '../../config/api'; // API helper
import CustomAlert from '../../Components/CustomAlert'; 

// Data file - formConfig.js
const formConfig = {
  planName: { label: 'Plan Name', placeholder: 'e.g., Basic Plan, Premium Plan', required: true },
  durationType: {
    label: 'Duration Type',
    placeholder: 'Select duration type',
    required: true,
    options: [
      { value: '', label: 'Select duration type' },
      { value: 'days', label: 'Days' },
      { value: 'weeks', label: 'Weeks' },
      { value: 'months', label: 'Months' },
      { value: 'years', label: 'Years' }
    ]
  },
  duration: { label: 'Duration', placeholder: 'e.g., 1, 3, 6, 12', required: true },
  amount: { label: 'Amount', placeholder: '0.00', required: true }
};

// Breadcrumb Component
const Breadcrumb = ({ items }: { items: string[] }) => {
  return (
    <nav className="flex items-center space-x-2 text-sm mb-6">
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <svg className="w-4 h-4 text-[var(--tertiary-500)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          )}
          <span className={index === items.length - 1 ? 'text-white' : 'text-[var(--tertiary-500)]'}>
            {item}
          </span>
        </React.Fragment>
      ))}
    </nav>
  );
};

// Card Component
const Card = ({ children, className = '' }: any) => (
  <div className={`bg-[var(--primary-100)] rounded-lg p-6 md:p-8 ${className}`}>{children}</div>
);

// Section Header Component
const SectionHeader = ({ icon, title, subtitle }: any) => (
  <div className="flex items-start space-x-4 mb-6">
    <div className="bg-[var(--secondary-200)] rounded-lg p-3 flex-shrink-0">{icon}</div>
    <div>
      <h2 className="text-white text-xl md:text-2xl font-semibold">{title}</h2>
      <p className="text-[var(--tertiary-500)] text-sm mt-1">{subtitle}</p>
    </div>
  </div>
);

// Input Field Component
const InputField = ({ label, required, type = 'text', placeholder, value, onChange, prefix }: any) => (
  <div className="mb-6">
    <label className="block text-white text-sm mb-2">
      {label} {required && <span className="text-[var(--tertiary-100)]">*</span>}
    </label>
    <div className="relative">
      {prefix && (
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--tertiary-500)] text-sm">{prefix}</span>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`w-full bg-[var(--primary-200)] text-[var(--primary-300)] border border-[var(--primary-10)] rounded-lg px-4 py-3 ${
          prefix ? 'pl-8' : ''
        } focus:outline-none focus:ring-2 focus:ring-[var(--secondary-100)] placeholder-[var(--primary-30)] transition-all`}
      />
    </div>
  </div>
);

// Select Field Component
const SelectField = ({ label, required, options, value, onChange }: any) => (
  <div className="mb-6">
    <label className="block text-white text-sm mb-2">
      {label} {required && <span className="text-[var(--tertiary-100)]">*</span>}
    </label>
    <select
      value={value}
      onChange={onChange}
      className="w-full bg-[var(--primary-200)] text-[var(--primary-300)] border border-[var(--primary-100)] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--secondary-100)] appearance-none cursor-pointer transition-all"
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%238C9BB0' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")",
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 1rem center'
      }}
    >
      {options.map((option: any, index: number) => (
        <option key={index} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

// Button Component
const Button = ({ children, variant = 'primary', onClick, icon }: any) => {
  const baseClasses = 'px-6 py-3 rounded-lg font-medium transition-all flex items-center space-x-2';
  const variants: any = {
    primary: 'bg-[var(--secondary-100)] text-white hover:bg-opacity-90',
    secondary: 'bg-transparent text-[var(--tertiary-500)] hover:bg-[var(--primary-20)]'
  };

  return (
    <button onClick={onClick} className={`${baseClasses} ${variants[variant]}`}>
      {icon && <span>{icon}</span>}
      <span>{children}</span>
    </button>
  );
};

// Main Component
const AddPlan = () => {
  const [toast, setToast] = useState({
    open: false,
    text: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info'
  });

  const showToast = (text: string, severity: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    setToast({ open: true, text, severity });
  };
  const handleToastClose = () => setToast(prev => ({ ...prev, open: false }));

  const [formData, setFormData] = useState({ planName: '', durationType: '', duration: '', amount: '' });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validate = () => {
    const missing: string[] = [];
    if (!formData.planName || !formData.planName.trim()) missing.push('planName');
    if (!formData.durationType) missing.push('durationType');
    if (!formData.duration) missing.push('duration');
    if (!formData.amount) missing.push('amount');
    return missing;
  };

  const handleSubmit = async () => {
    const missing = validate();
    if (missing.length > 0) {
      // friendly message for layman users
      showToast('Please complete all required fields: Plan name, duration type, duration, and amount.', 'warning');
      return;
    }

    // Read createdBy robustly (support both stored user json or a userId key)
    let createdBy: string | null = null;
    try {
      const raw = localStorage.getItem('user');
      const parsed = raw ? JSON.parse(raw) : null;
      createdBy = parsed?.id ?? parsed?._id ?? localStorage.getItem('userId') ?? null;
    } catch {
      createdBy = localStorage.getItem('userId') ?? null;
    }
    const role = localStorage.getItem('role') ?? '';

    const payload = {
      name: formData.planName,
      durationType: formData.durationType,
      duration: Number(formData.duration),
      amount: Number(formData.amount),
      createdBy: createdBy,
      currentUser: role
    };

    setLoading(true);
    try {
      const res = await apiRequest({ method: 'POST', endpoint: '/plan/addplan', body: payload });

      // success: show friendly message
      showToast(res?.message ?? 'Plan saved. Members can now subscribe to this plan.', 'success');

      // reset form
      setFormData({ planName: '', durationType: '', duration: '', amount: '' });
      console.log('Plan added:', res);
    } catch (err: any) {
      console.warn('Add plan failed:', err);

      // map common server responses to plain-language messages
      const status = err?.status ?? err?.response?.status ?? null;
      const backendMsg = (err?.message || err?.response?.data?.message || '').toString().toLowerCase();

      if (status === 400) {
        // validation or bad input
        showToast('Some information looks incorrect. Please double-check your entries and try again.', 'error');
      } else if (status === 401) {
        showToast('You do not have permission to add plans. Please sign in with an admin account.', 'error');
      } else if (status === 404) {
        showToast('Could not find the server resource. Please try again later.', 'error');
      } else if (status === 500) {
        showToast('Something went wrong on our side. Please try again in a few minutes.', 'error');
      } else if (backendMsg.includes('duplicate') || backendMsg.includes('already')) {
        showToast('A plan with similar details already exists. Try a different name or amount.', 'warning');
      } else if (backendMsg.includes('network') || backendMsg.includes('failed to fetch')) {
        showToast('Cannot reach the server. Check your internet connection and try again.', 'error');
      } else {
        // fallback generic message
        showToast(err?.message ?? 'Failed to add plan. Please try again.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // no UI change required; keep behavior
    console.log('Form cancelled');
  };

  return (
    <div className="min-h-screen bg-[var(--primary-200)] w-full p-4 md:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto ">
        <Breadcrumb items={['Dashboard', 'Plans', 'Add Plan']} />

        <div className="grid grid-cols-1 lg:grid-cols-1 border-amber-500 gap-6">
          {/* Form Section */}
          <div>
            <Card>
              <SectionHeader
                icon={
                  <svg className="w-6 h-6 text-[var(--secondary-100)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                }
                title="Plan Details"
                subtitle="Enter the membership plan information"
              />

              <div className="grid grid-cols-1 gap-0 lg:grid-cols-2 lg:gap-6 md:grid-cols-2 md:gap-4">
                <InputField
                  label={formConfig.planName.label}
                  required={formConfig.planName.required}
                  placeholder={formConfig.planName.placeholder}
                  value={formData.planName}
                  onChange={(e: any) => handleInputChange('planName', e.target.value)}
                />
                <SelectField
                  label={formConfig.durationType.label}
                  required={formConfig.durationType.required}
                  options={formConfig.durationType.options}
                  value={formData.durationType}
                  onChange={(e: any) => handleInputChange('durationType', e.target.value)}
                />
                <InputField
                  label={formConfig.duration.label}
                  required={formConfig.duration.required}
                  type="number"
                  placeholder={formConfig.duration.placeholder}
                  value={formData.duration}
                  onChange={(e: any) => handleInputChange('duration', e.target.value)}
                />
                <InputField
                  label={formConfig.amount.label}
                  required={formConfig.amount.required}
                  type="number"
                  placeholder={formConfig.amount.placeholder}
                  prefix="$"
                  value={formData.amount}
                  onChange={(e: any) => handleInputChange('amount', e.target.value)}
                />
                <div className="flex flex-col sm:flex-row gap-3 mt-8">
                  <Button
                    variant="primary"
                    onClick={handleSubmit}
                    icon={
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                      </svg>
                    }
                  >
                    {loading ? 'Saving...' : 'Save Plan'}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={handleCancel}
                    icon={
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    }
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* CustomAlert for user-facing messages */}
      <CustomAlert
        text={toast.text}
        open={toast.open}
        onClose={handleToastClose}
        severity={toast.severity}
      />
    </div>
  );
};

export default AddPlan;
