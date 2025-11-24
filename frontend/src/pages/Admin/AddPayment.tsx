// src/pages/AddPayment.tsx
import React, { useEffect, useState, useRef } from 'react';
import { Calendar, DollarSign, Users, CreditCard, CheckCircle, Info, AlertCircle } from 'lucide-react';
import { apiRequest } from '../../config/api'; // <- API helper import

interface Plan {
  id: string;
  name: string;
  amount: number;
}

interface Member {
  id: string;
  name: string;
  dueAmount: number;
  collectedAmount: number;
  plan: Plan; // keep non-null plan to avoid type mismatches in state updates
}

// Data file simulation - fallback
const paymentData = {
  members: [
    { id: '1', name: 'John Doe', dueAmount: 1500, collectedAmount: 0, plan: { id: '1', name: 'Basic Plan', amount: 500 } },
    { id: '2', name: 'Jane Smith', dueAmount: 2000, collectedAmount: 0, plan: { id: '2', name: 'Premium Plan', amount: 1000 } },
    { id: '3', name: 'Mike Johnson', dueAmount: 1200, collectedAmount: 0, plan: { id: '3', name: 'Enterprise Plan', amount: 2000 } }
  ],
  plans: [
    { id: '1', name: 'Basic Plan', amount: 500 },
    { id: '2', name: 'Premium Plan', amount: 1000 },
    { id: '3', name: 'Enterprise Plan', amount: 2000 }
  ],
  rules: [
    { id: 1, text: 'Payment amount must be greater than $0', icon: CheckCircle },
    { id: 2, text: "Cannot exceed member's due amount", icon: CheckCircle },
    { id: 3, text: 'Member must have outstanding balance', icon: CheckCircle },
    { id: 4, text: 'Payment date cannot be in the future', icon: CheckCircle }
  ]
};

// Select Component (unchanged markup / classNames)
const Select: React.FC<{
  label: string;
  icon: any;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: any[];
  placeholder?: string;
}> = ({ label, icon: Icon, value, onChange, options, placeholder = '' }) => (
  <div className="flex flex-col gap-2">
    <label className="flex items-center gap-2 text-[var(--tertiary-500)] text-sm font-medium">
      <Icon size={16} />
      {label}
    </label>
    <select
      value={value}
      onChange={onChange}
      className="w-full bg-[var(--tertiary-600)] text-white px-4 py-3 rounded-lg border border-[var(--primary-300)] focus:outline-none focus:ring-2 focus:ring-[var(--secondary-100)] transition-all appearance-none cursor-pointer"
    >
      <option value="">{placeholder}</option>
      {(options || []).map(option => (
        <option key={String(option.id)} value={String(option.id)}>
          {option.name}
        </option>
      ))}
    </select>
  </div>
);

// Input Component (unchanged markup / classNames)
const Input: React.FC<{
  label: string;
  icon: any;
  type?: string;
  value: any;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
}> = ({ label, icon: Icon, type = 'text', value, onChange, placeholder }) => (
  <div className="flex flex-col gap-2">
    <label className="flex items-center gap-2 text-[var(--tertiary-500)] text-sm font-medium">
      <Icon size={16} />
      {label}
    </label>
    <div className="relative">
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full bg-[var(--tertiary-600)] text-white px-4 py-3 rounded-lg border border-[var(--primary-300)] focus:outline-none focus:ring-2 focus:ring-[var(--secondary-100)] transition-all"
      />
      {type === 'number' && (
        <DollarSign size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--tertiary-500)]" />
      )}
    </div>
  </div>
);

// Summary Card Component (unchanged)
const SummaryCard: React.FC<{ amount: number; remainingDue: number; newCollected: number }> = ({ amount, remainingDue, newCollected }) => (
  <div className="bg-[var(--primary-200)] rounded-lg p-6">
    <div className="flex items-center gap-2 mb-6">
      <CreditCard size={20} className="text-[var(--secondary-100)]" />
      <h2 className="text-white font-semibold text-lg">Payment Summary</h2>
    </div>
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <span className="text-[var(--tertiary-500)]">Payment Amount:</span>
        <span className="text-white font-semibold text-xl">
          ${amount.toFixed(2)}
        </span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-[var(--tertiary-500)]">Remaining Due:</span>
        <span className="text-[var(--tertiary-100)] font-semibold text-xl">
          ${remainingDue.toFixed(2)}
        </span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-[var(--tertiary-500)]">New Collected Total:</span>
        <span className="text-[var(--tertiary-300)] font-semibold text-xl">
          ${newCollected.toFixed(2)}
        </span>
      </div>
    </div>
  </div>
);

