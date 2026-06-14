import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Shield, ShieldOff } from "lucide-react";
import { api } from "../lib/api";

interface Category {
  _id: string;
  name: string;
  color: string;
  type: "income" | "expense";
  isProtected: boolean;
}

export default function CategoriesPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", color: "#3b82f6", type: "expense" as "income" | "expense" });

  const { data, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: () => api.get<{ categories: Category[] }>("/categories"),
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof form) => api.post("/categories", data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["categories"] }); resetForm(); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<typeof form & { isProtected: boolean }> }) =>
      api.put(`/categories/${id}`, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["categories"] }); resetForm(); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/categories/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["categories"] }),
  });

  function resetForm() {
    setForm({ name: "", color: "#3b82f6", type: "expense" });
    setShowForm(false);
    setEditingId(null);
  }

  function startEdit(c: Category) {
    setForm({ name: c.name, color: c.color, type: c.type });
    setEditingId(c._id);
    setShowForm(true);
  }

  function toggleProtected(c: Category) {
    updateMutation.mutate({ id: c._id, data: { isProtected: !c.isProtected } });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: form });
    } else {
      createMutation.mutate(form);
    }
  }

  const inputClass = "w-full px-4 py-2.5 rounded-xl border border-border bg-surface-alt text-text focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all";
  const expenses = data?.categories.filter((c) => c.type === "expense") || [];
  const incomes = data?.categories.filter((c) => c.type === "income") || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-text">Kategorie</h1>
          <p className="text-text-muted text-sm mt-1">Zarządzaj kategoriami transakcji</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(!showForm); }}
          className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-primary px-4 py-2.5 rounded-xl font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-accent/25"
        >
          <Plus size={18} />
          Dodaj kategorię
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-surface rounded-2xl border border-border p-6 space-y-4">
          <h2 className="text-base font-semibold font-display text-text">
            {editingId ? "Edytuj kategorię" : "Nowa kategoria"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1.5">Nazwa</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1.5">Typ</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as "income" | "expense" })} className={inputClass}>
                <option value="expense">Wydatek</option>
                <option value="income">Przychód</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1.5">Kolor</label>
              <div className="flex items-center gap-3">
                <input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className="w-12 h-10 rounded-lg border border-border cursor-pointer bg-transparent" />
                <span className="text-sm text-text-muted">{form.color}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" className="bg-accent hover:bg-accent-hover text-primary px-6 py-2.5 rounded-xl font-semibold transition-all">{editingId ? "Zapisz" : "Dodaj"}</button>
            <button type="button" onClick={resetForm} className="px-6 py-2.5 rounded-xl font-medium border border-border text-text-muted hover:bg-surface-hover transition-all">Anuluj</button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-accent border-t-transparent" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[{ title: "Wydatki", items: expenses }, { title: "Przychody", items: incomes }].map(({ title, items }) => (
            <div key={title} className="bg-surface rounded-2xl border border-border p-6">
              <h2 className="text-base font-semibold font-display text-text mb-4">{title}</h2>
              {items.length === 0 ? (
                <p className="text-text-muted text-center py-8 text-sm">Brak kategorii</p>
              ) : (
                <div className="space-y-1">
                  {items.map((c) => (
                    <div key={c._id} className="flex items-center justify-between p-3 rounded-xl hover:bg-surface-hover transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }} />
                        <div>
                          <p className="font-medium text-text text-sm">{c.name}</p>
                          {c.isProtected && (
                            <span className="text-[11px] text-success font-medium">Chroniona przed cięciami</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => toggleProtected(c)}
                          className={`p-1.5 rounded-lg transition-colors ${c.isProtected ? "text-success hover:bg-success/10" : "text-text-muted hover:bg-surface-hover"}`}
                          title={c.isProtected ? "Odznacz jako chronioną" : "Oznacz jako chronioną"}
                        >
                          {c.isProtected ? <Shield size={15} /> : <ShieldOff size={15} />}
                        </button>
                        <button onClick={() => startEdit(c)} className="p-1.5 rounded-lg hover:bg-surface-hover text-text-muted hover:text-text transition-colors">
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => deleteMutation.mutate(c._id)} className="p-1.5 rounded-lg hover:bg-danger/10 text-text-muted hover:text-danger transition-colors">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}