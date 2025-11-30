// src/pages/AddExpense.tsx
import React, { useEffect, useState } from 'react';
import {
  X, Check, Tag,
  //  DollarSign,
  Calendar, FileText, Utensils, Fuel, ShoppingCart, ArrowRight
} from 'lucide-react';
import { apiRequest } from '../../config/api'; // <- existing import
import CustomAlert from '../../Components/CustomAlert';

// Data configuration file
const expenseFormConfig = {
  quickAmounts: [10, 25, 50, 100, 200],
  placeholders: {
    expenseName: 'e.g., Grocery Shopping, Fuel, Restaurant',
    amount: '0.00',
    notes: 'Add any additional details or notes about this expense...'
  },
  recentExpenses: [
    {
      id: 1,
      name: 'Restaurant Dinner',
      time: 'Today, 7:30 PM',
      amount: 45.50,
      icon: 'restaurant',
      iconBg: 'var(--tertiary-200)'
    },
    {
      id: 2,
      name: 'Fuel',
      time: 'Today, 2:15 PM',
      amount: 62.00,
      icon: 'fuel',
      iconBg: 'var(--tertiary-400)'
    },
    {
      id: 3,
      name: 'Grocery Shopping',
      time: 'Yesterday, 5:45 PM',
      amount: 128.75,
      icon: 'grocery',
      iconBg: 'var(--tertiary-300)'
    }
  ]
};

// Icon Map Component
const ExpenseIcon = ({ type, className = "w-5 h-5" }: any) => {
  const icons: Record<string, any> = {
    restaurant: <Utensils className={className} />,
    fuel: <Fuel className={className} />,
    grocery: <ShoppingCart className={className} />
  };
  return icons[type] || <Tag className={className} />;
};

// Form Header Component
const FormHeader = ({ icon, title, subtitle }: any) => (
  <div className="flex items-center gap-4 mb-6">
    <div className="w-12 h-12 rounded-xl bg-[var(--secondary-100)] flex items-center justify-center">
      {icon}
    </div>
    <div>
      <h2 className="text-xl font-semibold text-white">{title}</h2>
      <p className="text-[var(--tertiary-500)] text-sm">{subtitle}</p>
    </div>
  </div>
);

// Input Field Component
const InputField = ({ label, required, type = 'text', placeholder, value, onChange, icon: Icon }: any) => (
  <div className="mb-5">
    <label className="block text-white text-sm mb-2">
      {label} {required && <span className="text-[var(--tertiary-100)]">*</span>}
    </label>
    <div className="relative">
      {Icon && (
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[var(--tertiary-500)]">
          <Icon className="w-5 h-5" />
        </div>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`w-full bg-[var(--primary-200)] text-white rounded-lg ${Icon ? 'pl-12' : 'pl-4'
          } pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--secondary-100)] placeholder-[var(--tertiary-500)]`}
      />
    </div>
  </div>
);

// Amount and Date Row Component
const AmountDateRow = ({ amount, onAmountChange, date, onDateChange }: any) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
    <div>
      <label className="block text-white text-sm mb-2">
        Amount <span className="text-[var(--tertiary-100)]">*</span>
      </label>
      <div className="relative">
        <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[var(--tertiary-500)]">
          $
        </span>
        <input
          type="number"
          placeholder="0.00"
          value={amount}
          onChange={onAmountChange}
          step="0.01"
          className="w-full bg-[var(--primary-200)] text-white rounded-lg pl-8 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--secondary-100)] placeholder-[var(--tertiary-500)]"
        />
      </div>
    </div>

    <div>
      <label className="block text-white text-sm mb-2">
        Date <span className="text-[var(--tertiary-100)]">*</span>
      </label>
      <div className="relative">
        <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[var(--tertiary-500)] w-5 h-5 pointer-events-none" />
        <input
          type="date"
          value={date}
          onChange={onDateChange}
          className="w-full bg-[var(--primary-200)] text-white rounded-lg pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--secondary-100)] [color-scheme:dark]"
        />
      </div>
    </div>
  </div>
);

