// src/pages/Expense.tsx
import { useEffect, useMemo, useState } from 'react';
import {
  DollarSign, Calendar, Receipt, BarChart3, Edit2, Trash2
} from 'lucide-react';
import { apiRequest } from '../../config/api'; // existing helper (keep path consistent with your project)

// interface TimePeriodSelector {
//   periods: string[];
//   active: string;
//   onChange: (val: string) => void;
// }
interface FilterDropdownProps{
  value: any;
  options: string[];
  onChange: any;
}
interface PaginationProps{
  currentPage: number;
  totalPages: number;
  onPageChange : (p:number) => void;
}
interface ExpenseRowProps{
  expense: any;
  onEdit: (id: any) => void;
  onDelete: (id: any) => void;
}

// simple heuristics to pick an icon emoji and color from a name/notes
const pickIconAndColor = (name = '', notes = '') => {
  const txt = (name + ' ' + (notes || '')).toLowerCase();
  if (txt.includes('fuel') || txt.includes('gas') || txt.includes('taxi')) return { icon: '🚗', color: 'bg-[#F47117]', category: 'Transportation' };
  if (txt.includes('groc') || txt.includes('grocery') || txt.includes('super')) return { icon: '🛒', color: 'bg-[#11BF7F]', category: 'Groceries' };
  if (txt.includes('coffee') || txt.includes('restaurant') || txt.includes('lunch') || txt.includes('dinner') || txt.includes('cafe')) return { icon: '🍴', color: 'bg-[#3D8BF2]', category: 'Food & Dining' };
  if (txt.includes('movie') || txt.includes('ticket') || txt.includes('netflix') || txt.includes('concert')) return { icon: '🎬', color: 'bg-[#EC9A0E]', category: 'Entertainment' };
  if (txt.includes('shop') || txt.includes('amazon') || txt.includes('online')) return { icon: '🛍️', color: 'bg-[#11BF7F]', category: 'Shopping' };
  // fallback
  return { icon: '💸', color: 'bg-[#6B7280]', category: 'Other' };
};

