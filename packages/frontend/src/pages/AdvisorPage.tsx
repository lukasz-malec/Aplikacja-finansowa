import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { BarChart3, Send, TrendingUp, Loader2, Sparkles, PiggyBank, AlertTriangle, Bot } from "lucide-react";
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
  { icon: BarChart3, label: "Pełna analiza", question: "", color: "#1db954" },
  { icon: AlertTriangle, label: "Gdzie przepłacam?", question: "Zidentyfikuj kategorie w których wydaję za dużo i powiedz gdzie widzisz największe ryzyko przekroczenia budżetu.", color: "#e74c3c" },
  { icon: PiggyBank, label: "Jak oszczędzać?", question: "Zaproponuj konkretny plan oszczędzania na podstawie moich wydatków. Które kategorie mogę ograniczyć i o ile?", color: "#f5a623" },
  { icon: TrendingUp, label: "Prognoza", question: "Prognozuj moje wydatki na następne 3 miesiące. Czy widzisz trendy wzrostowe w jakichś kategoriach?", color: "#3b82f6" },
  { icon: Sparkles, label: "Porady", question: "Patrząc na moje wzorce wydatków, daj mi 3 konkretne, spersonalizowane porady które mogę wdrożyć od zaraz.", color: "#8b5cf6" },
];

function PulsingDots() {
  return (
    <div className="flex items-center gap-1.5 px-4 py-3">
      <div className="w-2 h-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: "0ms" }} />
      <div className="w-2 h-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: "150ms" }} />
      <div className="w-2 h-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: "300ms" }} />
    </div>
  );
}

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

  const inputClass = "px-4 py-2.5 rounded-xl border border-border bg-surface-alt text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display text-text">Doradca AI</h1>
        <p className="text-text-muted text-sm mt-1">Spersonalizowane porady finansowe</p>
      </div>

      {analysis && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-surface rounded-xl border border-border p-5">
            <span className="text-sm text-text-muted">Prognoza wydatków</span>
            <p className="text-xl font-bold font-display text-accent mt-1">{analysis.predictedExpenses.toFixed(2)} PLN</p>
          </div>
          <div className="bg-surface rounded-xl border border-border p-5">
            <span className="text-sm text-text-muted">Kategorie wydatków</span>
            <p className="text-xl font-bold font-display text-text mt-1">{analysis.categorySpending.length}</p>
          </div>
          <div className="bg-surface rounded-xl border border-border p-5">
            <span className="text-sm text-text-muted">Chronione kategorie</span>
            <p className="text-xl font-bold font-display text-text mt-1">{analysis.categorySpending.filter((c) => c.isProtected).length}</p>
          </div>
        </div>
      )}

      {analysis && analysis.categorySpending.length > 0 && (
        <div className="bg-surface rounded-xl border border-border p-6">
          <h2 className="text-base font-semibold text-text mb-4">Wydatki wg kategorii</h2>
          <div className="space-y-3">
            {analysis.categorySpending.map((c) => (
              <div key={c.categoryName} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-text">{c.categoryName}</span>
                  {c.isProtected && <span className="text-[10px] bg-success/10 text-success px-1.5 py-0.5 rounded-full">chroniona</span>}
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
        </div>
      )}

      <div className="bg-surface rounded-2xl border border-border p-6 space-y-5">
        <div className="flex items-center gap-2">
          <Bot size={20} className="text-accent" />
          <h2 className="text-base font-semibold text-text">Zapytaj doradcę</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {presetQuestions.map((preset, i) => (
            <button
              key={preset.label}
              onClick={() => startAdvice(preset.question)}
              disabled={streaming}
              className="tile-icon group relative overflow-hidden rounded-xl border border-border bg-surface-alt p-4 flex flex-col items-center gap-2.5 transition-all duration-300 hover:scale-[1.03] hover:border-transparent disabled:opacity-50 disabled:hover:scale-100"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div
                className="tile-bg absolute inset-0 opacity-0 transition-opacity duration-300"
                style={{ backgroundColor: preset.color }}
              />
              <preset.icon size={22} className="relative z-10 transition-colors duration-300" style={{ color: preset.color }} />
              <span className="relative z-10 text-[11px] font-medium text-text-muted transition-colors duration-300 group-hover:text-white">
                {preset.label}
              </span>
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          <input
            type="number"
            value={targetSaving}
            onChange={(e) => setTargetSaving(e.target.value)}
            placeholder="Cel oszczędności (PLN)"
            className={`w-48 ${inputClass}`}
          />
          <input
            type="text"
            value={customQuestion}
            onChange={(e) => setCustomQuestion(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !streaming && customQuestion && startAdvice()}
            placeholder="Zadaj własne pytanie..."
            className={`flex-1 ${inputClass}`}
          />
          <button
            onClick={() => startAdvice()}
            disabled={streaming || !customQuestion}
            className="flex items-center gap-2 bg-accent hover:bg-accent-hover disabled:opacity-50 text-primary px-5 py-2.5 rounded-xl font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-accent/25"
          >
            {streaming ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </div>

        {streaming && !response && <PulsingDots />}

        {response && (
          <div
            ref={responseRef}
            className="bg-surface-alt rounded-xl p-6 max-h-96 overflow-y-auto whitespace-pre-wrap text-text text-sm leading-relaxed border border-border"
          >
            {response}
            {streaming && <span className="inline-block w-1.5 h-4 bg-accent ml-1 animate-pulse" />}
          </div>
        )}
      </div>
    </div>
  );
}