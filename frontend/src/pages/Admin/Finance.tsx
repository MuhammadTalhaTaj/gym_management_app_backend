// src/pages/Finance.tsx
import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from 'recharts';
import { Bell, TrendingUp, TrendingDown } from 'lucide-react';
import { apiRequest } from '../../config/api';
import Expense from './Expense';

type DashboardResponse = {
  revenueThisMonth?: number;
  expense?: number;
};
interface StatCardProps {
  title: string;
  amount: number;
  percentageChange: number;
  // trend?: string;     
  isExpense: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

type HoveredCategory = 'income' | 'expense' | null;

// Header Component
const Header = ({ user }: any) => (
  <header className="flex items-center justify-between px-6 py-5 bg-[var(--primary-200)] border-b border-gray-200">
    <h1 className="text-3xl font-bold text-[var(--primary-300)]">Finance Dashboard</h1>
    <div className="flex items-center gap-4">
      <button className="relative p-2 text-[var(--primary-300)] hover:bg-gray-100 rounded-lg transition-colors">
        <Bell size={24} />
      </button>
      <div className="flex items-center gap-3">
        {/* <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-full object-cover" /> */}
        <div className="hidden sm:block">
          <p className="text-sm font-semibold text-white">{user.name}</p>
          <p className="text-xs text-[var(--primary-300)]">{user.role}</p>
        </div>
      </div>
    </div>
  </header>
);

// Time Toggle Component
const TimeToggle = ({ activeView, onViewChange }: any) => {
  const views = ['Day', 'Week', 'Month'];

  return (
    <div className="flex bg-[var(--primary-200)] rounded-lg p-1 flex-wrap justify-center md:justify-start">
      {views.map((view) => (
        <button
          key={view}
          onClick={() => onViewChange(view)}
          className={`
            flex-1 md:flex-none
            min-w-[60px] md:min-w-0
            px-4 py-2
            rounded-md
            text-sm font-medium
            transition-all
            ${activeView === view
              ? 'bg-[var(--primary-100)] text-white shadow-sm'
              : 'text-gray-600 hover:text-[var(--primary-300)]'}
          `}
        >
          {view}
        </button>
      ))}
    </div>
  );
};


// Stat Card Component
const StatCard = ({ title, amount, percentageChange, isExpense, onMouseEnter, onMouseLeave }: StatCardProps) => {
  const bgColor = isExpense ? 'bg-red-50' : 'bg-green-50';
  const iconColor = isExpense ? 'text-red-600' : 'text-green-500';
  const textColor = isExpense ? 'text-red-500' : 'text-green-600';

  return (
    <div
      className="bg-[var(--primary-100)] rounded-2xl p-6 shadow-sm border border-gray-100"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="flex items-start gap-4">
        <div className={`${bgColor} rounded-full p-4`}>
          {isExpense ? <TrendingDown size={24} className={iconColor} /> : <TrendingUp size={24} className={iconColor} />}
        </div>
        <div>
          <p className="text-sm text-white mb-1">{title}</p>
          <h2 className="text-4xl font-bold text-[var(--primary-300)] mb-2 wrap-anywhere">
            ₨ {amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h2>
          <p className={`text-sm ${textColor} font-medium`}>+{percentageChange}% from last month</p>
        </div>
      </div>
    </div>
  );
};

// Income vs Expense Chart Component
const IncomeExpenseChart = ({
  data,
  hoveredCategory,
  setHoveredCategory,
}: {
  data: DashboardResponse | null;
  hoveredCategory: HoveredCategory;
  setHoveredCategory: (c: HoveredCategory) => void;
}) => {
  const [activeView, setActiveView] = useState('Month');

  const hasBackendData = useMemo(() => {
    if (!data) return false;
    return Number(data.revenueThisMonth ?? 0) !== 0 || Number(data.expense ?? 0) !== 0;
  }, [data]);

  const chartData = useMemo(() => {
    if (!hasBackendData) {
      // **Do not show fallback** — return empty dataset so chart shows no bars
      return [];
    }

    const income = Number(data?.revenueThisMonth ?? 0);
    const expense = Number(data?.expense ?? 0);

    if (activeView === 'Month') {
      return [
        { week: 'Week 1', Income: income, Expenses: expense },
        { week: 'Week 2', Income: income, Expenses: expense },
        { week: 'Week 3', Income: income, Expenses: expense },
        { week: 'Week 4', Income: income, Expenses: expense },
      ];
    }

    if (activeView === 'Week') {
      const perDayIncome = income / 7;
      const perDayExpense = expense / 7;
      return [
        { week: 'Mon', Income: perDayIncome, Expenses: perDayExpense },
        { week: 'Tue', Income: perDayIncome, Expenses: perDayExpense },
        { week: 'Wed', Income: perDayIncome, Expenses: perDayExpense },
        { week: 'Thu', Income: perDayIncome, Expenses: perDayExpense },
        { week: 'Fri', Income: perDayIncome, Expenses: perDayExpense },
        { week: 'Sat', Income: perDayIncome, Expenses: perDayExpense },
        { week: 'Sun', Income: perDayIncome, Expenses: perDayExpense },
      ];
    }

    const perSlotIncome = income / 6;
    const perSlotExpense = expense / 6;
    return [
      { week: '6am', Income: perSlotIncome, Expenses: perSlotExpense },
      { week: '9am', Income: perSlotIncome, Expenses: perSlotExpense },
      { week: '12pm', Income: perSlotIncome, Expenses: perSlotExpense },
      { week: '3pm', Income: perSlotIncome, Expenses: perSlotExpense },
      { week: '6pm', Income: perSlotIncome, Expenses: perSlotExpense },
      { week: '9pm', Income: perSlotIncome, Expenses: perSlotExpense },
    ];
  }, [data, activeView, hasBackendData]);

  // Determine opacity based on hoveredCategory:
  const incomeOpacity = hoveredCategory === 'expense' ? 0.3 : 1;
  const expenseOpacity = hoveredCategory === 'income' ? 0.3 : 1;

  // Custom legend renderer so we can attach hover handlers to colored boxes inside the chart
  const renderLegend = (props: any) => {
    const { payload } = props;
    if (!payload || !Array.isArray(payload)) return null;

    // Keep the legend layout similar to Recharts default but allow hover
    return (
      <div style={{ display: 'flex', gap: 16, paddingTop: 20 }}>
        {payload.map((entry: any) => {
          const label = entry.value;
          // entry.color or entry.payload.fill might contain the color depending on recharts version
          const color = entry.color ?? entry.payload?.fill ?? (label === 'Income' ? '#4ade80' : '#f87171');
          const category: HoveredCategory = label === 'Income' ? 'income' : 'expense';

          return (
            <div
              key={label}
              onMouseEnter={() => setHoveredCategory(category)}
              onMouseLeave={() => setHoveredCategory(null)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'default' }}
            >
              <span
                style={{
                  display: 'inline-block',
                  width: 12,
                  height: 12,
                  borderRadius: 2,
                  background: color,
                }}
              />
              <span style={{ color: 'white', fontSize: 14 }}>{label}</span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="bg-[var(--primary-100)] rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 mb-6">
        <h3 className="text-xl font-bold text-[var(--primary-300)]">
          Income vs. Expense
        </h3>

        <TimeToggle activeView={activeView} onViewChange={setActiveView} />
      </div>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={chartData} barSize={60}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
          <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: '#8C9BB0', fontSize: 14 }} />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#8C9BB0', fontSize: 14 }}
            tickFormatter={(value) => `$${value}`}
          />
          {/* Use custom legend so its colored boxes respond to hover */}
          <Legend content={renderLegend} />
          <Bar dataKey="Income" fill="#4ade80" radius={[8, 8, 0, 0]} fillOpacity={incomeOpacity} />
          <Bar dataKey="Expenses" fill="#f87171" radius={[8, 8, 0, 0]} fillOpacity={expenseOpacity} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// Main Finance Dashboard
const Finance = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(null);

  // Hover state for chart legend controlling chart opacity
  const [hoveredCategory, setHoveredCategory] = useState<HoveredCategory>(null);

  useEffect(() => {
    const fetchData = async () => {
      const role = localStorage.getItem("role");
      const storedUser = localStorage.getItem("user");
      let parsedUser: any = null;
      try {
        parsedUser = storedUser ? JSON.parse(storedUser) : null;
      } catch {
        parsedUser = null;
      }

      const userId = role === "Admin"
        ? localStorage.getItem("userId")
        : parsedUser?.createdBy;

      try {
        const res = await apiRequest({
          method: 'GET',
          endpoint: '/auth/dashboard/' + userId,
        });
        setDashboardData(res);
      } catch (err) {
        console.error(err);
        // keep dashboardData null on error (DO NOT show static data)
        setDashboardData(null);
      }
    };
    fetchData();
  }, []);

  const handleAddIncome = () => navigate('/addpayment');
  const handleAddExpense = () => navigate('/addexpense');

  // Fallback user info for header (unchanged visual)
  // Load user data from localStorage
  const storedUser = localStorage.getItem("user");
  let parsedUser: any = null;

  try {
    parsedUser = storedUser ? JSON.parse(storedUser) : null;
  } catch {
    parsedUser = null;
  }

  const user = {
    name: parsedUser?.name || "User",
    role: localStorage.getItem("role") || "Staff",
  };


  // **Never use fallbackData for stats** — always derive from dashboardData or default to zeros
  const stats = {
    totalIncome: {
      amount: Number(dashboardData?.revenueThisMonth ?? 0),
      percentageChange: 0,
      trend: 'up'
    },
    totalExpenses: {
      amount: Number(dashboardData?.expense ?? 0),
      percentageChange: 0,
      trend: 'up'
    }
  };

  return (
    <div className="min-h-screen w-full bg-[var(--primary-200)] ">
      <Header user={user} />
      <main className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h2 className="text-2xl font-bold text-[var(--primary-300)]">Monthly Overview</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-1 space-y-6">
            <StatCard
              title="Total Income"
              amount={stats.totalIncome.amount}
              percentageChange={stats.totalIncome.percentageChange}
              // trend={stats.totalIncome.trend}
              isExpense={false}
            />
            <StatCard
              title="Total Expenses"
              amount={stats.totalExpenses.amount}
              percentageChange={stats.totalExpenses.percentageChange}
              // trend={stats.totalExpenses.trend}
              isExpense={true}
            />
          </div>

          <div className="lg:col-span-2">
            {/* pass hoveredCategory and setter into chart so legend boxes control opacity */}
            <IncomeExpenseChart
              data={dashboardData}
              hoveredCategory={hoveredCategory}
              setHoveredCategory={setHoveredCategory}
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleAddIncome}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-xl font-semibold text-base shadow-lg transition-all flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            + Add Income (Admission/Renewal)
          </button>
          <button
            onClick={handleAddExpense}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-4 rounded-xl font-semibold text-base shadow-lg transition-all flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            − Add Expense (Salary, Utilities)
          </button>
        </div>
      </main>
      <Expense />
    </div>
  );
};

export default Finance;
