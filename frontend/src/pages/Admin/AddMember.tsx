// src/pages/AddMember.tsx
import React, { useEffect, useState } from 'react';
import { Calendar, Check } from 'lucide-react';
import { getPlans } from '../../services/plan';
import { addMember } from '../../services/member';
import CustomAlert from '../../Components/CustomAlert';

// --- existing static data (kept for fallback) ---
const BATCH_MAP: Record<number, string> = {
  1: 'morning',
  2: 'evening',
  3: 'afternoon',
  4: 'night'
};
const formData = {
  genderOptions: ['Male', 'Female', 'Other', 'Prefer not to say'],
  membershipPlans: [
    { id: 1, name: 'Basic Plan', price: 500 },
    { id: 2, name: 'Premium Plan', price: 1000 },
    { id: 3, name: 'Elite Plan', price: 1500 }
  ],
  batches: [
    { id: 1, name: 'morning' },
    { id: 2, name: 'evening' },
    { id: 3, name: 'afternoon' },
    { id: 4, name: 'night' }
  ]
};

function getStoredUserId(): string | null {
  return localStorage.getItem('userId') || sessionStorage.getItem('userId') || null;
}

// types for plans coming from service or fallback
type PlanOption = {
  _id?: string | number;
  id?: string | number;
  name: string;
  amount?: number;
  price?: number;
  planAmount?: number;
} & Record<string, any>;

// --- small input/select components (kept unchanged visually) ---
type InputProps = {
  label: string;
  required?: boolean;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon?: React.ReactNode;
};
const Input: React.FC<InputProps> = ({ label, required, type = 'text', placeholder, value, onChange, icon }) => (
  <div className="flex flex-col gap-2">
    <label className="text-sm font-medium text-gray-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 placeholder-gray-400"
      />
      {icon && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
          {icon}
        </div>
      )}
    </div>
  </div>
);

type SelectOption = string | PlanOption | { id?: any; _id?: any; name: string };
type SelectProps = {
  label: string;
  required?: boolean;
  options: SelectOption[];
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  placeholder?: string;
};
const Select: React.FC<SelectProps> = ({ label, required, options, value, onChange, placeholder }) => (
  <div className="flex flex-col gap-2">
    <label className="text-sm font-medium text-gray-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <select
      value={value}
      onChange={onChange}
      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 appearance-none bg-white cursor-pointer"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236B7280' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 1rem center'
      }}
    >
      <option value="">{placeholder}</option>
      {options.map((option, index) => (
        <option
          key={index}
          value={
            typeof option === 'string'
              ? option
              : String((option as PlanOption)._id ?? (option as any).id ?? (option as any).name ?? index)
          }
        >
          {typeof option === 'string' ? option : (option as any).name}
        </option>
      ))}
    </select>
  </div>
);

type NumberInputProps = {
  label: string;
  required?: boolean;
  placeholder?: string;
  value: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
};
const NumberInput: React.FC<NumberInputProps> = ({ label, required, placeholder, value, onChange, disabled }) => (
  <div className="flex flex-col gap-2">
    <label className="text-sm font-medium text-gray-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type="number"
      placeholder={placeholder}
      value={value as any}
      onChange={onChange}
      disabled={disabled}
      className={`w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 placeholder-gray-400 ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''
        }`}
    />
  </div>
);

const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
  <h2 className="text-xl font-semibold text-gray-900 mb-6">{title}</h2>
);

// --- main component ---
type FormState = {
  fullName: string;
  contactNumber: string;
  email: string;
  address: string;
  // dateOfBirth: string;
  gender: string;
  joiningDate: string;
  membershipPlan: string; // plan id or name
  batch: string;
  admissionAmount: string;
  collectedAmount: string;
  discountAmount: string;
  // notes?: string;
};

