import { createFileRoute } from "@tanstack/react-router";
import { STALLS } from "@/lib/data";
import { PromoCard } from "@/components/pidelo/PromoCard";
import { SearchBox, StallGrid, useStallFilter } from "@/components/pidelo/StallBrowser";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PIDELO — ¿Qué se te antoja hoy?" },
      { name: "description", content: "Busca puestos, revisa las promociones del mes y arma tu pedido en PIDELO." },
      { property: "og:title", content: "PIDELO — ¿Qué se te antoja hoy?" },
      { property: "og:description", content: "Salteñas, parrilla, pizza, hamburguesas, sushi y postres en un solo carrito." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const monthName = () => new Intl.DateTimeFormat("es-BO", { month: "long" }).format(new Date());

function Index() {
  const filter = useStallFilter();
  const promoStalls = STALLS.filter((s) => s.promotion);
  return (
    <div className="pt-12">
      <h1 className="text-5xl sm:text-7xl">¿Qué se te antoja hoy?</h1>
      <div className="mt-8">
        <SearchBox value={filter.query} onChange={filter.setQuery} />
      </div>

      <h2 className="mt-12 text-3xl sm:text-4xl">Promociones de {monthName()}</h2>
      <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {promoStalls.map((s) => (
          <PromoCard key={s.id} stall={s} />
        ))}
      </div>

      <div className="mt-8">
        <StallGrid
          {...filter}
          onReset={() => {
            filter.setQuery("");
            filter.setCategory("todos");
          }}
        />
      </div>
    </div>
  );
}
