import { createFileRoute } from "@tanstack/react-router";
import { SearchBox, StallGrid, useStallFilter } from "@/components/pidelo/StallBrowser";

export const Route = createFileRoute("/puestos")({
  head: () => ({
    meta: [
      { title: "Puestos — PIDELO" },
      { name: "description", content: "Todos los puestos de PIDELO: salteñas, parrilla, pizza, hamburguesas, sushi y postres." },
      { property: "og:title", content: "Puestos — PIDELO" },
      { property: "og:description", content: "Elige un puesto y revisa su menú." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PuestosPage,
});

function PuestosPage() {
  const filter = useStallFilter();
  return (
    <div className="pt-12">
      <h1 className="text-5xl sm:text-6xl">Puestos</h1>
      <div className="mb-8 mt-6">
        <SearchBox value={filter.query} onChange={filter.setQuery} />
      </div>
      <StallGrid
        {...filter}
        onReset={() => {
          filter.setQuery("");
          filter.setCategory("todos");
        }}
      />
    </div>
  );
}