// Textarea Component
const TextareaField = ({ label, optional, placeholder, value, onChange, icon: Icon }: any) => (
  <div className="mb-5">
    <label className="block text-white text-sm mb-2">
      {label} {optional && <span className="text-[var(--tertiary-500)]">(Optional)</span>}
    </label>
    <div className="relative">
      {Icon && (
        <div className="absolute left-4 top-4 text-[var(--tertiary-500)]">
          <Icon className="w-5 h-5" />
        </div>
      )}
      <textarea
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        rows={4}
        className={`w-full bg-[var(--primary-200)] text-white rounded-lg ${Icon ? 'pl-12' : 'pl-4'
          } pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--secondary-100)] placeholder-[var(--tertiary-500)] resize-none`}
      />
    </div>
  </div>
);

// Quick Amount Buttons
const QuickAmountButtons = ({ amounts, onSelect, selectedAmount }: any) => (
  <div className="mb-6">
    <label className="block text-white text-sm mb-3">Quick Amount</label>
    <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
      {amounts.map((amount: number) => (
        <button
          key={amount}
          onClick={() => onSelect(amount)}
          className={`py-3 rounded-lg font-medium transition-all ${selectedAmount === amount
            ? 'bg-[var(--secondary-100)] text-white'
            : 'bg-[var(--primary-200)] text-white hover:bg-opacity-80'
            }`}
        >
          ${amount}
        </button>
      ))}
    </div>
  </div>
);

// Action Buttons
const ActionButtons = ({ onCancel, onSubmit, submitting }: any) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
    <button
      onClick={onCancel}
      className="py-3 rounded-lg font-medium bg-[var(--primary-200)] text-white hover:bg-opacity-80 transition-all flex items-center justify-center gap-2"
      type="button"
    >
      <X className="w-5 h-5" />
      Cancel
    </button>
    <button
      onClick={onSubmit}
      disabled={submitting}
      className="py-3 rounded-lg font-medium bg-[var(--secondary-100)] text-white hover:bg-opacity-90 transition-all flex items-center justify-center gap-2"
      type="button"
    >
      <Check className="w-5 h-5" />
      {submitting ? 'Adding...' : 'Add Expense'}
    </button>
  </div>
);

// Recent Expense Item
const RecentExpenseItem = ({ expense }: any) => (
  <div className="bg-[var(--primary-200)] rounded-xl p-4 flex items-center justify-between hover:bg-opacity-80 transition-all cursor-pointer">
    <div className="flex items-center gap-4">
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center"
        style={{ backgroundColor: expense.iconBg + '30' }}
      >
        <ExpenseIcon type={expense.icon} className="w-6 h-6" />
      </div>
      <div>
        <h4 className="text-white font-medium">{expense.name}</h4>
        <p className="text-[var(--tertiary-500)] text-sm">{expense.time}</p>
      </div>
    </div>
    <p className="text-white font-semibold text-lg">${Number(expense.amount).toFixed(2)}</p>
  </div>
);

// Recent Expenses Section
const RecentExpensesSection = ({ expenses }: any) => (
  <div className="bg-[var(--primary-100)] rounded-2xl p-6">
    <div className="flex items-center justify-between mb-5">
      <h3 className="text-xl font-semibold text-white">Recent Expenses</h3>
      <button className="text-[var(--secondary-100)] text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all">
        View All
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>

    <div className="space-y-3">
      {expenses.map((expense: any) => (
        <RecentExpenseItem key={expense.id} expense={expense} />
      ))}
    </div>
  </div>
);

// helper to choose icon type based on name/notes
const pickIconType = (name: string, notes?: string) => {
  const n = (name ?? '').toLowerCase();
  const txt = (notes ?? '').toLowerCase();
  if (n.includes('fuel') || txt.includes('fuel')) return 'fuel';
  if (n.includes('groc') || txt.includes('groc') || n.includes('grocery') || txt.includes('grocery')) return 'grocery';
  if (n.includes('rest') || n.includes('restaurant') || txt.includes('rest') || txt.includes('restaurant')) return 'restaurant';
  return 'restaurant';
};


const allowedCategories = [
  "Rent",
  "Utility",
  "Equipment Purchase",
  "Maintenance",
  "Salaries",
  "Training",
  "Supplies",
  "Insurance",
  "Others",
];

type CategoryOption = { _id?: string | number; id?: string | number; name: string; } & Record<string, any>;

