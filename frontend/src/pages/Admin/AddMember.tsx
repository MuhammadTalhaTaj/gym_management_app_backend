// src/pages/AddMember.tsx
import React, { useEffect, useState } from 'react';
import { 
  // Calendar, 
  Check } from 'lucide-react';
import { getPlans } from '../../services/plan';
// import { addMember } from '../../services/member';
import CustomAlert from '../../Components/CustomAlert';
import { addMember, type AddMemberPayload } from '../../services/member';

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
    <label className="text-sm font-medium text-[var(--primary-300)]">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-[var(--primary-300)] placeholder-gray-400"
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
    <label className="text-sm font-medium text-[var(--primary-300)]">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <select
      value={value}
      onChange={onChange}
      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-[var(--primary-300)] appearance-none bg-[var(--primary-100)] cursor-pointer"
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
    <label className="text-sm font-medium text-[var(--primary-300)]">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type="number"
      placeholder={placeholder}
      value={value as any}
      onChange={onChange}
      disabled={disabled}
      className={`w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-[var(--primary-300)] placeholder-[var(--primary-300)] ${disabled ? 'text-[var(--primary-300)] cursor-not-allowed' : ''
        }`}
    />
  </div>
);

const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
  <h2 className="text-xl font-semibold text-[var(--primary-300)] mb-6">{title}</h2>
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
  const [message, setMessage] = useState<string | null>(null); // developer message area (kept)
  const [, setSuccess] = useState<boolean>(false); // kept for backward compatibility if you depend on it elsewhere

  // CustomAlert (user-facing toast) state
  const [toastOpen, setToastOpen] = useState(false);
  const [toastText, setToastText] = useState('');
  const [toastSeverity, setToastSeverity] = useState<'success' | 'error' | 'warning' | 'info'>('success');

  const user = JSON.parse(localStorage.getItem("user") || "")

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
      } catch (err:any) {
        // keep fallback static plans for UI
        if (err?.response?.status === 404) {
          setPlans(formData.membershipPlans);
        } else {
          console.error('Failed to fetch plans:', err);
        }
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

  // helper to show user-friendly toast
  const showToast = (text: string, severity: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    setToastText(text);
    setToastSeverity(severity);
    setToastOpen(true);
  };
  const handleToastClose = () => setToastOpen(false);

  // BEFORE sending to backend, check required fields and map names
  const handleSubmit = async () => {
    // reset developer message area
    setMessage(null);

    const role = localStorage.getItem("role")
    const userId = role === "Admin" ? user?.id : user?.createdBy

    if (!userId) {
      // developer message kept, but also show a friendly toast to the user
      setMessage('You must be logged in to register a member. (missing userId)');
      showToast('You are not signed in. Please sign in to add a member.', 'error');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // get currentUser from localStorage 'role' key as requested
    const rawCurrentUser = localStorage.getItem('role');
    let currentUser: any = rawCurrentUser;
    try {
      if (rawCurrentUser) {
        currentUser = JSON.parse(rawCurrentUser);
      }
    } catch {
      // rawCurrentUser is probably a simple string (e.g., "Admin"), keep as-is
      currentUser = rawCurrentUser;
    }

    const payload: AddMemberPayload & { currentUser?: any } = {
      name: formState.fullName?.trim() || '',
      contact: formState.contactNumber?.trim() || '',
      email: formState.email?.trim() || '',
      gender: formState.gender || '',
      batch: BATCH_MAP[Number(formState.batch)] || formState.batch || '',
      address: formState.address?.trim() || '',
      plan: formState.membershipPlan || '',
      joinDate: formState.joiningDate || '',
      admissionAmount: Number(formState.admissionAmount) || 0,
      discount: Number(formState.discountAmount) || 0,
      collectedAmount: Number(formState.collectedAmount) || 0,
      createdBy: String(userId),
      // added per your instruction: include currentUser read from localStorage key 'role'
      currentUser
    };

    const required = ['name', 'contact', 'gender', 'batch', 'plan', 'joinDate', 'admissionAmount', 'collectedAmount', 'discount'];

    const missing = required.filter(key => {
      const v = (payload as Record<string, any>)[key];
      return v === undefined || v === null || v === '' || (typeof v === 'number' && isNaN(v));
    });

    if (missing.length > 0) {
      const missingMessageLines = [
        `Can't submit: Following fields are required but they are missing:`,
        ...missing.map(m => `• ${m}`)
      ];
      // keep developer message area intact (unchanged UI)
      setMessage(missingMessageLines.join('\n'));

      // show a plain-language toast for the user
      showToast('Please fill all required fields before submitting.', 'warning');

      // small UX: scroll to top so the developer message is visible if needed
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setSubmitting(true);
    try {
      // pass payload (contains currentUser). cast to any to avoid strict type mismatch if AddMemberPayload doesn't include currentUser
      const res = await addMember(payload as any);

      // Backend normally returns { message: "...", data: { member, payment } }
      const backendMessage = (res && (res.message || (res.data && res.data.message))) || '';

      // Friendly success text for lay users
      const successText = backendMessage && typeof backendMessage === 'string'
        ? backendMessage // "New Member and Payment added successfully" is already layman-friendly
        : 'Member registered and payment recorded successfully.';

      setSuccess(true);
      // show friendly toast
      showToast(successText, 'success');

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
      // Map backend errors to plain user-friendly messages
      const status = err?.response?.status ?? err?.status ?? null;
      const backendMsg = (err?.response?.data?.message || err?.message || '').toString();

      // Developer logging left intact
      console.error("Error: ", err);

      if (status === 400) {
        // handle common 400 messages
        if (backendMsg.includes('Provide required fields')) {
          showToast('Please complete all required fields and try again.', 'error');
        } else if (backendMsg.includes('Id is not in valid format')) {
          showToast('There is a problem with your account. Please sign out and sign in again, or contact support.', 'error');
        } else if (backendMsg.includes('Current user must be admin or staff')) {
          showToast('Your account is not allowed to add members. Please contact the administrator.', 'error');
        } else if (backendMsg.includes('Email or Phone is already in use')) {
          showToast('This email or phone is already registered. Try logging in or use a different contact.', 'error');
        } else {
          showToast('Unable to add member. Please check your inputs and try again.', 'error');
        }
      } else if (status === 404 || backendMsg.includes('Plan not found')) {
        showToast('Selected plan was not found. Please choose a different plan.', 'error');
      } else if (status === 401 || backendMsg.includes('You do not have permission')) {
        showToast('You do not have permission to add members. Contact your administrator.', 'error');
      } else if (status === 500 || backendMsg.includes('Payment creation failed')) {
        showToast('We had trouble saving the payment. No member was created. Please try again.', 'error');
      } else if (backendMsg.toLowerCase().includes('network') || backendMsg.toLowerCase().includes('fetch')) {
        showToast('Cannot reach the server. Check your internet and try again.', 'error');
      } else {
        // Generic fallback
        showToast('Something went wrong while saving. Please try again.', 'error');
      }

      // Keep developer-visible message for debugging if you need it
      // setMessage(String(backendMsg || 'An unexpected error occurred'));
      setSuccess(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[var(--primary-100)] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-[var(--primary-200)] rounded-2xl shadow-sm p-6 sm:p-8 lg:p-10">
        {/* Personal Details Section */}
        <SectionHeader title="Personal Details" />

        {/* developer message / errors */}
        {message && (
          <div className="mb-6 p-4 rounded border text-[var(--primary-300)] border-red-500 bg-[var(--primary-100)] text-sm whitespace-pre-wrap">
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
            // icon={<Calendar size={18} />}
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

      {/* CustomAlert (user-facing friendly messages). Kept outside main card so it doesn't affect layout. */}
      <CustomAlert
        text={toastText}
        severity={toastSeverity}
        open={toastOpen}
        onClose={handleToastClose}
      />
    </div>
  );
};

export default AddMember;
