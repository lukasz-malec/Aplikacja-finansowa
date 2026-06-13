import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bot, Send, TrendingUp, Loader2, Sparkles, PiggyBank, AlertTriangle, BarChart3 } from "lucide-react";
import { api } from "../lib/api";

interface QuickAnalysis {
  predictedExpenses: number;
  categorySpending: {
    categoryName: string;
    isProtected: boolean;
    monthlyAverage: number;
    trend: number;
  }[];
}

const presetQuestions = [
  { icon: BarChart3, label: "Pełna analiza", question: "" },
  { icon: AlertTriangle, label: "Gdzie przepłacam?", question: "Zidentyfikuj kategorie w których wydaję za dużo i powiedz gdzie widzisz największe ryzyko przekroczenia budżetu." },
  { icon: PiggyBank, label: "Jak oszczędzać?", question: "Zaproponuj konkretny plan oszczędzania na podstawie moich wydatków. Które kategorie mogę ograniczyć i o ile?" },
  { icon: TrendingUp, label: "Prognoza", question: "Prognozuj moje wydatki na następne 3 miesiące. Czy widzisz trendy wzrostowe w jakichś kategoriach? Czy dam radę utrzymać obecny poziom wydatków?" },
  { icon: Sparkles, label: "Porady na miarę", question: "Patrząc na moje wzorce wydatków, daj mi 3 konkretne, spersonalizowane porady które mogę wdrożyć od zaraz żeby poprawić swoją sytuację finansową." },
];

export default function AdvisorPage() {
  const [streaming, setStreaming] = useState(false);
  const [response, setResponse] = useState("");
  const [targetSaving, setTargetSaving] = useState("");
  const [customQuestion, setCustomQuestion] = useState("");
  const responseRef = useRef<HTMLDivElement>(null);

  const { data: analysis } = useQuery({
    queryKey: ["advisor", "quick"],
    queryFn: () => api.get<QuickAnalysis>("/advisor/quick"),
  });

  useEffect(() => {
    if (responseRef.current) {
      responseRef.current.scrollTop = responseRef.current.scrollHeight;
    }
  }, [response]);

  async function startAdvice(question?: string) {
    setStreaming(true);
    setResponse("");

    try {
      const params = new URLSearchParams();
      if (targetSaving) params.set("targetSaving", targetSaving);
      const q = question ?? customQuestion;
      if (q) params.set("question", q);

      const url = `/api/v1/advisor/advise${params.toString() ? `?${params.toString()}` : ""}`;

      const res = await fetch(url, { credentials: "include" });
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) return;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value);
        const lines = text.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.content) {
                setResponse((prev) => prev + data.content);
              }
            } catch {
              // skip
            }
          }
        }
      }
    } catch {
      setResponse("Wystąpił błąd. Upewnij się, że Ollama jest uruchomiona (ollama serve).");
    } finally {
      setStreaming(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display text-text">Doradca AI</h1>
        <p className="text-text-muted mt-1">Spersonalizowane porady finansowe oparte na Twoich danych</p>
      </div>

      {analysis && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-surface rounded-xl border border-border p-6">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={18} className="text-accent" />
              <span className="text-sm font-medium text-text-muted">Prognoza wydatków</span>
            </div>
            <p className="text-2xl font-bold font-display text-text">
              {analysis.predictedExpenses.toFixed(2)} PLN
            </p>
          </div>
          <div className="bg-surface rounded-xl border border-border p-6">
            <span className="text-sm font-medium text-text-muted">Kategorie wydatków</span>
            <p className="text-2xl font-bold font-display text-text mt-2">
              {analysis.categorySpending.length}
            </p>
          </div>
          <div className="bg-surface rounded-xl border border-border p-6">
            <span className="text-sm font-medium text-text-muted">Chronione kategorie</span>
            <p className="text-2xl font-bold font-display text-text mt-2">
              {analysis.categorySpending.filter((c) => c.isProtected).length}
            </p>
          </div>
        </div>
      )}

      {analysis && analysis.categorySpending.length > 0 && (
        <div className="bg-surface rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold font-display text-text mb-4">Wydatki wg kategorii</h2>
          <div className="space-y-3">
            {analysis.categorySpending.map((c) => (
              <div key={c.categoryName} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-text">{c.categoryName}</span>
                  {c.isProtected && <span className="text-xs bg-success/10 text-success px-2 py-0.5 rounded-full">🛡️ chroniona</span>}
                </div>
                <div className="text-right">
                  <span className="font-semibold text-text">{c.monthlyAverage.toFixed(2)} PLN/msc</span>
                  <span className={`text-sm ml-2 ${c.trend > 0 ? "text-danger" : c.trend < 0 ? "text-success" : "text-text-muted"}`}>
                    {c.trend > 0 ? "↑" : c.trend < 0 ? "↓" : "→"} {Math.abs(c.trend).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-surface rounded-xl border border-border p-6 space-y-4">
        <h2 className="text-lg font-semibold font-display text-text">
          <Bot className="inline mr-2" size={20} />
          Zapytaj doradcę
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {presetQuestions.map((preset) => (
            <button
              key={preset.label}
              onClick={() => startAdvice(preset.question)}
              disabled={streaming}
              className="flex flex-col items-center gap-2 p-3 rounded-lg border border-border hover:bg-surface-alt hover:border-accent/30 disabled:opacity-50 transition-colors text-center"
            >
              <preset.icon size={20} className="text-accent" />
              <span className="text-xs font-medium text-text">{preset.label}</span>
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          <input
            type="number"
            value={targetSaving}
            onChange={(e) => setTargetSaving(e.target.value)}
            placeholder="Cel oszczędności (PLN)"
            className="w-48 px-4 py-2.5 rounded-lg border border-border bg-surface text-text focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <input
            type="text"
            value={customQuestion}
            onChange={(e) => setCustomQuestion(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !streaming && startAdvice()}
            placeholder="Zadaj własne pytanie..."
            className="flex-1 px-4 py-2.5 rounded-lg border border-border bg-surface text-text focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <button
            onClick={() => startAdvice()}
            disabled={streaming || !customQuestion}
            className="flex items-center gap-2 bg-accent hover:bg-accent-hover disabled:opacity-50 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
          >
            {streaming ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </div>

        {response && (
          <div
            ref={responseRef}
            className="bg-surface-alt rounded-lg p-6 max-h-96 overflow-y-auto whitespace-pre-wrap text-text leading-relaxed"
          >
            {response}
          </div>
        )}
      </div>
    </div>
  );
}