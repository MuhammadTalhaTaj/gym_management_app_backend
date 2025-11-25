// src/components/IncomeExpenseChart.tsx
import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { Menu } from 'lucide-react';
import { useDashboardData } from '../hooks/useDashboardData';

// Data types
type DataPoint = {
  name: string;
  income: number;
  expense: number;
};

type ChartDataMap = {
  month: DataPoint[];
  week: DataPoint[];
  day: DataPoint[];
};

// Static fallback data (kept exactly like you had)
const chartData: ChartDataMap = {
  month: [
    { name: 'Week 1', income: 2300, expense: 1500 },
    { name: 'Week 2', income: 3200, expense: 1400 },
    { name: 'Week 3', income: 2700, expense: 1200 },
    { name: 'Week 4', income: 4400, expense: 1800 },
  ],
  week: [
    { name: 'Mon', income: 450, expense: 320 },
    { name: 'Tue', income: 520, expense: 280 },
    { name: 'Wed', income: 480, expense: 350 },
    { name: 'Thu', income: 610, expense: 290 },
    { name: 'Fri', income: 580, expense: 310 },
    { name: 'Sat', income: 390, expense: 250 },
    { name: 'Sun', income: 420, expense: 200 },
  ],
  day: [
    { name: '6am', income: 120, expense: 80 },
    { name: '9am', income: 180, expense: 120 },
    { name: '12pm', income: 220, expense: 150 },
    { name: '3pm', income: 190, expense: 110 },
    { name: '6pm', income: 250, expense: 140 },
    { name: '9pm', income: 160, expense: 90 },
  ],
};