const AddMember: React.FC = () => {
  // Keep your original form keys (no UI change)
  const [formState, setFormState] = useState<FormState>({
    fullName: '',
    contactNumber: '',
    email: '',
    address: '',
    // dateOfBirth: '',
    gender: '',
    joiningDate: '',
    membershipPlan: '', // will hold plan id (or fallback)
    batch: '',
    admissionAmount: '',
    collectedAmount: '',
    discountAmount: ''
    // notes: ''
  });

  // plans fetched from backend (if available). Each plan should have _id, name, amount
  const [plans, setPlans] = useState<PlanOption[]>(formData.membershipPlans as PlanOption[]);
  const [batches] = useState(formData.batches);
  const [genderOptions] = useState(formData.genderOptions);

  const [loadingPlans, setLoadingPlans] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false)

  useEffect(() => {
    // fetch real plans via service
    const loadPlans = async () => {
      setLoadingPlans(true);
      try {
        const fetched: any = await getPlans();
        if (Array.isArray(fetched) && fetched.length > 0) {
          // Normalize: ensure _id and name exist
          const mapped: PlanOption[] = fetched.map((p: any) => ({
            _id: p._id ?? p.id ?? p._id,
            id: p._id ?? p.id ?? p._id,
            name: p.name ?? p.title ?? `Plan ${p._id ?? p.id}`,
            amount: p.amount ?? p.price ?? p.planAmount ?? 0
          }));
          setPlans(mapped);
        }
      } catch (err) {
        // keep fallback static plans on failure (no UX change)
        // eslint-disable-next-line no-console
        console.warn('Failed to fetch plans:', err);
      } finally {
        setLoadingPlans(false);
      }
    };

    loadPlans();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInputChange = (field: keyof FormState, value: string) => {
    setFormState(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calculateDueAmount = (): number => {
    const admission = parseFloat(formState.admissionAmount as string) || 0;
    const collected = parseFloat(formState.collectedAmount as string) || 0;
    const discount = parseFloat(formState.discountAmount as string) || 0;

    // plan lookup: compare as string to be robust
    const planObj = plans.find(p => {
      const pid = String((p as any)._id ?? (p as any).id ?? p.name);
      return pid === String(formState.membershipPlan);
    });

    const planAmount = Number(planObj?.amount ?? planObj?.price ?? planObj?.planAmount ?? 0);
    return admission + planAmount - discount - collected;
  };

  // BEFORE sending to backend, check required fields and map names
  const handleSubmit = async () => {
    setMessage(null);
    const userId = getStoredUserId();
    if (!userId) {
      setMessage('You must be logged in to register a member. (missing userId)');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const payload: Record<string, any> = {
      name: formState.fullName?.trim() || '',
      contact: formState.contactNumber?.trim() || '',
      email: formState.email?.trim() || '',
      gender: formState.gender || '',
      batch: BATCH_MAP[Number(formState.batch)] || formState.batch || '',
      address: formState.address?.trim() || '',
      plan: formState.membershipPlan || '', // must be plan id (we populate dropdown with _id)
      joinDate: formState.joiningDate || '',
      admissionAmount: Number(formState.admissionAmount) || 0,
      discount: 0,
      discountAmount: Number(formState.discountAmount) || 0,
      collectedAmount: Number(formState.collectedAmount) || 0,
      createdBy: userId
    };

    const required = ['name', 'contact', 'gender', 'batch', 'plan', 'joinDate', 'admissionAmount', 'collectedAmount', 'discountAmount'];
    const missing = required.filter(key => {
      const v = payload[key];
      return v === undefined || v === null || v === '' || (typeof v === 'number' && isNaN(v));
    });

    if (missing.length > 0) {
      const missingMessageLines = [
        `Can't submit: backend requires these fields but they are missing:`,
        ...missing.map(m => `• ${m}`)
      ];
      setMessage(missingMessageLines.join('\n'));
      // small UX: scroll to top so message is visible
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setSubmitting(true);
    try {
      // cast addMember to any to allow passing `createdBy` (keeps UI & logic unchanged)
      const res: any = await (addMember as any)(payload);

      setSuccess(true)
      // reset form (preserving fallback UI behavior)
      setFormState({
        fullName: '',
        contactNumber: '',
        email: '',
        address: '',
        // dateOfBirth: '',
        gender: '',
        joiningDate: '',
        membershipPlan: '',
        batch: '',
        admissionAmount: '',
        collectedAmount: '',
        discountAmount: ''
        // notes: ''
      });
    } catch (err: any) {
      if (err.response.status == 404) {
        setMessage("Plan not found")
      }
      else {
        console.error("Error: ", err)
      }
      setSuccess(false)
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm p-6 sm:p-8 lg:p-10">
        {/* Personal Details Section */}
        <SectionHeader title="Personal Details" />

        {/* developer message / errors */}
        {message && (
          <div className="mb-6 p-4 rounded border border-red-200 bg-red-50 text-sm whitespace-pre-wrap">
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Input
            label="Full Name"
            required
            placeholder="e.g., Jane Doe"
            value={formState.fullName}
            onChange={(e) => handleInputChange('fullName', e.target.value)}
          />

          <Input
            label="Contact Number"
            required
            type="tel"
            placeholder="e.g., (123) 456-7890"
            value={formState.contactNumber}
            onChange={(e) => handleInputChange('contactNumber', e.target.value)}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Input
            label="Email"
            required
            placeholder="JaneDoe@gmail.com"
            value={formState.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
          />

          <Input
            label="Address"
            required
            type="text"
            value={formState.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">

          <Select
            label="Gender"
            required
            placeholder="Select Gender"
            options={genderOptions}
            value={formState.gender}
            onChange={(e) => handleInputChange('gender', e.target.value)}
          />
        </div>

        {/* Membership Details Section */}
        <SectionHeader title="Membership Details" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Input
            label="Joining Date"
            required
            type="date"
            placeholder="mm / dd / yyyy"
            value={formState.joiningDate}
            onChange={(e) => handleInputChange('joiningDate', e.target.value)}
            icon={<Calendar size={18} />}
          />

          <Select
            label="Membership Plan"
            required
            placeholder={loadingPlans ? 'Loading plans...' : 'Select a Plan'}
            options={plans}
            value={formState.membershipPlan}
            onChange={(e) => handleInputChange('membershipPlan', e.target.value)}
          />
        </div>

        <div className="mb-6">
          <Select
            label="Batch Selection"
            required
            placeholder="Select a Batch"
            options={batches}
            value={formState.batch}
            onChange={(e) => handleInputChange('batch', e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <NumberInput
            label="Admission Amount"
            required
            placeholder="e.g., 500"
            value={formState.admissionAmount}
            onChange={(e) => handleInputChange('admissionAmount', e.target.value)}
          />

          <NumberInput
            label="Collected Amount"
            required
            placeholder="e.g., 500"
            value={formState.collectedAmount}
            onChange={(e) => handleInputChange('collectedAmount', e.target.value)}
          />
          <NumberInput
            label="Discount Amount"
            required
            placeholder="e.g., 500"
            value={formState.discountAmount}
            onChange={(e) => handleInputChange('discountAmount', e.target.value)}
          />

          <NumberInput
            label="Due Amount"
            placeholder="Auto-calculated"
            value={calculateDueAmount()}
            disabled
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-8 py-3 rounded-lg flex items-center gap-2 transition-colors duration-200 shadow-sm"
          >
            <Check size={20} />
            {submitting ? 'Registering...' : 'Register Member'}
          </button>
        </div>
      </div>
      {success && <CustomAlert
        text="Member Added!"
        severity="success"
        open={success}
        onClose={() => setSuccess(false)}

      />}
    </div>
  );
};

export default AddMember;