// Rules Card + QuickTip (unchanged)
const RulesCard: React.FC<{ rules: any[] }> = ({ rules }) => (
  <div className="bg-[var(--primary-200)] rounded-lg p-6">
    <div className="flex items-center gap-2 mb-4">
      <Info size={20} className="text-[var(--tertiary-400)]" />
      <h2 className="text-white font-semibold text-lg">Payment Rules</h2>
    </div>
    <ul className="space-y-3">
      {rules.map(rule => (
        <li key={rule.id} className="flex items-start gap-3 text-[var(--tertiary-500)] text-sm">
          <CheckCircle size={16} className="text-[var(--tertiary-300)] mt-0.5 flex-shrink-0" />
          <span>{rule.text}</span>
        </li>
      ))}
    </ul>
  </div>
);

const QuickTip: React.FC<{ message: string }> = ({ message }) => (
  <div className="bg-gradient-to-br from-[var(--tertiary-400-30)] to-[var(--primary-200)] rounded-lg p-6 border border-[var(--tertiary-400)]/20">
    <div className="flex items-center gap-2 mb-3">
      <div className="bg-[var(--secondary-100)] rounded-full p-1.5">
        <AlertCircle size={16} className="text-[var(--primary-100)]" />
      </div>
      <h3 className="text-white font-semibold">Quick Tip</h3>
    </div>
    <p className="text-[var(--tertiary-500)] text-sm leading-relaxed">
      {message}
    </p>
  </div>
);

// Helpers
const normalizeMember = (raw: any, idx: number): Member => {
  const id = raw && (raw._id ?? raw.id) ? (raw._id ?? String(raw.id)) : String(idx);
  const name = String(raw?.name ?? raw?.fullName ?? `Member ${id}`);
  const dueAmount = Number(raw?.dueAmount ?? raw?.due ?? (raw?.data && Number(raw.data.dueAmount)) ?? 0);
  const collectedAmount = Number(raw?.collectedAmount ?? raw?.collected ?? (raw?.data && Number(raw.data.collectedAmount)) ?? 0);

  // Always produce a non-null Plan (keeps state homogeneous)
  const planObj: Plan = (raw && raw.plan && typeof raw.plan === 'object')
    ? {
        id: String(raw.plan._id ?? raw.plan.id ?? ''),
        name: String(raw.plan.name ?? 'Plan'),
        amount: Number(raw.plan.amount ?? 0)
      }
    : { id: '0', name: 'No Plan', amount: 0 };

  return {
    id: String(id),
    name,
    dueAmount: Number.isFinite(dueAmount) ? dueAmount : 0,
    collectedAmount: Number.isFinite(collectedAmount) ? collectedAmount : 0,
    plan: planObj
  };
};

const normalizePlan = (raw: any, idx: number): Plan => {
  const id = raw && (raw._id ?? raw.id) ? (raw._id ?? String(raw.id)) : String(idx);
  const name = raw?.name ?? raw?.title ?? `Plan ${id}`;
  const amount = Number(raw?.amount ?? raw?.price ?? 0);
  return { id: String(id), name, amount: Number.isFinite(amount) ? amount : 0 };
};

const safeParseAmount = (val: any) => {
  // Accept numeric strings, decimals, strip commas/spaces
  if (val === '' || val === null || val === undefined) return 0;
  const cleaned = String(val).replace(/,/g, '').trim();
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
};

const todayISO = () => new Date().toISOString().split('T')[0];