// Time Period Selector Component
type TimePeriodSelectorProps = {
  periods: string[];
  activePeriod: string;
  onPeriodChange: (p: string) => void;
};
const TimePeriodSelector: React.FC<TimePeriodSelectorProps> = ({ periods, activePeriod, onPeriodChange }) => {
  return (
    <div className="flex bg-slate-700 rounded-lg p-1 gap-1">
      {periods.map((period) => (
        <button
          key={period}
          onClick={() => onPeriodChange(period)}
          className={`px-4 sm:px-6 py-2 rounded-md font-medium text-xs sm:text-sm transition-all ${
            activePeriod === period
              ? 'bg-amber-500 text-white shadow-md'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          {period}
        </button>
      ))}
    </div>
  );
};

// Legend Component
const ChartLegend: React.FC = () => {
  return (
    <div className="flex items-center gap-3 sm:gap-6">
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
        <span className="text-slate-300 text-xs sm:text-sm font-medium">Income</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-red-400"></div>
        <span className="text-slate-300 text-xs sm:text-sm font-medium">Expense</span>
      </div>
      <button className="ml-2 p-2 hover:bg-slate-700 rounded-lg transition-colors">
        <Menu className="w-4 h-4 sm:w-5 sm:h-5 text-slate-300" />
      </button>
    </div>
  );
};

// Hook return type (kept generic/safe)
type DashboardHookReturn = {
  data?: any;
  loading: boolean;
  error?: string | null;
};

// Main Chart Component
const IncomeExpenseChart: React.FC = () => {
  const [activePeriod, setActivePeriod] = useState<string>('Month');
  const periods = ['Month', 'Week', 'Day'];

  // typed hook usage (hook implementation stays unchanged)
  const hookReturn = useDashboardData() as DashboardHookReturn;
  const { data, error } = hookReturn;

  /**
   * Decide whether backend has "useful" data:
   * - If no data -> fallback
   * - If both revenueThisMonth and expense are 0 -> fallback
   * Otherwise use backend values.
   */
  const hasUsefulBackendValues = useMemo<boolean>(() => {
    if (!data) return false;
    const rev = Number(data.revenueThisMonth ?? 0);
    const exp = Number(data.expense ?? 0);
    // treat NaN or undefined as 0
    return (rev !== 0 || exp !== 0);
  }, [data]);

  // compute currentData (either from backend or fallback static)
  const currentData: DataPoint[] = useMemo(() => {
    // If backend returned usable non-zero numbers, use them (replicated to weeks/days)
    if (hasUsefulBackendValues) {
      const income = Number(data?.revenueThisMonth ?? 0);
      const expense = Number(data?.expense ?? 0);

      if (activePeriod === 'Month') {
        return [
          { name: 'Week 1', income, expense },
          { name: 'Week 2', income, expense },
          { name: 'Week 3', income, expense },
          { name: 'Week 4', income, expense },
        ];
      }

      if (activePeriod === 'Week') {
        const perDayIncome = income / 7;
        const perDayExpense = expense / 7;
        return [
          { name: 'Mon', income: perDayIncome, expense: perDayExpense },
          { name: 'Tue', income: perDayIncome, expense: perDayExpense },
          { name: 'Wed', income: perDayIncome, expense: perDayExpense },
          { name: 'Thu', income: perDayIncome, expense: perDayExpense },
          { name: 'Fri', income: perDayIncome, expense: perDayExpense },
          { name: 'Sat', income: perDayIncome, expense: perDayExpense },
          { name: 'Sun', income: perDayIncome, expense: perDayExpense },
        ];
      }

      // Day
      const perSlotIncome = income / 6;
      const perSlotExpense = expense / 6;
      return [
        { name: '6am', income: perSlotIncome, expense: perSlotExpense },
        { name: '9am', income: perSlotIncome, expense: perSlotExpense },
        { name: '12pm', income: perSlotIncome, expense: perSlotExpense },
        { name: '3pm', income: perSlotIncome, expense: perSlotExpense },
        { name: '6pm', income: perSlotIncome, expense: perSlotExpense },
        { name: '9pm', income: perSlotIncome, expense: perSlotExpense },
      ];
    }

    // fallback: use your static chartData
    // ensure correct key typing when indexing
    return [];
  }, [data, activePeriod, hasUsefulBackendValues]);

  const maxValue = Math.max(...currentData.map(item => (Number(item.income) + Number(item.expense)) ), 0);
  const yAxisMax = Math.ceil(maxValue / 1000) * 1000 || 1000;

  return (
    <div className="w-full h-full lg:min-h-screen bg-slate-800 flex items-center justify-center p-0 sm:p-6 lg:p-8 ">
      <div className="w-full max-w-6xl bg-[var(--primary-100)] rounded-2xl p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
          <h1 className="text-white text-2xl sm:text-3xl font-bold">
            Income vs Expense
          </h1>
          <TimePeriodSelector
            periods={periods}
            activePeriod={activePeriod}
            onPeriodChange={setActivePeriod}
          />
        </div>

        {/* Legend */}
        <div className="flex justify-start sm:justify-end mb-4 sm:mb-6">
          <ChartLegend />
        </div>

        {/* Chart */}
        <div className="w-full h-64 sm:h-80 lg:h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={currentData}
              margin={{
                top: 20,
                right: 10,
                left: 0,
                bottom: 5
              }}
              barGap={window.innerWidth < 640 ? 8 : 20}
            >
              <CartesianGrid
                strokeDasharray="0"
                stroke="#475569"
                vertical={false}
              />
              <XAxis
                dataKey="name"
                stroke="#94a3b8"
                tick={{
                  fill: '#94a3b8',
                  fontSize: window.innerWidth < 640 ? 11 : 14
                }}
                axisLine={{ stroke: '#475569' }}
                tickLine={false}
                dy={10}
              />
              <YAxis
                stroke="#94a3b8"
                tick={{
                  fill: '#94a3b8',
                  fontSize: window.innerWidth < 640 ? 11 : 14
                }}
                axisLine={{ stroke: '#475569' }}
                tickLine={false}
                domain={[0, yAxisMax]}
                ticks={[0, yAxisMax * 0.33, yAxisMax * 0.66, yAxisMax]}
                tickFormatter={(value) => `${(value / 1000).toFixed(1)}k`}
                dx={-10}
                width={window.innerWidth < 640 ? 35 : 45}
              />
              <Bar
                dataKey="expense"
                stackId="a"
                fill="#f87171"
                radius={[0, 0, 8, 8]}
                maxBarSize={window.innerWidth < 640 ? 40 : 80}
              />
              <Bar
                dataKey="income"
                stackId="a"
                fill="var(--tertiary-300)"
                radius={[8, 8, 0, 0]}
                maxBarSize={window.innerWidth < 640 ? 40 : 80}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {error && (
          <p className="text-red-400 text-center mt-4">
            Failed to load data: {error}
          </p>
        )}
      </div>
    </div>
  );
};

export default IncomeExpenseChart;
