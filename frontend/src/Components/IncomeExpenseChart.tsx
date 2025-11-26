// src/components/IncomeExpenseChart.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { Menu } from 'lucide-react';

// Data types
type DataPoint = {
  name: string;
  income: number;
  expense: number;
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
          className={`px-4 sm:px-6 py-2 rounded-md font-medium text-xs sm:text-sm transition-all ${activePeriod === period
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

interface IncomeExpenseChartProps {
  data: any;
}
// Main Chart Component
const IncomeExpenseChart: React.FC<IncomeExpenseChartProps> = ({ data }) => {

  // 1️⃣ Load last period from localStorage (if exists)
  const [activePeriod, setActivePeriod] = useState<string>(() => {
    return localStorage.getItem("incomeExpensePeriod") || "Month";
  });

  // 2️⃣ Save to localStorage whenever user changes period
  useEffect(() => {
    localStorage.setItem("incomeExpensePeriod", activePeriod);
  }, [activePeriod]);

  const periods = ["Month", "Week", "Day"];

  const hasUsefulBackendValues = useMemo<boolean>(() => {
    if (!data) return false;
    const rev = Number(data.revenueThisMonth ?? 0);
    const exp = Number(data.expense ?? 0);
    return rev !== 0 || exp !== 0;
  }, [data]);


  // 3️⃣ Chart data logic
  const currentData: DataPoint[] = useMemo(() => {
    if (hasUsefulBackendValues) {
      const income = Number(data?.revenueThisMonth ?? 0);
      const expense = Number(data?.expense ?? 0);

      if (activePeriod === "Month") {
        return [
          { name: "Week 1", income, expense },
          { name: "Week 2", income, expense },
          { name: "Week 3", income, expense },
          { name: "Week 4", income, expense },
        ];
      }

      if (activePeriod === "Week") {
        const perDayIncome = income / 7;
        const perDayExpense = expense / 7;
        return [
          { name: "Mon", income: perDayIncome, expense: perDayExpense },
          { name: "Tue", income: perDayIncome, expense: perDayExpense },
          { name: "Wed", income: perDayIncome, expense: perDayExpense },
          { name: "Thu", income: perDayIncome, expense: perDayExpense },
          { name: "Fri", income: perDayIncome, expense: perDayExpense },
          { name: "Sat", income: perDayIncome, expense: perDayExpense },
          { name: "Sun", income: perDayIncome, expense: perDayExpense },
        ];
      }

      const perSlotIncome = income / 6;
      const perSlotExpense = expense / 6;
      return [
        { name: "6am", income: perSlotIncome, expense: perSlotExpense },
        { name: "9am", income: perSlotIncome, expense: perSlotExpense },
        { name: "12pm", income: perSlotIncome, expense: perSlotExpense },
        { name: "3pm", income: perSlotIncome, expense: perSlotExpense },
        { name: "6pm", income: perSlotIncome, expense: perSlotExpense },
        { name: "9pm", income: perSlotIncome, expense: perSlotExpense },
      ];
    }

    return [];
  }, [data, activePeriod, hasUsefulBackendValues]);


  const maxValue = Math.max(
    ...currentData.map((item) => Number(item.income) + Number(item.expense)),
    0
  );
  const yAxisMax = Math.ceil(maxValue / 1000) * 1000 || 1000;


  return (
    <div className="w-full h-full lg:min-h-screen bg-slate-800 flex items-center justify-center p-0 sm:p-6 lg:p-8">
      <div className="w-full max-w-6xl bg-[var(--primary-100)] rounded-2xl p-4 sm:p-6 lg:p-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
          <h1 className="text-white text-2xl sm:text-3xl font-bold">
            Income vs Expense
          </h1>

          <TimePeriodSelector
            periods={periods}
            activePeriod={activePeriod}
            onPeriodChange={setActivePeriod} // ⭐ persist automatically
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
                bottom: 5,
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
                  fill: "#94a3b8",
                  fontSize: window.innerWidth < 640 ? 11 : 14,
                }}
                axisLine={{ stroke: "#475569" }}
                tickLine={false}
                dy={10}
              />

              <YAxis
                stroke="#94a3b8"
                tick={{
                  fill: "#94a3b8",
                  fontSize: window.innerWidth < 640 ? 11 : 14,
                }}
                axisLine={{ stroke: "#475569" }}
                tickLine={false}
                domain={[0, yAxisMax]}
                ticks={[0, yAxisMax * 0.33, yAxisMax * 0.66, yAxisMax]}
                tickFormatter={(value) => `${(value / 1000).toFixed(1)}k`}
                dx={-10}
              />

              <Bar dataKey="expense" stackId="a" fill="#f87171" radius={[0, 0, 8, 8]} />
              <Bar dataKey="income" stackId="a" fill="var(--tertiary-300)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  );
};


export default IncomeExpenseChart;
