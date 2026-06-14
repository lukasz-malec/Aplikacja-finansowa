import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { api } from "../lib/api";

interface BudgetSummaryItem {
  id: string;
  categoryId: string;
  amount: number;
  spent: number;
  remaining: number;
  percentUsed: number;
}

interface Category {
  _id: string;
  name: string;
  color: string;
  type: "income" | "expense";
}

interface Transaction {
  id: string;
  amount: string;
  description: string;
  date: string;
  categoryId: string;
}

interface TransactionsResponse {
  transactions: Transaction[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const now = new Date();
const MONTH_NAMES = ["Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec", "Lipiec", "Sierpień", "Wrzesień", "Październik", "Listopad", "Grudzień"];

function BudgetTransactions({ categoryId, month, year }: { categoryId: string; month: number; year: number }) {
  const { data, isLoading } = useQuery({
    queryKey: ["transactions", "budget", categoryId, month, year],
    queryFn: () => api.get<TransactionsResponse>(`/transactions?categoryId=${categoryId}&type=expense&limit=50&sort=-date`),
  });

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  const filtered = data?.transactions.filter((t) => {
    const d = new Date(t.date);
    return d >= startDate && d <= endDate;
  }) || [];

  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <div className="animate-spin rounded-full h-5 w-5 border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  if (filtered.length === 0) {
    return <p className="text-text-muted text-xs py-3 text-center">Brak transakcji w tym miesiącu</p>;
  }

  return (
    <div className="space-y-1">
      {filtered.map((t) => (
        <div key={t.id} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-surface-hover/50 transition-colors">
          <div>
            <p className="text-sm text-text">{t.description}</p>
            <p className="text-xs text-text-muted">{new Date(t.date).toLocaleDateString("pl-PL")}</p>
          </div>
          <span className="text-sm font-semibold text-danger">{parseFloat(t.amount).toFixed(2)} PLN</span>
        </div>
      ))}
    </div>
  );
}

export default function BudgetsPage() {
  const queryClient = useQueryClient();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [form, setForm] = useState({ categoryId: "", amount: "" });

  const { data: summary, isLoading } = useQuery({
    queryKey: ["budgets", "summary", month, year],
    queryFn: () => api.get<{ summary: BudgetSummaryItem[] }>(`/budgets/summary?month=${month}&year=${year}`),
  });

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: () => api.get<{ categories: Category[] }>("/categories"),
  });

  const createMutation = useMutation({
    mutationFn: (data: { categoryId: string; amount: number; month: number; year: number }) =>
      api.post("/budgets", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      setShowForm(false);
      setForm({ categoryId: "", amount: "" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/budgets/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["budgets"] }),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    createMutation.mutate({ categoryId: form.categoryId, amount: parseFloat(form.amount), month, year });
  }

  const categoryMap = new Map(categories?.categories.map((c) => [c._id, c]) || []);
  const inputClass = "w-full px-4 py-2.5 rounded-xl border border-border bg-surface-alt text-text focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-text">Budżety</h1>
          <p className="text-text-muted text-sm mt-1">Kontroluj wydatki w kategoriach</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-primary px-4 py-2.5 rounded-xl font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-accent/25"
        >
          <Plus size={18} />
          Dodaj budżet
        </button>
      </div>

      <div className="flex gap-3 items-center">
        <select value={month} onChange={(e) => setMonth(parseInt(e.target.value))} className={`${inputClass} w-auto`}>
          {MONTH_NAMES.map((name, i) => (
            <option key={i} value={i + 1}>{name}</option>
          ))}
        </select>
        <input type="number" value={year} onChange={(e) => setYear(parseInt(e.target.value))} className={`${inputClass} w-24`} />
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-surface rounded-2xl border border-border p-6 space-y-4">
          <h2 className="text-base font-semibold font-display text-text">Nowy budżet</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1.5">Kategoria</label>
              <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className={inputClass} required>
                <option value="">Wybierz...</option>
                {categories?.categories.filter((c) => c.type === "expense").map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1.5">Limit (PLN)</label>
              <input type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className={inputClass} required />
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" className="bg-accent hover:bg-accent-hover text-primary px-6 py-2.5 rounded-xl font-semibold transition-all">Dodaj</button>
            <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2.5 rounded-xl font-medium border border-border text-text-muted hover:bg-surface-hover transition-all">Anuluj</button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-accent border-t-transparent" />
        </div>
      ) : summary?.summary.length === 0 ? (
        <div className="bg-surface rounded-2xl border border-border p-12 text-center">
          <p className="text-text-muted text-sm">Brak budżetów na {MONTH_NAMES[month - 1]} {year}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {summary?.summary.map((b) => {
            const cat = categoryMap.get(b.categoryId);
            const barColor = b.percentUsed > 100 ? "bg-danger" : b.percentUsed > 80 ? "bg-warning" : "bg-success";
            const textColor = b.percentUsed > 100 ? "text-danger" : b.percentUsed > 80 ? "text-warning" : "text-success";
            const isExpanded = expandedId === b.id;

            return (
              <div key={b.id} className="bg-surface rounded-2xl border border-border overflow-hidden transition-all">
                <div
                  className="p-5 cursor-pointer hover:bg-surface-hover/30 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : b.id)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat?.color || "#6B7280" }} />
                      <div>
                        <p className="font-semibold text-text text-sm">{cat?.name || b.categoryId}</p>
                        <p className="text-xs text-text-muted">{b.spent.toFixed(2)} / {b.amount.toFixed(2)} PLN</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-sm font-bold ${textColor}`}>{b.percentUsed}%</span>
                      {isExpanded ? <ChevronUp size={16} className="text-text-muted" /> : <ChevronDown size={16} className="text-text-muted" />}
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(b.id); }}
                        className="p-1.5 rounded-lg hover:bg-danger/10 text-text-muted hover:text-danger transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                  <div className="w-full bg-surface-alt rounded-full h-2.5">
                    <div className={`h-2.5 rounded-full transition-all duration-500 ${barColor}`} style={{ width: `${Math.min(b.percentUsed, 100)}%` }} />
                  </div>
                  {b.remaining < 0 && (
                    <p className="text-xs text-danger mt-2">Przekroczono o {Math.abs(b.remaining).toFixed(2)} PLN</p>
                  )}
                </div>

                {isExpanded && (
                  <div className="border-t border-border px-5 py-4 bg-surface-alt/30">
                    <p className="text-xs font-medium text-text-muted mb-3">Transakcje w {MONTH_NAMES[month - 1]} {year}:</p>
                    <BudgetTransactions categoryId={b.categoryId} month={month} year={year} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}