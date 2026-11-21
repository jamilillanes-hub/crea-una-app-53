import { cn } from "@/lib/utils";

export function FoodImage({ src, alt = "", className }: { src: string; alt?: string; className?: string }) {
  return <img src={src} alt={alt} loading="lazy" draggable={false} className={cn("select-none object-contain", className)} />;
}