const AddPayment: React.FC = () => {
  const [members, setMembers] = useState<Member[]>(
    paymentData.members.map(m => ({
      ...m,
      id: String(m.id),
      // ensure m.plan conforms to Plan type
      plan: (m.plan ?? { id: '0', name: 'No Plan', amount: 0 }) as Plan
    }))
  );
  const [plans, setPlans] = useState<Plan[]>(
    paymentData.plans.map(p => ({ ...p, id: String(p.id) }))
  );

  const [selectedMember, setSelectedMember] = useState(''); // will store id as string
  const [selectedPlan, setSelectedPlan] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(todayISO());
  const [submitting, setSubmitting] = useState(false);
  const [loadingMemberDetails, setLoadingMemberDetails] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  // keep track of last fetch id to avoid race updates
  const fetchCounterRef = useRef(0);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  // load members & plans from backend on mount (with fallbacks)
  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const [membersRes, plansRes] = await Promise.all([
          apiRequest({
            method: 'GET',
            endpoint: '/member/getAllMembers',
            mapFn: (raw: any) => {
              const list = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];
              return list.map((r: any, i: number) => normalizeMember(r, i));
            }
          }).catch(() => null),
          apiRequest({
            method: 'GET',
            endpoint: '/plan/getPlans',
            mapFn: (raw: any) => {
              const list = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];
              return list.map((r: any, i: number) => normalizePlan(r, i));
            }
          }).catch(() => null)
        ]);

        if (!isMounted) return;

        if (Array.isArray(membersRes) && membersRes.length > 0) {
          setMembers(membersRes as Member[]);
        }

        if (Array.isArray(plansRes) && plansRes.length > 0) {
          setPlans(plansRes as Plan[]);
        }
      } catch (err) {
        console.error('Failed to load members/plans, using fallback', err);
        // keep fallback local data
      }
    };

    load();
    return () => { isMounted = false; };
  }, []);

  // When selectedMember changes, call viewPayments API to fetch due/collected and payments history
  useEffect(() => {
    let isActive = true;
    const currentFetchId = ++fetchCounterRef.current;

    const fetchMemberDetails = async (memberId: string) => {
      if (!memberId) return;
      setLoadingMemberDetails(true);
      setGlobalError(null);
      try {
        const res = await apiRequest({
          method: 'GET',
          endpoint: `/payment/viewPayments/${memberId}`,
          mapFn: (raw: any) => {
            const payload = raw && raw.data ? raw.data : raw;
            return normalizeMember(payload, 0);
          }
        });

        // If another fetch started after this one, ignore stale result
        if (!isActive || currentFetchId !== fetchCounterRef.current) return;

        if (res && res.id) {
          // res should be a normalized Member
          const updated = res as Member;
          setMembers(prev => {
            const found = prev.some(m => String(m.id) === String(updated.id));
            if (found) {
              // cast mapped result to Member[] to satisfy TS
              return prev.map(m => (String(m.id) === String(updated.id) ? updated : m)) as Member[];
            } else {
              return [...prev, updated] as Member[];
            }
          });

          if (updated.plan && updated.plan.id) {
            setSelectedPlan(updated.plan.id);
            const suggested = updated.dueAmount > 0 ? Math.min(updated.dueAmount, Number(updated.plan.amount ?? 0)) : Number(updated.plan.amount ?? 0);
            if (suggested > 0) setPaymentAmount(String(suggested));
          } else {
            if (updated.dueAmount > 0) setPaymentAmount(String(updated.dueAmount));
          }
        } else {
          // no structured response - keep fallback
        }
      } catch (err) {
        console.warn('Failed to load member payment history, using existing data/fallback', err);
        // non-fatal, we won't block user
        setGlobalError('Could not load member details. Using cached/fallback data.');
      } finally {
        if (isActive) setLoadingMemberDetails(false);
      }
    };

    fetchMemberDetails(selectedMember);
    return () => { isActive = false; };
  }, [selectedMember]);

  const memberObj = members.find(m => String(m.id) === String(selectedMember));
  const planObj = plans.find(p => String(p.id) === String(selectedPlan));

  const amount = safeParseAmount(paymentAmount);
  const remainingDue = (() => {
    if (memberObj && typeof memberObj.dueAmount === 'number') {
      return Math.max(0, Number(memberObj.dueAmount) - amount);
    }
    if (planObj && typeof planObj.amount === 'number') {
      return Math.max(0, Number(planObj.amount) - amount);
    }
    return 0;
  })();

  const newCollected = memberObj ? Number(memberObj.collectedAmount || 0) + amount : amount;

  const validate = () => {
    // clear previous global errors
    setGlobalError(null);

    if (!selectedMember) {
      window.alert('Select a member first.');
      return false;
    }
    if (!selectedPlan) {
      window.alert('Select a plan.');
      return false;
    }
    if (amount <= 0) {
      window.alert('Payment amount must be greater than 0.');
      return false;
    }
    if (!memberObj) {
      window.alert('Selected member not found.');
      return false;
    }
    if (typeof memberObj.dueAmount === 'number') {
      if (memberObj.dueAmount <= 0) {
        window.alert('The member has no outstanding balance.');
        return false;
      }
      if (amount > Number(memberObj.dueAmount)) {
        window.alert('Payment amount cannot be greater than the member\'s due amount.');
        return false;
      }
    }
    const chosen = new Date(paymentDate);
    const today = new Date();
    chosen.setHours(0,0,0,0);
    today.setHours(0,0,0,0);
    if (isNaN(chosen.getTime())) {
      window.alert('Invalid payment date.');
      return false;
    }
    if (chosen > today) {
      window.alert('Payment date cannot be in the future.');
      return false;
    }
    return true;
  };

  const handleProcessPayment = async () => {
    if (submitting) return; // prevent double submit
    if (!validate()) return;

    setSubmitting(true);
    setGlobalError(null);
    try {
      const payload = {
        amount,
        memberId: selectedMember,
        plan: selectedPlan,
        paymentDate
      };

      const res = await apiRequest({
        method: 'POST',
        endpoint: '/payment/addpayment',
        body: payload
      }).catch((e) => { throw e; });

      // backend returns { message, data: { member, payment } }
      const updatedMember = res?.data?.member ?? res?.member ?? null;

      if (updatedMember) {
        const normalized: Member = normalizeMember(updatedMember, 0);
        // cast to Member[] to ensure TS accepts the callback result
        setMembers(prev =>
          prev.map(m => (String(m.id) === String(normalized.id) ? normalized : m)) as Member[]
        );
        setPaymentAmount('');
        window.alert(res?.message ?? 'Payment processed successfully');
      } else {
        // fallback local update if backend didn't return updated member
        setMembers(prev => prev.map(m => (String(m.id) === String(selectedMember) ? {
          ...m,
          dueAmount: remainingDue,
          collectedAmount: newCollected
        } : m)) as Member[]);
        setPaymentAmount('');
        window.alert(res?.message ?? 'Payment processed successfully (no updated member returned)');
      }
    } catch (err: any) {
      console.error('Payment failed', err);
      window.alert(err?.message ?? 'Failed to process payment');
      setGlobalError('Failed to process payment. See console for details.');
    } finally {
      if (mountedRef.current) setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--primary-100)] p-4 md:p-6 lg:p-8 flex items-center justify-center">
      <div className="w-full max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Section - Payment Form */}
          <div className="lg:col-span-2">
            <div className="bg-[var(--primary-200)] rounded-2xl p-6 md:p-8 shadow-2xl">
              {/* Header */}
              <div className="flex items-start gap-4 mb-8">
                <div className="bg-[var(--secondary-100)] rounded-xl p-4 shadow-lg">
                  <CreditCard size={28} className="text-[var(--primary-200)]" />
                </div>
                <div>
                  <h1 className="text-white text-2xl md:text-3xl font-bold">Payment Details</h1>
                  <p className="text-[var(--tertiary-500)] mt-1">Enter payment information</p>
                </div>
              </div>

              {/* Potential non-blocking global error message (no UI class changes to existing markup) */}
              {globalError && (
                <div role="alert" aria-live="polite" className="mb-4">
                  <small style={{ color: '#ffb4b4' }}>{globalError}</small>
                </div>
              )}

              {/* Form Fields */}
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Select
                    label="Member"
                    icon={Users}
                    value={selectedMember}
                    onChange={(e) => setSelectedMember(e.target.value)}
                    options={members}
                    placeholder="Select Member"
                  />
                  <Select
                    label="Plan"
                    icon={CreditCard}
                    value={selectedPlan}
                    onChange={(e) => setSelectedPlan(e.target.value)}
                    options={plans}
                    placeholder="Select Plan"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Payment Amount"
                    icon={DollarSign}
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => {
                      // restrict to reasonable characters on the frontend only (still validated at submit)
                      const raw = e.target.value;
                      // allow empty, digits, dot, comma
                      if (/^[0-9.,]*$/.test(raw) || raw === '') {
                        setPaymentAmount(raw);
                      } else {
                        // ignore invalid char
                      }
                    }}
                    placeholder="Enter amount"
                  />
                  <Input
                    label="Payment Date"
                    icon={Calendar}
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    placeholder="Select date"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <button
                    onClick={handleProcessPayment}
                    disabled={submitting || loadingMemberDetails}
                    aria-disabled={submitting || loadingMemberDetails}
                    className="flex-1 bg-[var(--secondary-100)] hover:bg-[var(--secondary-100)]/90 text-[var(--primary-100)] font-semibold py-4 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    <CheckCircle size={20} />
                    {submitting ? 'Processing...' : 'Process Payment'}
                  </button>
                  <button
                    onClick={() => {
                      // reset but keep loaded members/plans
                      setSelectedMember('');
                      setSelectedPlan('');
                      setPaymentAmount('');
                      setPaymentDate(todayISO());
                      setGlobalError(null);
                    }}
                    className="sm:w-auto px-8 bg-[var(--tertiary-600)] hover:bg-[var(--primary-200)] text-[var(--tertiary-500)] hover:text-white font-semibold py-4 rounded-lg transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Section - Summary & Info */}
          <div className="space-y-6">
            <SummaryCard
              amount={amount}
              remainingDue={remainingDue}
              newCollected={newCollected}
            />
            <RulesCard rules={paymentData.rules} />
            <QuickTip
              message="Select a member first to view their current due amount and payment history. The system will automatically validate payment amounts."
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddPayment;
