import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, PiggyBank } from "lucide-react";
import { api } from "../lib/api";

interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  progress: number;
}

export default function GoalsPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [contributeId, setContributeId] = useState<string | null>(null);
  const [contributeAmount, setContributeAmount] = useState("");
  const [form, setForm] = useState({ name: "", targetAmount: "", deadline: "" });

  const { data, isLoading } = useQuery({
    queryKey: ["goals"],
    queryFn: () => api.get<{ goals: Goal[] }>("/goals"),
  });

  const createMutation = useMutation({
    mutationFn: (data: { name: string; targetAmount: number; deadline: string }) =>
      api.post("/goals", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      setShowForm(false);
      setForm({ name: "", targetAmount: "", deadline: "" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/goals/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["goals"] }),
  });

  const contributeMutation = useMutation({
    mutationFn: ({ id, amount }: { id: string; amount: number }) =>
      api.post(`/goals/${id}/contribute`, { amount }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      setContributeId(null);
      setContributeAmount("");
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    createMutation.mutate({ name: form.name, targetAmount: parseFloat(form.targetAmount), deadline: form.deadline });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-text">Cele finansowe</h1>
          <p className="text-text-muted mt-1">Śledź postęp oszczędzania</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-white px-4 py-2.5 rounded-lg font-medium transition-colors"
        >
          <Plus size={18} />
          Nowy cel
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-surface rounded-xl border border-border p-6 space-y-4">
          <h2 className="text-lg font-semibold font-display text-text">Nowy cel</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-text mb-1">Nazwa</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-surface text-text focus:outline-none focus:ring-2 focus:ring-accent"
                placeholder="np. Wakacje w Grecji"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">Kwota docelowa (PLN)</label>
              <input
                type="number"
                step="0.01"
                value={form.targetAmount}
                onChange={(e) => setForm({ ...form, targetAmount: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-surface text-text focus:outline-none focus:ring-2 focus:ring-accent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">Deadline</label>
              <input
                type="date"
                value={form.deadline}
                onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-surface text-text focus:outline-none focus:ring-2 focus:ring-accent"
                required
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" className="bg-accent hover:bg-accent-hover text-white px-6 py-2.5 rounded-lg font-medium transition-colors">
              Stwórz cel
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
      ) : data?.goals.length === 0 ? (
        <div className="bg-surface rounded-xl border border-border p-12 text-center">
          <p className="text-text-muted">Brak celów finansowych</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {data?.goals.map((g) => {
            const daysLeft = Math.ceil((new Date(g.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
            const barColor = g.progress >= 100 ? "bg-success" : g.progress > 50 ? "bg-accent" : "bg-warning";

            return (
              <div key={g.id} className="bg-surface rounded-xl border border-border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-text">{g.name}</h3>
                  <button
                    onClick={() => deleteMutation.mutate(g.id)}
                    className="p-1.5 rounded-lg hover:bg-danger/10 text-text-muted hover:text-danger transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-text-muted">{g.currentAmount.toFixed(2)} PLN</span>
                    <span className="font-medium text-text">{g.targetAmount.toFixed(2)} PLN</span>
                  </div>
                  <div className="w-full bg-surface-alt rounded-full h-4">
                    <div
                      className={`h-4 rounded-full transition-all ${barColor}`}
                      style={{ width: `${Math.min(g.progress, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="font-semibold text-text">{g.progress}%</span>
                    <span className={`text-text-muted ${daysLeft < 0 ? "text-danger" : ""}`}>
                      {daysLeft < 0 ? `${Math.abs(daysLeft)} dni po terminie` : `${daysLeft} dni`}
                    </span>
                  </div>
                </div>

                {contributeId === g.id ? (
                  <div className="flex gap-2 mt-4">
                    <input
                      type="number"
                      step="0.01"
                      value={contributeAmount}
                      onChange={(e) => setContributeAmount(e.target.value)}
                      placeholder="Kwota"
                      className="flex-1 px-4 py-2 rounded-lg border border-border bg-surface text-text focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                    <button
                      onClick={() => contributeMutation.mutate({ id: g.id, amount: parseFloat(contributeAmount) })}
                      className="bg-success hover:bg-success/80 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      Wpłać
                    </button>
                    <button
                      onClick={() => setContributeId(null)}
                      className="px-4 py-2 rounded-lg border border-border text-text-muted hover:bg-surface-alt transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setContributeId(g.id)}
                    className="flex items-center gap-2 mt-4 w-full justify-center bg-surface-alt hover:bg-border text-text py-2.5 rounded-lg font-medium transition-colors"
                  >
                    <PiggyBank size={18} />
                    Wpłać na cel
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}