import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { formatBs } from "@/lib/pricing";
import { useStore, type StallOrder } from "@/lib/store";
import { FoodImage } from "@/components/pidelo/FoodImage";

export const Route = createFileRoute("/pedidos")({
  head: () => ({
    meta: [
      { title: "Mis pedidos — PIDELO" },
      { name: "description", content: "Revisa tus compras y el estado de cada pedido por puesto." },
      { property: "og:title", content: "Mis pedidos — PIDELO" },
      { property: "og:description", content: "El estado de tus pedidos en PIDELO." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PedidosPage,
});

const STEPS = ["Recibido", "En preparación", "En camino", "Entregado"] as const;

/** Estado simulado según el tiempo transcurrido y el tiempo estimado del puesto. */
function statusOf(order: StallOrder, createdAt: number, now: number) {
  const mins = (now - createdAt) / 60000;
  if (mins < 1) return 0;
  if (mins < order.etaMinutes * 0.6) return 1;
  if (mins < order.etaMinutes) return 2;
  return 3;
}

function PedidosPage() {
  const { purchases, hydrated } = useStore();
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 15000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="pt-12">
      <h1 className="text-5xl sm:text-6xl">Mis pedidos</h1>
      {!hydrated ? null : purchases.length === 0 ? (
        <div className="panel mt-8 max-w-lg p-8">
          <p className="font-display text-2xl">Todavía no hiciste pedidos</p>
          <p className="mt-1 text-muted-foreground">Cuando confirmes una compra, aquí verás el estado de cada pedido.</p>
          <Link to="/puestos" className="btn-ink mt-5">
            Ver puestos
          </Link>
        </div>
      ) : (
        <div className="mt-8 space-y-8">
          {purchases.map((p) => (
            <article key={p.id} className="panel">
              <header className="flex flex-wrap items-baseline justify-between gap-3 border-b-2 border-border bg-tag px-6 py-4">
                <div>
                  <p className="text-xs font-bold tracking-[0.15em]">COMPRA {p.id.toUpperCase()}</p>
                  <p className="font-semibold">
                    {new Intl.DateTimeFormat("es-BO", { dateStyle: "medium", timeStyle: "short" }).format(p.createdAt)} ·{" "}
                    {p.orders.length} {p.orders.length === 1 ? "pedido" : "pedidos"} · {p.customer.address}
                  </p>
                </div>
                <p className="font-display text-3xl">{formatBs(p.total)}</p>
              </header>
              <div className="grid gap-0 md:grid-cols-2">
                {p.orders.map((o) => {
                  const step = statusOf(o, p.createdAt, now);
                  return (
                    <section key={o.id} className="border-b-2 border-border p-6 md:odd:border-r-2 last:border-b-0 md:[&:nth-last-child(2):nth-child(odd)]:border-b-0">
                      <h2 className="flex items-center gap-2 text-2xl">
                        <FoodImage src={o.stallImage} className="size-7" />
                        Puesto {o.stallNumber} · {o.stallName}
                      </h2>
                      <ol className="mt-3 flex gap-1" aria-label="Estado del pedido">
                        {STEPS.map((s, i) => (
                          <li key={s} className="flex-1">
                            <div className={i <= step ? "h-2 bg-primary" : "h-2 bg-muted"} />
                            <p className={i === step ? "mt-1 text-xs font-bold" : "mt-1 text-xs text-muted-foreground"}>{s}</p>
                          </li>
                        ))}
                      </ol>
                      <ul className="mt-4 space-y-1">
                        {o.lines.map((l) => (
                          <li key={l.name} className="flex justify-between">
                            <span>
                              {l.qty} × {l.name}
                            </span>
                            <span>{formatBs(l.lineTotal)}</span>
                          </li>
                        ))}
                      </ul>
                      <dl className="mt-3 space-y-0.5 text-sm text-muted-foreground">
                        {o.discount > 0 && (
                          <div className="flex justify-between">
                            <dt>Promoción</dt>
                            <dd>-{formatBs(o.discount)}</dd>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <dt>Envío</dt>
                          <dd>{o.delivery === 0 ? "Gratis" : formatBs(o.delivery)}</dd>
                        </div>
                      </dl>
                      <p className="mt-2 flex justify-between font-bold">
                        <span>Total del pedido</span>
                        <span>{formatBs(o.total)}</span>
                      </p>
                    </section>
                  );
                })}
              </div>
              {p.couponDiscount > 0 && (
                <p className="border-t-2 border-border px-6 py-3 font-semibold text-success">
                  Cupón {p.couponCode}: -{formatBs(p.couponDiscount)}
                </p>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
