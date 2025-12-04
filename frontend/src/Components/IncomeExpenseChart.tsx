// src/components/IncomeExpenseChart.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
// import { Menu } from 'lucide-react';

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

// Updated Legend Component — interactive and accessible.
// Props:
// - hoveredSeries: 'income' | 'expense' | null (transient hover)
// - selectedSeries: 'income' | 'expense' | null (clicked while mouse inside)
// - onHover: (series | null) => void
// - onToggle: (series) => void
type ChartLegendProps = {
  hoveredSeries: "income" | "expense" | null;
  selectedSeries: "income" | "expense" | null;
  onHover: (s: "income" | "expense" | null) => void;
  onToggle: (s: "income" | "expense") => void;
};
const ChartLegend: React.FC<ChartLegendProps> = ({ hoveredSeries, selectedSeries, onHover, onToggle }) => {
  const effective = selectedSeries ?? hoveredSeries;

  const handleKey = (e: React.KeyboardEvent, series: "income" | "expense") => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onToggle(series);
    }
  };

  // returns circle style: always visible, but lowered opacity when it's not the active one while some active exists
  const circleStyle = (series: "income" | "expense") => {
    if (!effective) {
      return {};
    }
    return {
      opacity: effective === series ? 1 : 0.45, // lower but not fully disappeared
      transition: 'opacity 160ms ease',
    } as React.CSSProperties;
  };

  // label opacity when dimmed
  const labelStyle = (series: "income" | "expense") => {
    if (!effective) return {};
    return { opacity: effective === series ? 1 : 0.6, transition: 'opacity 160ms ease' } as React.CSSProperties;
  };

  return (
    <div className="flex items-center gap-3 sm:gap-6">
      {/* Income legend item */}
      <div
        role="button"
        aria-pressed={selectedSeries === "income"}
        tabIndex={0}
        onMouseEnter={() => onHover("income")}
        onMouseLeave={() => onHover(null)}
        onFocus={() => onHover("income")}
        onBlur={() => onHover(null)}
        onClick={() => onToggle("income")}
        onKeyDown={(e) => handleKey(e, "income")}
        className="flex items-center gap-2 cursor-pointer outline-none"
        title="Income — hover or click to highlight"
      >
        <div
          className="w-3 h-3 rounded-full bg-emerald-400"
          style={circleStyle("income")}
          aria-hidden
        />
        <span className="text-slate-300 text-xs sm:text-sm font-medium" style={labelStyle("income")}>Income</span>
      </div>

      {/* Expense legend item */}
      <div
        role="button"
        aria-pressed={selectedSeries === "expense"}
        tabIndex={0}
        onMouseEnter={() => onHover("expense")}
        onMouseLeave={() => onHover(null)}
        onFocus={() => onHover("expense")}
        onBlur={() => onHover(null)}
        onClick={() => onToggle("expense")}
        onKeyDown={(e) => handleKey(e, "expense")}
        className="flex items-center gap-2 cursor-pointer outline-none"
        title="Expense — hover or click to highlight"
      >
        <div
          className="w-3 h-3 rounded-full bg-red-400"
          style={circleStyle("expense")}
          aria-hidden
        />
        <span className="text-slate-300 text-xs sm:text-sm font-medium" style={labelStyle("expense")}>Expense</span>
      </div>
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

  // transient hover state and clicked state (but clicked resets when mouse leaves container per requirement)
  const [hoveredSeries, setHoveredSeries] = useState<"income" | "expense" | null>(null);
  const [selectedSeries, setSelectedSeries] = useState<"income" | "expense" | null>(null);

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


  // ----- Interaction helpers (legend hover + click) -----
  // Hover (transient) handler from legend
  const handleLegendHover = (series: "income" | "expense" | null) => {
    setHoveredSeries(series);
  };

  // Click/toggle from legend
  const toggleLegendClick = (series: "income" | "expense") => {
    setSelectedSeries((prev) => (prev === series ? null : series));
  };

  // determine fillOpacity for a series based on hovered/selected state
  const effective = selectedSeries ?? hoveredSeries;
  const getOpacity = (series: "income" | "expense") => {
    if (!effective) return 1;
    return effective === series ? 1 : 0.35; // other bar low opacity
  };

  // wrapper-level mouse leave: per requirement, when mouse is outside state should reset to normal
  const handleContainerMouseLeave = () => {
    setHoveredSeries(null);
    setSelectedSeries(null);
  };

  return (
    <div className="w-full h-full lg:min-h-screen bg-slate-800 flex items-center justify-center p-0 sm:p-6 lg:p-8">
      <div
        className="w-full max-w-6xl bg-[var(--primary-100)] rounded-2xl p-4 sm:p-6 lg:p-8"
        onMouseLeave={handleContainerMouseLeave} // reset when mouse leaves the whole area
      >

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

        {/* Legend (interactive) */}
        <div className="flex justify-start sm:justify-end mb-4 sm:mb-6">
          <ChartLegend
            hoveredSeries={hoveredSeries}
            selectedSeries={selectedSeries}
            onHover={handleLegendHover}
            onToggle={toggleLegendClick}
          />
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

              {/* Expense Bar */}
              <Bar
                dataKey="expense"
                stackId="a"
                fill="#f87171"
                radius={[0, 0, 8, 8]}
                fillOpacity={getOpacity("expense")}
              />

              {/* Income Bar */}
              <Bar
                dataKey="income"
                stackId="a"
                fill="var(--tertiary-300)"
                radius={[8, 8, 0, 0]}
                fillOpacity={getOpacity("income")}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  );
};


export default IncomeExpenseChart;
