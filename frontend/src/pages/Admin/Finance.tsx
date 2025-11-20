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
}

// Static fallback data
const fallbackData = {
  stats: {
    totalIncome: { amount: 12480.5, percentageChange: 15, trend: 'up' },
    totalExpenses: { amount: 7820.0, percentageChange: 8, trend: 'up' },
  },
  chartData: [
    { week: 'Week 1', Income: 2600, Expenses: 1800 },
    { week: 'Week 2', Income: 3200, Expenses: 2200 },
    { week: 'Week 3', Income: 2800, Expenses: 1900 },
    { week: 'Week 4', Income: 4200, Expenses: 2000 },
  ],
};

// Header Component
const Header = ({ user }:any) => (
  <header className="flex items-center justify-between px-6 py-5 bg-[var(--primary-200)] border-b border-gray-200">
    <h1 className="text-3xl font-bold text-[var(--primary-300)]">Finance Dashboard</h1>
    <div className="flex items-center gap-4">
      <button className="relative p-2 text-[var(--primary-300)] hover:bg-gray-100 rounded-lg transition-colors">
        <Bell size={24} />
      </button>
      <div className="flex items-center gap-3">
        <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-full object-cover" />
        <div className="hidden sm:block">
          <p className="text-sm font-semibold text-white">{user.name}</p>
          <p className="text-xs text-[var(--primary-300)]">{user.role}</p>
        </div>
      </div>
    </div>
  </header>
);

// Time Toggle Component
const TimeToggle = ({ activeView, onViewChange }:any) => {
  const views = ['Day', 'Week', 'Month'];
  return (
    <div className="inline-flex bg-[var(--primary-200)] rounded-lg p-1">
      {views.map((view) => (
        <button
          key={view}
          onClick={() => onViewChange(view)}
          className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
            activeView === view ? 'bg-[var(--primary-100)] text-white shadow-sm' : 'text-gray-600 hover:text-[var(--primary-300)]'
          }`}
        >
          {view}
        </button>
      ))}
    </div>
  );
};

// Stat Card Component
const StatCard = ({ title, amount, percentageChange, isExpense } : StatCardProps) => {
  const bgColor = isExpense ? 'bg-red-50' : 'bg-green-50';
  const iconColor = isExpense ? 'text-red-600' : 'text-green-500';
  const textColor = isExpense ? 'text-red-500' : 'text-green-600';

  return (
    <div className="bg-[var(--primary-100)] rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-start gap-4">
        <div className={`${bgColor} rounded-full p-4`}>
          {isExpense ? <TrendingDown size={24} className={iconColor} /> : <TrendingUp size={24} className={iconColor} />}
        </div>
        <div>
          <p className="text-sm text-white mb-1">{title}</p>
          <h2 className="text-4xl font-bold text-[var(--primary-300)] mb-2">
            ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h2>
          <p className={`text-sm ${textColor} font-medium`}>+{percentageChange}% from last month</p>
        </div>
      </div>
    </div>
  );
};

// Income vs Expense Chart Component
const IncomeExpenseChart = ({ data }: { data: DashboardResponse | null }) => {

  const [activeView, setActiveView] = useState('Month');

  const hasBackendData = useMemo(() => {
    if (!data) return false;
    return Number(data.revenueThisMonth ?? 0) !== 0 || Number(data.expense ?? 0) !== 0;
  }, [data]);

  const chartData = useMemo(() => {
    const income = Number(data?.revenueThisMonth ?? 0);
    const expense = Number(data?.expense ?? 0);

    if (hasBackendData) {
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
    }
    return fallbackData.chartData;
  }, [data, activeView, hasBackendData]);

  return (
    <div className="bg-[var(--primary-100)] rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-[var(--primary-300)]">Income vs. Expense</h3>
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
          <Legend
            iconType="square"
            wrapperStyle={{ paddingTop: '20px' }}
            formatter={(value) => <span style={{ color: '#374151', fontSize: '14px', marginLeft: '8px' }}>{value}</span>}
          />
          <Bar dataKey="Income" fill="#4ade80" radius={[8, 8, 0, 0]} />
          <Bar dataKey="Expenses" fill="#f87171" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// Main Finance Dashboard
const Finance = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await apiRequest({
          method: 'GET',
          endpoint: '/auth/dashboard',
        });
        setDashboardData(res);
      } catch (err) {
        console.error(err);
        setDashboardData(null);
      }
    };
    fetchData();
  }, []);

  const handleAddIncome = () => navigate('/addpayment');
  const handleAddExpense = () => navigate('/addexpense');

  // Fallback user info
  const user = {
    name: 'Eleanor Pena',
    role: 'Administrator',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
  };

  // Fallback stats
  const stats = dashboardData
    ? {
        totalIncome: { amount: Number(dashboardData.revenueThisMonth ?? fallbackData.stats.totalIncome.amount), percentageChange: 15, trend: 'up' },
        totalExpenses: { amount: Number(dashboardData.expense ?? fallbackData.stats.totalExpenses.amount), percentageChange: 8, trend: 'up' },
      }
    : fallbackData.stats;

  return (
    <div className="min-h-screen bg-[var(--primary-200)] ">
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
            <IncomeExpenseChart data={dashboardData} />
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