// format date style like "Dec 15, 2024"
const formatDate = (isoOrDate : any) => {
  if (!isoOrDate) return '';
  const d = new Date(isoOrDate);
  if (Number.isNaN(d.getTime())) return String(isoOrDate);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

// Expense Row Component
const ExpenseRow = ({ expense, onEdit, onDelete }: ExpenseRowProps) => (
  <tr className="border-b border-[#8C9BB0]/10 hover:bg-[#344E75]/20 transition-all">
    <td className="py-4 px-4">
      <div className="flex items-center gap-3">
        <div className={`${expense.color} p-2 rounded-lg text-xl`}>
          {expense.icon}
        </div>
        <div>
          <p className="text-white font-medium">{expense.name}</p>
          <p className="text-[#94A3B8] text-sm">{expense.category}</p>
        </div>
      </div>
    </td>
    <td className="py-4 px-4 text-white font-semibold">₨ {Number(expense.amount || 0).toFixed(2)}</td>
    <td className="py-4 px-4 text-[#94A3B8]">{expense.date}</td>
    <td className="py-4 px-4 text-[#94A3B8]">{expense.notes}</td>
    {/* <td className="py-4 px-4">
      <div className="flex items-center gap-2">
        <button
          onClick={() => onEdit(expense.id)}
          className="p-2 hover:bg-[#344E75] rounded-lg transition-all text-[#94A3B8] hover:text-[#3D8BF2]"
        >
          <Edit2 className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(expense.id)}
          className="p-2 hover:bg-[#344E75] rounded-lg transition-all text-[#94A3B8] hover:text-[#F24949]"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </td> */}
  </tr>
);

// Pagination & FilterDropdown
const Pagination = ({ currentPage, totalPages, onPageChange }: PaginationProps) => (
  <div className="flex items-center gap-2">
    <button
      onClick={() => onPageChange(currentPage - 1)}
      disabled={currentPage === 1}
      className="p-2 rounded-lg bg-[#344E75] text-[#94A3B8] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
    >
      ‹
    </button>
    {[...Array(totalPages)].map((_, i) => (
      <button
        key={i + 1}
        onClick={() => onPageChange(i + 1)}
        className={`px-4 py-2 rounded-lg font-medium transition-all ${
          currentPage === i + 1
            ? 'bg-[#EC9A0E] text-[#1E293B]'
            : 'bg-[#344E75] text-[#94A3B8] hover:text-white'
        }`}
      >
        {i + 1}
      </button>
    ))}
    <button
      onClick={() => onPageChange(currentPage + 1)}
      disabled={currentPage === totalPages}
      className="p-2 rounded-lg bg-[#344E75] text-[#94A3B8] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
    >
      ›
    </button>
  </div>
);

const FilterDropdown = ({ value, options, onChange }:FilterDropdownProps) => (
  <div className="relative">
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="appearance-none bg-[#344E75] text-white px-4 py-2 pr-10 rounded-lg border border-[#8C9BB0]/20 focus:outline-none focus:border-[#EC9A0E] cursor-pointer"
    >
      {options.map(option => (
        <option key={option} value={option}>{option}</option>
      ))}
    </select>
    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#94A3B8]">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  </div>
);

// Main Dashboard Component (with data fetching, no fallback)
const Expense = () => {
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [timeFilter, setTimeFilter] = useState('Last 30 days');
  const [currentPage, setCurrentPage] = useState(1);

  // state holding the live dashboard data - start empty (no static fallback)
  const [state, setState] = useState({
    stats: [] as any[],
    categories: [] as any[],
    expenses: [] as any[]
  });
  const [, setLoading] = useState(false);

  // pagination config
  const PAGE_SIZE = 6;

  // fetch expenses from /Expense/getExpense and update UI data
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const res = await apiRequest({
          method: 'GET',
          endpoint: '/Expense/getExpense'
        });

        // expected backend shape: { message: "...", data: [ { _id, name, amount, notes, date }, ... ] }
        const list = Array.isArray(res?.data) ? res.data : [];

        if (!mounted) return;

        if (!Array.isArray(list) || list.length === 0) {
          // set empty state when backend returns nothing
          setState({ stats: [], categories: [], expenses: [] });
          setLoading(false);
          return;
        }

        // Map backend items to UI shape
        const mapped = list.map((it: any, idx: number) => {
          const { icon, color, category } = pickIconAndColor(it.name, it.notes);
          return {
            id: it._id ?? `bk-${idx}`,
            name: it.name ?? 'Expense',
            category: category,
            amount: Number(it.amount ?? 0),
            date: formatDate(it.date),
            notes: it.notes ?? '',
            icon,
            color
          };
        });

        // compute stats from fetched items
        const totalExpenses = mapped.reduce((s, x) => s + Number(x.amount || 0), 0);
        const now = new Date();

        // compute this month's total using original list dates
        const totalThisMonth = list.reduce((s: number, it: any) => {
          const d = it.date ? new Date(it.date) : null;
          if (!d || Number.isNaN(d.getTime())) return s;
          if (d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()) {
            return s + Number(it.amount ?? 0);
          }
          return s;
        }, 0);

        const totalTransactions = mapped.length;
        const daysSpan = 30;
        const avgPerDay = totalExpenses / daysSpan;

        // Prepare stats formatted as strings to match UI
        const stats = [
          {
            id: 1,
            icon: DollarSign,
            label: 'Total Expenses',
            value: `$${totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            change: '+0%',
            isPositive: true,
            bgColor: 'bg-[#344E75]'
          },
          {
            id: 2,
            icon: Calendar,
            label: 'This Month',
            value: `$${Number(totalThisMonth).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            change: '-0%',
            isPositive: false,
            bgColor: 'bg-[#344E75]'
          },
          {
            id: 3,
            icon: Receipt,
            label: 'Total Transactions',
            value: `${totalTransactions}`,
            change: '+0%',
            isPositive: true,
            bgColor: 'bg-[#344E75]'
          },
          {
            id: 4,
            icon: BarChart3,
            label: 'Avg per Day',
            value: `$${avgPerDay.toFixed(2)}`,
            change: '+0%',
            isPositive: true,
            bgColor: 'bg-[#344E75]'
          }
        ];

        // derive categories summary (group by category)
        const catMap: Record<string, any> = {};
        mapped.forEach((e) => {
          const k = e.category || 'Other';
          if (!catMap[k]) catMap[k] = { name: k, transactions: 0, amount: 0, icon: e.icon, color: e.color };
          catMap[k].transactions += 1;
          catMap[k].amount += Number(e.amount || 0);
        });
        const categories = Object.values(catMap).map((c: any, i: number) => {
          return {
            id: i + 1,
            name: c.name,
            transactions: c.transactions,
            amount: Math.round(c.amount * 100) / 100,
            percentage: 0, // compute below
            icon: c.icon,
            color: c.color
          };
        });

        // compute percentages
        const totalForCats = categories.reduce((s, c) => s + c.amount, 0) || 1;
        categories.forEach((c: any) => {
          c.percentage = Math.round((c.amount / totalForCats) * 100);
        });

        // Apply mapped results to state
        setState({
          stats,
          categories,
          expenses: mapped
        });
      } catch (err) {
        // on any error — set empty state (no static fallback)
        console.error('Failed to load expenses', err);
        if (mounted) setState({ stats: [], categories: [], expenses: [] });
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => { mounted = false; };
  }, []);

  // Reset current page if dataset changes (avoid invalid page)
  useEffect(() => {
    setCurrentPage(1);
  }, [state.expenses.length]);

  // handlers
  const handleEdit = (id :any) => {
    console.log('Edit expense:', id);
  };

  const handleDelete = (id : any) => {
    console.log('Delete expense:', id);
  };

  // derive paged expenses for display according to PAGE_SIZE
  const totalPages = Math.max(1, Math.ceil(state.expenses.length / PAGE_SIZE));
  const pagedExpenses = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return state.expenses.slice(start, start + PAGE_SIZE);
  }, [state.expenses, currentPage]);

  const showingStart = state.expenses.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const showingEnd = Math.min(currentPage * PAGE_SIZE, state.expenses.length);

  return (
    <div className="min-h-screen w-full bg-[#1E293B] p-4 md:p-6 lg:p-8">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Recent Expenses Table */}
        <div className="bg-[#344E75] rounded-xl border border-[#8C9BB0]/20 overflow-hidden">
          <div className="p-6 border-b border-[#8C9BB0]/20">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h2 className="text-xl font-bold text-white">Recent Expenses</h2>
              {/* <div className="flex flex-wrap items-center gap-3">
                <FilterDropdown
                  value={categoryFilter}
                  options={['All Categories', 'Food & Dining', 'Transportation', 'Shopping', 'Entertainment', 'Groceries', 'Other']}
                  onChange={setCategoryFilter}
                />
                <FilterDropdown
                  value={timeFilter}
                  options={['Last 30 days', 'Last 7 days', 'This month', 'Last month']}
                  onChange={setTimeFilter}
                />
              </div> */}
            </div>
          </div>

          {/* Table - Desktop */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full" role="table">
              <thead className="bg-[#1E293B]">
                <tr>
                  <th className="py-4 px-4 text-left text-[#94A3B8] font-semibold text-sm uppercase tracking-wider">Name</th>
                  <th className="py-4 px-4 text-left text-[#94A3B8] font-semibold text-sm uppercase tracking-wider">Amount</th>
                  <th className="py-4 px-4 text-left text-[#94A3B8] font-semibold text-sm uppercase tracking-wider">Date</th>
                  <th className="py-4 px-4 text-left text-[#94A3B8] font-semibold text-sm uppercase tracking-wider">Notes</th>
                  {/* <th className="py-4 px-4 text-left text-[#94A3B8] font-semibold text-sm uppercase tracking-wider">Actions</th> */}
                </tr>
              </thead>
              <tbody>
                {pagedExpenses.map(expense => (
                  <ExpenseRow
                    key={expense.id}
                    expense={expense}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
                {pagedExpenses.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-[#94A3B8]">No expenses to display</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Cards - Mobile */}
          <div className="md:hidden p-4 space-y-4">
            {pagedExpenses.map(expense => (
              <div key={expense.id} className="bg-[#1E293B] rounded-lg p-4 border border-[#8C9BB0]/10">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`${expense.color} p-2 rounded-lg text-xl`}>
                      {expense.icon}
                    </div>
                    <div>
                      <p className="text-white font-medium">{expense.name}</p>
                      <p className="text-[#94A3B8] text-sm">{expense.category}</p>
                    </div>
                  </div>
                  <p className="text-white font-bold">${Number(expense.amount).toFixed(2)}</p>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <p className="text-[#94A3B8]">{expense.date}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(expense.id)}
                      className="p-2 hover:bg-[#344E75] rounded-lg transition-all text-[#3D8BF2]"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(expense.id)}
                      className="p-2 hover:bg-[#344E75] rounded-lg transition-all text-[#F24949]"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-[#94A3B8] text-sm mt-2">{expense.notes}</p>
              </div>
            ))}
          </div>

          {/* Footer with Pagination */}
          <div className="p-6 border-t border-[#8C9BB0]/20 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-[#94A3B8] text-sm">
              Showing {showingStart} to {showingEnd} of {state.expenses.length} entries
            </p>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(p:any) => {
                if (p < 1) return;
                if (p > totalPages) return;
                setCurrentPage(p);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Expense;
