import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { api } from "../lib/api";

interface Transaction { id: string; amount: string; type: "income" | "expense"; description: string; date: string; categoryId: string; createdAt: string; }
interface TransactionsResponse { transactions: Transaction[]; total: number; page: number; limit: number; totalPages: number; }
interface Category { _id: string; name: string; type: "income" | "expense"; }

export default function TransactionsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ amount: "", type: "expense" as "income" | "expense", description: "", date: new Date().toISOString().split("T")[0], categoryId: "" });

  const { data, isLoading } = useQuery({ queryKey: ["transactions", page, typeFilter], queryFn: () => api.get<TransactionsResponse>(`/transactions?page=${page}&limit=10${typeFilter ? `&type=${typeFilter}` : ""}&sort=-date`) });
  const { data: categories } = useQuery({ queryKey: ["categories"], queryFn: () => api.get<{ categories: Category[] }>("/categories") });

  const createMutation = useMutation({ mutationFn: (data: typeof form) => api.post("/transactions", { ...data, amount: parseFloat(data.amount) }), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["transactions"] }); queryClient.invalidateQueries({ queryKey: ["analytics"] }); resetForm(); } });
  const updateMutation = useMutation({ mutationFn: ({ id, data }: { id: string; data: typeof form }) => api.put(`/transactions/${id}`, { ...data, amount: parseFloat(data.amount) }), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["transactions"] }); queryClient.invalidateQueries({ queryKey: ["analytics"] }); resetForm(); } });
  const deleteMutation = useMutation({ mutationFn: (id: string) => api.delete(`/transactions/${id}`), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["transactions"] }); queryClient.invalidateQueries({ queryKey: ["analytics"] }); } });

  function resetForm() { setForm({ amount: "", type: "expense", description: "", date: new Date().toISOString().split("T")[0], categoryId: "" }); setShowForm(false); setEditingId(null); }
  function startEdit(t: Transaction) { setForm({ amount: parseFloat(t.amount).toString(), type: t.type, description: t.description, date: t.date.split("T")[0], categoryId: t.categoryId }); setEditingId(t.id); setShowForm(true); }
  function handleSubmit(e: React.FormEvent) { e.preventDefault(); if (editingId) { updateMutation.mutate({ id: editingId, data: form }); } else { createMutation.mutate(form); } }

  const categoryMap = new Map(categories?.categories.map((c) => [c._id, c]) || []);
  const inputClass = "w-full px-4 py-2.5 rounded-lg border border-border bg-surface-alt text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-text">Transakcje</h1>
          <p className="text-text-muted text-sm mt-1">Zarządzaj przychodami i wydatkami</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(!showForm); }} className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-primary px-4 py-2.5 rounded-lg font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-accent/25">
          <Plus size={18} /> Dodaj transakcję
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-surface rounded-xl border border-border p-6 space-y-4">
          <h2 className="text-base font-semibold font-display text-text">{editingId ? "Edytuj transakcję" : "Nowa transakcja"}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div><label className="block text-sm font-medium text-text-muted mb-1.5">Kwota (PLN)</label><input type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className={inputClass} required /></div>
            <div><label className="block text-sm font-medium text-text-muted mb-1.5">Typ</label><select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as "income" | "expense" })} className={inputClass}><option value="expense">Wydatek</option><option value="income">Przychód</option></select></div>
            <div><label className="block text-sm font-medium text-text-muted mb-1.5">Data</label><input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className={inputClass} required /></div>
            <div><label className="block text-sm font-medium text-text-muted mb-1.5">Kategoria</label><select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className={inputClass} required><option value="">Wybierz...</option>{categories?.categories.filter((c) => c.type === form.type).map((c) => (<option key={c._id} value={c._id}>{c.name}</option>))}</select></div>
            <div className="md:col-span-2"><label className="block text-sm font-medium text-text-muted mb-1.5">Opis</label><input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputClass} required /></div>
          </div>
          <div className="flex gap-3">
            <button type="submit" className="bg-accent hover:bg-accent-hover text-primary px-6 py-2.5 rounded-lg font-semibold transition-all">{editingId ? "Zapisz" : "Dodaj"}</button>
            <button type="button" onClick={resetForm} className="px-6 py-2.5 rounded-lg font-medium border border-border text-text-muted hover:bg-surface-hover transition-all">Anuluj</button>
          </div>
        </form>
      )}

      <div className="flex gap-2">
        {["", "expense", "income"].map((t) => (
          <button key={t} onClick={() => { setTypeFilter(t); setPage(1); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${typeFilter === t ? "bg-accent/10 text-accent border border-accent/30" : "bg-surface border border-border text-text-muted hover:bg-surface-hover"}`}>
            {t === "" ? "Wszystkie" : t === "expense" ? "Wydatki" : "Przychody"}
          </button>
        ))}
      </div>

      <div className="bg-surface rounded-xl border border-border overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-32"><div className="animate-spin rounded-full h-8 w-8 border-2 border-accent border-t-transparent" /></div>
        ) : data?.transactions.length === 0 ? (
          <p className="text-text-muted text-center py-12 text-sm">Brak transakcji</p>
        ) : (
          <table className="w-full">
            <thead><tr className="border-b border-border">
              <th className="text-left px-6 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">Data</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">Opis</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">Kategoria</th>
              <th className="text-right px-6 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">Kwota</th>
              <th className="text-right px-6 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">Akcje</th>
            </tr></thead>
            <tbody>
              {data?.transactions.map((t) => { const cat = categoryMap.get(t.categoryId); return (
                <tr key={t.id} className="border-b border-border last:border-0 hover:bg-surface-hover/50 transition-colors">
                  <td className="px-6 py-4 text-sm text-text-muted">{new Date(t.date).toLocaleDateString("pl-PL")}</td>
                  <td className="px-6 py-4 text-sm text-text">{t.description}</td>
                  <td className="px-6 py-4 text-sm text-text-muted">{cat ? `${cat.name}` : t.categoryId}</td>
                  <td className={`px-6 py-4 text-sm font-semibold text-right ${t.type === "income" ? "text-success" : "text-danger"}`}>{t.type === "income" ? "+" : "-"}{parseFloat(t.amount).toFixed(2)} PLN</td>
                  <td className="px-6 py-4 text-right"><div className="flex items-center justify-end gap-1">
                    <button onClick={() => startEdit(t)} className="p-1.5 rounded-lg hover:bg-surface-hover text-text-muted hover:text-text transition-colors"><Pencil size={15} /></button>
                    <button onClick={() => deleteMutation.mutate(t.id)} className="p-1.5 rounded-lg hover:bg-danger/10 text-text-muted hover:text-danger transition-colors"><Trash2 size={15} /></button>
                  </div></td>
                </tr>
              ); })}
            </tbody>
          </table>
        )}
      </div>

      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 rounded-lg border border-border text-sm font-medium disabled:opacity-30 hover:bg-surface-hover transition-all text-text-muted">Poprzednia</button>
          <span className="text-sm text-text-muted px-3">{page} / {data.totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))} disabled={page === data.totalPages} className="px-4 py-2 rounded-lg border border-border text-sm font-medium disabled:opacity-30 hover:bg-surface-hover transition-all text-text-muted">Następna</button>
        </div>
      )}
    </div>
  );
}