type SelectOption = string | { id?: any; _id?: any; name: string }; type SelectProps = { label: string; required?: boolean; options: SelectOption[]; value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; placeholder?: string; };

const Select: React.FC<SelectProps> = ({
  label,
  required,
  options,
  value,
  onChange,
  placeholder,
}) => {
  // Filter options to only allowed categories
  const filteredOptions = options.filter((option) => {
    const name = typeof option === "string" ? option : (option as CategoryOption).name;
    return allowedCategories.includes(name);
  });

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-white">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        value={value}
        onChange={onChange}
        className={`w-full px-4 py-2.5 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
    ${value ? "text-white" : "text-gray-400"}
    appearance-none bg-[var(--primary-200)] cursor-pointer`}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236B7280' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 1rem center",
        }}
      >
        <option value="">{placeholder}</option>
        {filteredOptions.map((option, index) => (
          <option
            key={index}
            value={
              typeof option === "string"
                ? option
                : String((option as CategoryOption)._id ?? (option as any).id ?? (option as any).name ?? index)
            }
          >
            {typeof option === "string" ? option : (option as any).name}
          </option>
        ))}
      </select>
    </div>
  );
};



// Main Component
const AddExpense = () => {
  const [formData, setFormData] = useState({
    expenseName: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
    category: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [recentExpenses, setRecentExpenses] = useState<any[]>(expenseFormConfig.recentExpenses);

  // CustomAlert state (toast)
  const [toastOpen, setToastOpen] = useState(false);
  const [toastText, setToastText] = useState('');
  const [toastSeverity, setToastSeverity] = useState<'success' | 'error' | 'warning' | 'info'>('success');

  const showToast = (text: string, severity: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    setToastText(text);
    setToastSeverity(severity);
    setToastOpen(true);
  };
  const handleToastClose = () => setToastOpen(false);

  const handleInputChange = (field: string) => (e: any) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleQuickAmount = (amount: number) => {
    setFormData(prev => ({ ...prev, amount: amount.toString() }));
  };

  // Load recent expenses from API on mount
  useEffect(() => {
    let mounted = true;
    const loadRecent = async () => {
      try {
        const res = await apiRequest<{ message: string; data: any[] }>({
          method: 'GET',
          endpoint: '/expense/getExpense'
        });

        const list = Array.isArray(res?.data) ? res.data : [];

        if (list.length === 0) {
          // fallback
          return;
        }

        const mapped = list
          .slice(-10)
          .map((it: any) => {
            const id = it._id ?? it.id ?? Date.now();
            const name = it.name ?? 'Expense';
            const amount = it.amount ?? 0;
            const time = it.date ? new Date(it.date).toLocaleString() : '';
            const icon = pickIconType(it.name, it.notes);
            const iconBg =
              icon === 'fuel'
                ? 'var(--tertiary-400)'
                : icon === 'grocery'
                  ? 'var(--tertiary-300)'
                  : 'var(--tertiary-200)';
            return { id, name, amount, time, icon, iconBg };
          });

        if (mounted) setRecentExpenses(mapped);
      } catch (err) {
        console.error('Failed to load recent expenses', err);
        // Non-fatal: show a friendly toast so user knows recent list couldn't be loaded
        showToast('Could not load recent expenses. You can still add a new expense.', 'info');
      }
    };
    loadRecent();
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async () => {
    // client-side validation with friendly messages
    if (!formData.expenseName.trim()) {
      showToast('Please enter a name for the expense (for example: Grocery, Fuel).', 'warning');
      return;
    }
    if (!formData.amount || Number(formData.amount) <= 0) {
      showToast('Please enter an amount greater than 0.', 'warning');
      return;
    }
    if (!formData.date) {
      showToast('Please select a date for this expense.', 'warning');
      return;
    }
    // ensure category selected and is allowed
    if (!formData.category || !allowedCategories.includes(formData.category)) {
      showToast('Please select a category from the list.', 'warning');
      return;
    }

    setSubmitting(true);
    const role = localStorage.getItem("role")
    const userString = localStorage.getItem("user")
    const user = userString ? JSON.parse(userString) : {}

    const userId = role === "Admin" ? user?.id : user?.createdBy
    try {
      const payload = {
        name: formData.expenseName,
        amount: Number(parseFloat(String(formData.amount)).toFixed(2)),
        date: formData.date,
        notes: formData.notes,
        currentUser: localStorage.getItem("role"),
        createdBy: userId,
        category: formData.category.toLowerCase() || ""
      };

      const res = await apiRequest<{ message: string; data: any }>({
        method: 'POST',
        endpoint: '/expense/addExpense',
        body: payload
      });

      const returned = (res && res.data) ? res.data : {
        id: Date.now(),
        name: payload.name,
        date: payload.date,
        amount: payload.amount
      };

      const displayItem = {
        id: returned._id ?? returned.id ?? Date.now(),
        name: returned.name ?? payload.name,
        time: returned.date ?? payload.date,
        amount: returned.amount ?? payload.amount,
        icon: pickIconType(returned.name ?? payload.name, returned.notes ?? payload.notes),
        iconBg: 'var(--tertiary-200)'
      };

      setRecentExpenses(prev => [displayItem, ...prev].slice(0, 10));

      setFormData({
        expenseName: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        notes: '',
        category: ''
      });

      // Friendly success message for laymen
      const friendly = res?.message && typeof res.message === 'string'
        ? res.message
        : 'Expense recorded successfully.';

      showToast(friendly, 'success');
    } catch (err: any) {
      console.error('Failed to add expense', err);

      // Map common backend / network errors to friendly messages
      const status = err?.response?.status ?? err?.status ?? null;
      const backendMsg = (err?.response?.data?.message || err?.message || '').toString().toLowerCase();

      if (status === 400) {
        if (backendMsg.includes('invalid') || backendMsg.includes('bad')) {
          showToast('We could not save that expense because some information looks incorrect. Please check and try again.', 'error');
        } else {
          showToast('Could not save the expense. Please check the details and try again.', 'error');
        }
      } else if (status === 401) {
        showToast('You are not allowed to add expenses. Please sign in with an account that has permission.', 'error');
      } else if (status === 404) {
        showToast('Could not find the server resource. Try again later or contact support.', 'error');
      } else if (status === 500) {
        showToast('Something went wrong on our side. Please try again in a few minutes.', 'error');
      } else if (backendMsg.includes('network') || backendMsg.includes('failed to fetch')) {
        showToast('Cannot reach our servers. Check your internet connection and try again.', 'error');
      } else {
        showToast('Unable to save the expense. Please try again.', 'error');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      expenseName: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      notes: '',
      category: ''
    });
  };

  return (
    <div className="min-h-screen w-full bg-[var(--primary-200)] p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-[var(--primary-100)] rounded-2xl p-6 sm:p-8 mb-6">
          <FormHeader
            icon={<FileText className="w-6 h-6 text-white" />}
            title="Expense Details"
            subtitle="Fill in the information below"
          />

          <InputField
            label="Expense Name"
            required
            placeholder={expenseFormConfig.placeholders.expenseName}
            value={formData.expenseName}
            onChange={handleInputChange('expenseName')}
            icon={Tag}
          />

          <AmountDateRow
            amount={formData.amount}
            onAmountChange={handleInputChange('amount')}
            date={formData.date}
            onDateChange={handleInputChange('date')}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">

            <Select
              label="Category"
              required
              placeholder="Select Category"
              options={allowedCategories}
              value={formData.category}
              onChange={handleInputChange("category")}

            />
          </div>

          <TextareaField
            label="Notes"
            optional
            placeholder={expenseFormConfig.placeholders.notes}
            value={formData.notes}
            onChange={handleInputChange('notes')}
            icon={FileText}
          />

          <QuickAmountButtons
            amounts={expenseFormConfig.quickAmounts}
            onSelect={handleQuickAmount}
            selectedAmount={parseFloat(formData.amount || '0')}
          />

          <ActionButtons
            onCancel={handleCancel}
            onSubmit={handleSubmit}
            submitting={submitting}
          />
        </div>

        <RecentExpensesSection expenses={recentExpenses} />
      </div>

      {/* CustomAlert: user-facing friendly messages */}
      <CustomAlert
        text={toastText}
        severity={toastSeverity}
        open={toastOpen}
        onClose={handleToastClose}
      />
    </div>
  );
};

export default AddExpense;
