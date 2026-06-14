import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area,
} from "recharts";
import { TrendingUp, TrendingDown, Wallet, Plus, X, Eye, EyeOff } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useMonthlySummary, useSpendingByCategory, useMonthlyTrend } from "../hooks/useAnalytics";
import { api } from "../lib/api";

const now = new Date();
const MONTH = now.getMonth() + 1;
const YEAR = now.getFullYear();
const MONTH_NAMES = ["Sty", "Lut", "Mar", "Kwi", "Maj", "Cze", "Lip", "Sie", "Wrz", "Paź", "Lis", "Gru"];

const CHART_THEME = {
  grid: "#2a2a3a",
  text: "#8b8b9e",
  income: "#1db954",
  expense: "#e74c3c",
  accent: "#3b82f6",
  purple: "#8b5cf6",
  orange: "#f5a623",
  pink: "#ec4899",
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload) return null;
  return (
    <div className="bg-surface-alt border border-border rounded-lg px-4 py-3 shadow-xl">
      <p className="text-text-muted text-xs mb-1">{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} className="text-sm font-medium" style={{ color: entry.color }}>
          {entry.name}: {entry.value?.toFixed(2)} PLN
        </p>
      ))}
    </div>
  );
};

interface BudgetSummaryItem {
  id: string;
  categoryId: string;
  amount: number;
  spent: number;
  remaining: number;
  percentUsed: number;
}

interface TopExpense {
  id: string;
  amount: string;
  description: string;
  date: string;
  categoryId: string;
}

interface QuickAnalysis {
  predictedExpenses: number;
  categorySpending: {
    categoryName: string;
    isProtected: boolean;
    monthlyAverage: number;
    trend: number;
  }[];
}

type ChartId = "summary" | "bar" | "pie" | "line" | "top" | "compare" | "budgets" | "prediction";

interface ChartConfig {
  id: ChartId;
  label: string;
  color: string;
}

const ALL_CHARTS: ChartConfig[] = [
  { id: "summary", label: "Podsumowanie", color: CHART_THEME.income },
  { id: "bar", label: "Przychody vs Wydatki", color: CHART_THEME.accent },
  { id: "pie", label: "Wydatki wg kategorii", color: CHART_THEME.orange },
  { id: "line", label: "Trend miesięczny", color: CHART_THEME.purple },
  { id: "top", label: "Największe wydatki", color: CHART_THEME.expense },
  { id: "compare", label: "Porównanie miesięcy", color: CHART_THEME.pink },
  { id: "budgets", label: "Realizacja budżetów", color: CHART_THEME.income },
  { id: "prediction", label: "Predykcja AI", color: CHART_THEME.purple },
];

const DEFAULT_CHARTS: ChartId[] = ["summary", "bar", "pie"];

