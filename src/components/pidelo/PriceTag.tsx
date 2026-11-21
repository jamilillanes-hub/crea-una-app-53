import { formatBs } from "@/lib/pricing";

export function PriceTag({ amount, label }: { amount: number; label?: string }) {
  return (
    <span className="price-tag">
      <span className="flex flex-col items-center leading-none">
        {label && <span className="mb-1 font-sans text-[0.65rem] font-bold tracking-[0.15em]">{label}</span>}
        <span>{formatBs(amount)}</span>
      </span>
    </span>
  );
}
