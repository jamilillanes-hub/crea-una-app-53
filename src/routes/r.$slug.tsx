import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Clock, Plus, Star } from "lucide-react";
import { toast } from "sonner";
import { getStallBySlug, promoDescription, promoTitle, STALL_SURFACE, type Product } from "@/lib/data";
import { formatBs } from "@/lib/pricing";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { FoodImage } from "@/components/pidelo/FoodImage";
import { PriceTag } from "@/components/pidelo/PriceTag";
import { QtyControl } from "@/components/pidelo/QtyControl";

export const Route = createFileRoute("/r/$slug")({
  loader: ({ params }) => {
    const stall = getStallBySlug(params.slug);
    if (!stall) throw notFound();
    return { stall };
  },
  head: ({ loaderData }) => {
    const stall = loaderData?.stall;
    const title = stall ? `${stall.name} — PIDELO` : "Puesto no encontrado — PIDELO";
    const description = stall
      ? `Menú de ${stall.name}: ${stall.products.map((p) => p.name).slice(0, 4).join(", ")}.`
      : "Este puesto no existe.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
        ...(stall ? [] : [{ name: "robots", content: "noindex" }]),
      ],
    };
  },
  component: StallPage,
});

function StallPage() {
  const { stall } = Route.useLoaderData();
  const sections = [...new Set(stall.products.map((p) => p.section))];

  return (
    <div className="pt-6">
      <Link to="/" className="mb-4 inline-flex items-center gap-2 font-bold hover:underline">
        <ArrowLeft className="size-4" /> Volver
      </Link>
      <section className={cn("relative flex items-center gap-6 border-2 border-border px-8 py-7", STALL_SURFACE[stall.color])}>
        <div className="border-r-2 border-current pr-7">
          <p className="text-xs font-bold tracking-[0.2em]">PUESTO</p>
          <p className="font-display text-7xl leading-none">{stall.number}</p>
        </div>
        <div className="min-w-0">
          <h1 className="text-4xl sm:text-6xl">{stall.name}</h1>
          <p className="mt-2 flex flex-wrap items-center gap-x-1.5 text-lg font-semibold">
            {stall.categoryLabel} · <Star className="size-4" /> {stall.rating} · <Clock className="size-4" /> {stall.minutes} min ·{" "}
            {stall.deliveryFee === 0 ? "Envío gratis" : `Envío ${formatBs(stall.deliveryFee)}`}
          </p>
        </div>
        <FoodImage src={stall.image} alt="" className="ml-auto hidden size-24 rotate-[-15deg] md:block" />
      </section>

      {stall.promotion && (
        <div className="panel mt-4 px-5 py-4 text-lg">
          <span className="font-display text-xl">{promoTitle(stall.promotion)}</span>{" "}
          {promoDescription(stall.promotion, stall.name)}
        </div>
      )}

      {sections.map((section) => (
        <section key={section} className="mt-10">
          <h2 className="text-3xl">{section}</h2>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {stall.products
              .filter((p) => p.section === section)
              .map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  const { qtyOf, add, setQty, setCartOpen } = useStore();
  const qty = qtyOf(product.id);
  return (
    <article className="panel flex flex-wrap items-center gap-4 px-6 py-5 sm:flex-nowrap">
      <FoodImage src={product.image} alt="" className="size-12 shrink-0" />
      <div className="min-w-0 flex-1">
        <h3 className="text-2xl leading-tight">{product.name}</h3>
        <p className="text-muted-foreground">{product.description}</p>
      </div>
      <PriceTag amount={product.price} />
      <div className="flex w-36 justify-end">
        {qty > 0 ? (
          <QtyControl qty={qty} label={product.name} onChange={(q) => setQty(product.id, q)} />
        ) : (
          <button
            type="button"
            className="btn-ink h-12"
            onClick={() => {
              add(product.id);
              toast(`${product.name} agregado`, { action: { label: "Ver carrito", onClick: () => setCartOpen(true) } });
            }}
          >
            <Plus className="size-4" /> Agregar
          </button>
        )}
      </div>
    </article>
  );
}
