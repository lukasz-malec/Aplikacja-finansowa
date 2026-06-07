import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { api } from "../lib/api";

interface Budget {
  id: string;
  categoryId: string;
  amount: string;
  month: number;
  year: number;
}

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
  icon: string;
  type: "income" | "expense";
}

const now = new Date();

export default function BudgetsPage() {
  const queryClient = useQueryClient();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [showForm, setShowForm] = useState(false);
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
  const MONTH_NAMES = ["Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec", "Lipiec", "Sierpień", "Wrzesień", "Październik", "Listopad", "Grudzień"];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-text">Budżety</h1>
          <p className="text-text-muted mt-1">Kontroluj wydatki w kategoriach</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-white px-4 py-2.5 rounded-lg font-medium transition-colors"
        >
          <Plus size={18} />
          Dodaj budżet
        </button>
      </div>

      <div className="flex gap-3 items-center">
        <select
          value={month}
          onChange={(e) => setMonth(parseInt(e.target.value))}
          className="px-4 py-2.5 rounded-lg border border-border bg-surface text-text focus:outline-none focus:ring-2 focus:ring-accent"
        >
          {MONTH_NAMES.map((name, i) => (
            <option key={i} value={i + 1}>{name}</option>
          ))}
        </select>
        <input
          type="number"
          value={year}
          onChange={(e) => setYear(parseInt(e.target.value))}
          className="w-24 px-4 py-2.5 rounded-lg border border-border bg-surface text-text focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-surface rounded-xl border border-border p-6 space-y-4">
          <h2 className="text-lg font-semibold font-display text-text">Nowy budżet</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text mb-1">Kategoria</label>
              <select
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-surface text-text focus:outline-none focus:ring-2 focus:ring-accent"
                required
              >
                <option value="">Wybierz...</option>
                {categories?.categories
                  .filter((c) => c.type === "expense")
                  .map((c) => (
                    <option key={c._id} value={c._id}>{c.icon} {c.name}</option>
                  ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">Limit (PLN)</label>
              <input
                type="number"
                step="0.01"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-surface text-text focus:outline-none focus:ring-2 focus:ring-accent"
                required
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" className="bg-accent hover:bg-accent-hover text-white px-6 py-2.5 rounded-lg font-medium transition-colors">
              Dodaj
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2.5 rounded-lg font-medium border border-border text-text-muted hover:bg-surface-alt transition-colors">
              Anuluj
            </button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-accent border-t-transparent" />
        </div>
      ) : summary?.summary.length === 0 ? (
        <div className="bg-surface rounded-xl border border-border p-12 text-center">
          <p className="text-text-muted">Brak budżetów na {MONTH_NAMES[month - 1]} {year}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {summary?.summary.map((b) => {
            const cat = categoryMap.get(b.categoryId);
            const barColor = b.percentUsed > 100 ? "bg-danger" : b.percentUsed > 80 ? "bg-warning" : "bg-success";

            return (
              <div key={b.id} className="bg-surface rounded-xl border border-border p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{cat?.icon || "📦"}</span>
                    <div>
                      <p className="font-semibold text-text">{cat?.name || b.categoryId}</p>
                      <p className="text-sm text-text-muted">
                        {b.spent.toFixed(2)} / {b.amount.toFixed(2)} PLN
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-bold ${b.percentUsed > 100 ? "text-danger" : b.percentUsed > 80 ? "text-warning" : "text-success"}`}>
                      {b.percentUsed}%
                    </span>
                    <button
                      onClick={() => deleteMutation.mutate(b.id)}
                      className="p-1.5 rounded-lg hover:bg-danger/10 text-text-muted hover:text-danger transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className="w-full bg-surface-alt rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all ${barColor}`}
                    style={{ width: `${Math.min(b.percentUsed, 100)}%` }}
                  />
                </div>
                {b.remaining < 0 && (
                  <p className="text-sm text-danger mt-2">
                    Przekroczono budżet o {Math.abs(b.remaining).toFixed(2)} PLN
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}