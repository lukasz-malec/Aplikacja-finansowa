import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bot, Send, TrendingUp, Loader2 } from "lucide-react";
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

export default function AdvisorPage() {
  const [streaming, setStreaming] = useState(false);
  const [response, setResponse] = useState("");
  const [targetSaving, setTargetSaving] = useState("");
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

  async function startAdvice() {
    setStreaming(true);
    setResponse("");

    try {
      const url = targetSaving
        ? `/api/v1/advisor/advise?targetSaving=${targetSaving}`
        : "/api/v1/advisor/advise";

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
              // skip invalid JSON
            }
          }
        }
      }
    } catch (error) {
      setResponse("Wystąpił błąd podczas generowania porady. Upewnij się, że Ollama jest uruchomiona.");
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
              <span className="text-sm font-medium text-text-muted">Prognoza na następny miesiąc</span>
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

      <div className="bg-surface rounded-xl border border-border p-6">
        <h2 className="text-lg font-semibold font-display text-text mb-4">
          <Bot className="inline mr-2" size={20} />
          Zapytaj doradcę
        </h2>

        <div className="flex gap-3 mb-4">
          <input
            type="number"
            value={targetSaving}
            onChange={(e) => setTargetSaving(e.target.value)}
            placeholder="Ile chcesz zaoszczędzić? (PLN, opcjonalne)"
            className="flex-1 px-4 py-2.5 rounded-lg border border-border bg-surface text-text focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <button
            onClick={startAdvice}
            disabled={streaming}
            className="flex items-center gap-2 bg-accent hover:bg-accent-hover disabled:opacity-50 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
          >
            {streaming ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            {streaming ? "Generuję..." : "Doradź mi"}
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