export default function DashboardPage() {
  const [visibleCharts, setVisibleCharts] = useState<ChartId[]>(DEFAULT_CHARTS);
  const [showPicker, setShowPicker] = useState(false);

  const { data: summary, isLoading } = useMonthlySummary(MONTH, YEAR);
  const { data: spending } = useSpendingByCategory(MONTH, YEAR);
  const { data: trend } = useMonthlyTrend(6);
  const { data: topExpenses } = useQuery({
    queryKey: ["analytics", "top", MONTH, YEAR],
    queryFn: () => api.get<{ expenses: TopExpense[] }>(`/analytics/top-expenses?month=${MONTH}&year=${YEAR}&limit=5`),
    enabled: visibleCharts.includes("top"),
  });
  const { data: compareData } = useQuery({
    queryKey: ["analytics", "compare", MONTH, YEAR],
    queryFn: () => api.get<any>(`/analytics/compare?month1=${MONTH}&year1=${YEAR}&month2=${MONTH === 1 ? 12 : MONTH - 1}&year2=${MONTH === 1 ? YEAR - 1 : YEAR}`),
    enabled: visibleCharts.includes("compare"),
  });
  const { data: budgetSummary } = useQuery({
    queryKey: ["budgets", "summary", MONTH, YEAR],
    queryFn: () => api.get<{ summary: BudgetSummaryItem[] }>(`/budgets/summary?month=${MONTH}&year=${YEAR}`),
    enabled: visibleCharts.includes("budgets"),
  });
  const { data: prediction } = useQuery({
    queryKey: ["advisor", "quick"],
    queryFn: () => api.get<QuickAnalysis>("/advisor/quick"),
    enabled: visibleCharts.includes("prediction"),
  });

  function toggleChart(id: ChartId) {
    setVisibleCharts((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  const trendData = trend?.trend.map((t) => ({
    name: `${MONTH_NAMES[t.month - 1]}`,
    przychody: t.totalIncome,
    wydatki: t.totalExpenses,
    bilans: t.balance,
  })) || [];

  const pieData = spending?.spending.map((s) => ({
    name: `${s.categoryName}`,
    value: s.amount,
    color: s.categoryColor,
  })) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-text">Dashboard</h1>
          <p className="text-text-muted text-sm mt-1">{MONTH_NAMES[MONTH - 1]} {YEAR}</p>
        </div>
        <button
          onClick={() => setShowPicker(!showPicker)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-surface text-text-muted text-sm font-medium hover:text-accent hover:border-accent/30 transition-all"
        >
          {showPicker ? <X size={16} /> : <Plus size={16} />}
          {showPicker ? "Zamknij" : "Dodaj wykres"}
        </button>
      </div>

      {showPicker && (
        <div className="bg-surface rounded-2xl border border-border p-4">
          <p className="text-sm text-text-muted mb-3">Wybierz wykresy do wyświetlenia:</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {ALL_CHARTS.map((chart) => {
              const active = visibleCharts.includes(chart.id);
              return (
                <button
                  key={chart.id}
                  onClick={() => toggleChart(chart.id)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    active
                      ? "bg-accent/10 text-accent border border-accent/30"
                      : "bg-surface-alt text-text-muted border border-border hover:bg-surface-hover"
                  }`}
                >
                  {active ? <Eye size={14} /> : <EyeOff size={14} />}
                  {chart.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Podsumowanie */}
      {visibleCharts.includes("summary") && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-surface rounded-xl border border-border p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-text-muted">Przychody</span>
              <TrendingUp size={16} className="text-success" />
            </div>
            <p className="text-xl font-bold font-display text-success">{summary?.totalIncome?.toFixed(2) || "0.00"} PLN</p>
          </div>
          <div className="bg-surface rounded-xl border border-border p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-text-muted">Wydatki</span>
              <TrendingDown size={16} className="text-danger" />
            </div>
            <p className="text-xl font-bold font-display text-danger">{summary?.totalExpenses?.toFixed(2) || "0.00"} PLN</p>
          </div>
          <div className="bg-surface rounded-xl border border-border p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-text-muted">Bilans</span>
              <Wallet size={16} className={summary?.balance && summary.balance >= 0 ? "text-success" : "text-danger"} />
            </div>
            <p className={`text-xl font-bold font-display ${summary?.balance && summary.balance >= 0 ? "text-success" : "text-danger"}`}>{summary?.balance?.toFixed(2) || "0.00"} PLN</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar chart */}
        {visibleCharts.includes("bar") && (
          <div className="bg-surface rounded-xl border border-border p-6">
            <h2 className="text-base font-semibold text-text mb-4">Przychody vs Wydatki</h2>
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.grid} vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: CHART_THEME.text }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: CHART_THEME.text }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="przychody" fill={CHART_THEME.income} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="wydatki" fill={CHART_THEME.expense} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="text-text-muted text-center py-12 text-sm">Brak danych</p>}
          </div>
        )}

        {/* Pie chart */}
        {visibleCharts.includes("pie") && (
          <div className="bg-surface rounded-xl border border-border p-6">
            <h2 className="text-base font-semibold text-text mb-4">Wydatki wg kategorii</h2>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85} innerRadius={50} strokeWidth={0}>
                    {pieData.map((entry, index) => (<Cell key={index} fill={entry.color} />))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            ) : <p className="text-text-muted text-center py-12 text-sm">Brak wydatków</p>}
          </div>
        )}

        {/* Line chart */}
        {visibleCharts.includes("line") && (
          <div className="bg-surface rounded-xl border border-border p-6">
            <h2 className="text-base font-semibold text-text mb-4">Trend miesięczny</h2>
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.grid} vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: CHART_THEME.text }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: CHART_THEME.text }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="przychody" stroke={CHART_THEME.income} fill={CHART_THEME.income} fillOpacity={0.1} strokeWidth={2} />
                  <Area type="monotone" dataKey="wydatki" stroke={CHART_THEME.expense} fill={CHART_THEME.expense} fillOpacity={0.1} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : <p className="text-text-muted text-center py-12 text-sm">Brak danych</p>}
          </div>
        )}

        {/* Top expenses */}
        {visibleCharts.includes("top") && (
          <div className="bg-surface rounded-xl border border-border p-6">
            <h2 className="text-base font-semibold text-text mb-4">Największe wydatki</h2>
            {topExpenses?.expenses && topExpenses.expenses.length > 0 ? (
              <div className="space-y-3">
                {topExpenses.expenses.map((t, i) => (
                  <div key={t.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-mono text-text-muted w-5">#{i + 1}</span>
                      <div>
                        <p className="text-sm font-medium text-text">{t.description}</p>
                        <p className="text-xs text-text-muted">{new Date(t.date).toLocaleDateString("pl-PL")}</p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-danger">{parseFloat(t.amount).toFixed(2)} PLN</span>
                  </div>
                ))}
              </div>
            ) : <p className="text-text-muted text-center py-12 text-sm">Brak wydatków</p>}
          </div>
        )}

        {/* Compare months */}
        {visibleCharts.includes("compare") && compareData && (
          <div className="bg-surface rounded-xl border border-border p-6">
            <h2 className="text-base font-semibold text-text mb-4">Porównanie z poprzednim miesiącem</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-muted">Przychody</span>
                <div className="text-right">
                  <span className={`text-sm font-semibold ${compareData.difference.income >= 0 ? "text-success" : "text-danger"}`}>
                    {compareData.difference.income >= 0 ? "+" : ""}{compareData.difference.income.toFixed(2)} PLN
                  </span>
                  <span className={`text-xs ml-2 ${compareData.difference.incomePercent >= 0 ? "text-success" : "text-danger"}`}>
                    ({compareData.difference.incomePercent >= 0 ? "+" : ""}{compareData.difference.incomePercent}%)
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-muted">Wydatki</span>
                <div className="text-right">
                  <span className={`text-sm font-semibold ${compareData.difference.expenses <= 0 ? "text-success" : "text-danger"}`}>
                    {compareData.difference.expenses >= 0 ? "+" : ""}{compareData.difference.expenses.toFixed(2)} PLN
                  </span>
                  <span className={`text-xs ml-2 ${compareData.difference.expensesPercent <= 0 ? "text-success" : "text-danger"}`}>
                    ({compareData.difference.expensesPercent >= 0 ? "+" : ""}{compareData.difference.expensesPercent}%)
                  </span>
                </div>
              </div>
              <div className="border-t border-border pt-3 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-text-muted mb-1">Poprzedni miesiąc</p>
                  <p className="text-sm font-medium text-text">{compareData.previous.totalExpenses.toFixed(2)} PLN wydatków</p>
                </div>
                <div>
                  <p className="text-xs text-text-muted mb-1">Bieżący miesiąc</p>
                  <p className="text-sm font-medium text-text">{compareData.current.totalExpenses.toFixed(2)} PLN wydatków</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Budget progress */}
        {visibleCharts.includes("budgets") && (
          <div className="bg-surface rounded-xl border border-border p-6">
            <h2 className="text-base font-semibold text-text mb-4">Realizacja budżetów</h2>
            {budgetSummary?.summary && budgetSummary.summary.length > 0 ? (
              <div className="space-y-4">
                {budgetSummary.summary.map((b) => {
                  const barColor = b.percentUsed > 100 ? "bg-danger" : b.percentUsed > 80 ? "bg-warning" : "bg-success";
                  return (
                    <div key={b.id}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-text-muted">{b.categoryId.slice(0, 8)}</span>
                        <span className={`font-semibold ${b.percentUsed > 100 ? "text-danger" : b.percentUsed > 80 ? "text-warning" : "text-success"}`}>{b.percentUsed}%</span>
                      </div>
                      <div className="w-full bg-surface-alt rounded-full h-2.5">
                        <div className={`h-2.5 rounded-full transition-all ${barColor}`} style={{ width: `${Math.min(b.percentUsed, 100)}%` }} />
                      </div>
                      <p className="text-xs text-text-muted mt-1">{b.spent.toFixed(2)} / {b.amount.toFixed(2)} PLN</p>
                    </div>
                  );
                })}
              </div>
            ) : <p className="text-text-muted text-center py-12 text-sm">Brak budżetów</p>}
          </div>
        )}

        {/* Prediction */}
        {visibleCharts.includes("prediction") && prediction && (
          <div className="bg-surface rounded-xl border border-border p-6">
            <h2 className="text-base font-semibold text-text mb-4">Predykcja AI</h2>
            <div className="text-center mb-6">
              <p className="text-text-muted text-sm">Prognozowane wydatki na następny miesiąc</p>
              <p className="text-3xl font-bold font-display text-accent mt-2">{prediction.predictedExpenses.toFixed(2)} PLN</p>
            </div>
            {prediction.categorySpending.length > 0 && (
              <div className="space-y-3">
                {prediction.categorySpending.slice(0, 5).map((c) => (
                  <div key={c.categoryName} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-text">{c.categoryName}</span>
                      {c.isProtected && <span className="text-[10px] bg-success/10 text-success px-1.5 py-0.5 rounded-full">🛡️</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-text">{c.monthlyAverage.toFixed(0)} PLN</span>
                      <span className={`text-xs ${c.trend > 0 ? "text-danger" : c.trend < 0 ? "text-success" : "text-text-muted"}`}>
                        {c.trend > 0 ? "↑" : c.trend < 0 ? "↓" : "→"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {visibleCharts.length === 0 && (
        <div className="bg-surface rounded-2xl border border-border p-16 text-center">
          <p className="text-text-muted">Kliknij "Dodaj wykres" żeby wybrać widżety</p>
        </div>
      )}
    </div>
  );
}