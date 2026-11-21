import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { CATEGORIES, STALLS, type Category } from "@/lib/data";
import { StallCard } from "./StallCard";

const normalize = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

export function SearchBox({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <label className="flex max-w-3xl items-center gap-3 border-2 border-border bg-card px-5 py-4 focus-within:shadow-[4px_4px_0_0_var(--color-header)]">
      <Search className="size-5 shrink-0" />
      <span className="sr-only">Buscar</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Busca restaurantes o tipo de comida"
        className="w-full bg-transparent text-lg outline-none placeholder:text-muted-foreground"
      />
    </label>
  );
}

export function useStallFilter() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category | "todos">("todos");
  const results = useMemo(() => {
    const q = normalize(query.trim());
    return STALLS.filter((s) => {
      if (category !== "todos" && s.category !== category) return false;
      if (!q) return true;
      const hay = [s.name, s.categoryLabel, ...s.products.map((p) => p.name)].map(normalize).join(" ");
      return hay.includes(q);
    });
  }, [query, category]);
  return { query, setQuery, category, setCategory, results };
}

export function StallGrid({
  category,
  setCategory,
  results,
  onReset,
}: ReturnType<typeof useStallFilter> & { onReset: () => void }) {
  return (
    <section aria-label="Puestos">
      <div className="flex flex-wrap gap-3">
        {CATEGORIES.map((c) => (
          <button key={c.id} type="button" className="chip" data-active={category === c.id} onClick={() => setCategory(c.id)}>
            {c.label}
          </button>
        ))}
      </div>
      {results.length === 0 ? (
        <div className="panel mt-8 p-8 text-center">
          <p className="font-display text-2xl">No encontramos puestos</p>
          <p className="mt-1 text-muted-foreground">Prueba con otra palabra o categoría.</p>
          <button type="button" className="btn-ink mt-5" onClick={onReset}>
            Ver todos
          </button>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((s) => (
            <StallCard key={s.id} stall={s} />
          ))}
        </div>
      )}
    </section>
  );
}
