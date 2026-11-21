import { Link } from "@tanstack/react-router";
import { Clock, Star } from "lucide-react";
import { STALL_SURFACE, type Stall } from "@/lib/data";
import { cn } from "@/lib/utils";
import { FoodImage } from "./FoodImage";
import { PriceTag } from "./PriceTag";

export function StallCard({ stall }: { stall: Stall }) {
  const minPrice = Math.min(...stall.products.map((p) => p.price));
  return (
    <Link to="/r/$slug" params={{ slug: stall.slug }} className="lift block border-2 border-border bg-card">
      <div className={cn("relative h-36 border-b-2 border-border p-5", STALL_SURFACE[stall.color])}>
        <p className="text-xs font-bold tracking-[0.2em]">PUESTO</p>
        <p className="font-display text-6xl leading-none mt-3">{stall.number}</p>
        {stall.promotion && (
          <span className="absolute right-3 top-3 border-2 border-border bg-card px-2.5 py-0.5 text-xs font-bold tracking-[0.15em] text-foreground">
            PROMO
          </span>
        )}
        <FoodImage src={stall.image} alt={stall.name} className="absolute bottom-6 right-8 size-16 rotate-[-15deg]" />
      </div>
      <div className="flex items-start justify-between gap-3 p-5">
        <div className="min-w-0">
          <h3 className="text-2xl leading-tight">{stall.name}</h3>
          <p className="mt-1 flex items-center gap-1 text-muted-foreground">
            {stall.categoryLabel} · <Star className="size-4" /> {stall.rating}
          </p>
          <p className="mt-2 flex items-center gap-4 font-bold">
            <span className="flex items-center gap-1">
              <Clock className="size-4" /> {stall.minutes} min
            </span>
            <span>{stall.deliveryFee === 0 ? "Envío gratis" : `Envío Bs ${stall.deliveryFee}`}</span>
          </p>
        </div>
        <div className="shrink-0 pt-6">
          <PriceTag amount={minPrice} label="DESDE" />
        </div>
      </div>
    </Link>
  );
}
