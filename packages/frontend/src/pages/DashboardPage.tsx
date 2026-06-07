import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";
import { TrendingUp, TrendingDown, Wallet, ArrowUpDown } from "lucide-react";
import { useMonthlySummary, useSpendingByCategory, useMonthlyTrend } from "../hooks/useAnalytics";

const now = new Date();
const MONTH = now.getMonth() + 1;
const YEAR = now.getFullYear();

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="bg-surface rounded-xl border border-border p-6">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-text-muted">{label}</span>
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon size={18} className="text-white" />
        </div>
      </div>
      <p className="text-2xl font-bold font-display text-text">{value}</p>
    </div>
  );
}

const MONTH_NAMES = ["Sty", "Lut", "Mar", "Kwi", "Maj", "Cze", "Lip", "Sie", "Wrz", "Paź", "Lis", "Gru"];

export default function DashboardPage() {
  const { data: summary, isLoading: summaryLoading } = useMonthlySummary(MONTH, YEAR);
  const { data: spending } = useSpendingByCategory(MONTH, YEAR);
  const { data: trend } = useMonthlyTrend(6);

  if (summaryLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  const trendData = trend?.trend.map((t) => ({
    name: `${MONTH_NAMES[t.month - 1]} ${t.year}`,
    przychody: t.totalIncome,
    wydatki: t.totalExpenses,
  })) || [];

  const pieData = spending?.spending.map((s) => ({
    name: `${s.categoryIcon} ${s.categoryName}`,
    value: s.amount,
    color: s.categoryColor,
  })) || [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold font-display text-text">Dashboard</h1>
        <p className="text-text-muted mt-1">
          {MONTH_NAMES[MONTH - 1]} {YEAR} — podsumowanie finansowe
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Przychody"
          value={`${summary?.totalIncome?.toFixed(2) || "0.00"} PLN`}
          icon={TrendingUp}
          color="bg-success"
        />
        <StatCard
          label="Wydatki"
          value={`${summary?.totalExpenses?.toFixed(2) || "0.00"} PLN`}
          icon={TrendingDown}
          color="bg-danger"
        />
        <StatCard
          label="Bilans"
          value={`${summary?.balance?.toFixed(2) || "0.00"} PLN`}
          icon={Wallet}
          color={summary?.balance && summary.balance >= 0 ? "bg-success" : "bg-danger"}
        />
        <StatCard
          label="Transakcje"
          value={`${pieData.length} kategorii`}
          icon={ArrowUpDown}
          color="bg-accent"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold font-display text-text mb-4">
            Trend przychodów i wydatków
          </h2>
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="przychody" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="wydatki" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-text-muted text-center py-12">Brak danych do wyświetlenia</p>
          )}
        </div>

        <div className="bg-surface rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold font-display text-text mb-4">
            Wydatki wg kategorii
          </h2>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, value }) => `${name}: ${value} PLN`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-text-muted text-center py-12">Brak wydatków w tym miesiącu</p>
          )}
        </div>
      </div>

      <div className="bg-surface rounded-xl border border-border p-6">
        <h2 className="text-lg font-semibold font-display text-text mb-4">
          Bilans miesięczny
        </h2>
        {trendData.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="przychody"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="wydatki"
                stroke="#ef4444"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-text-muted text-center py-12">Brak danych</p>
        )}
      </div>
    </div>
  );
}