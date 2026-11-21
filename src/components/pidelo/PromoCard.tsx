import { Link } from "@tanstack/react-router";
import { STALL_SURFACE, promoDescription, promoTitle, type Stall } from "@/lib/data";
import { cn } from "@/lib/utils";
import { FoodImage } from "./FoodImage";

export function PromoCard({ stall }: { stall: Stall }) {
  if (!stall.promotion) return null;
  const title = promoTitle(stall.promotion);
  const [first, ...rest] = title.split(" de ");
  return (
    <Link
      to="/r/$slug"
      params={{ slug: stall.slug }}
      className={cn("lift flex min-h-56 items-center gap-5 border-2 border-border p-6", STALL_SURFACE[stall.color])}
    >
      <FoodImage src={stall.image} className="size-14 shrink-0" />
      <div>
        <p className="font-display text-3xl leading-[1.05]">
          {rest.length ? (
            <>
              {first}
              <br />
              de {rest.join(" de ")}
            </>
          ) : (
            title
          )}
        </p>
        <p className="mt-2 text-lg leading-snug">{promoDescription(stall.promotion, stall.name)}</p>
        <p className="mt-3 text-xs font-bold tracking-[0.15em]">HASTA FIN DE MES</p>
      </div>
    </Link>
  );
}
