import type { ProductDeal } from "@/api/product-deals";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ExternalLink, Tag, ShoppingCart } from "lucide-react";
import type { FC } from "react";

const sourceColors: Record<string, string> = {
  Kmart: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  Target: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  "Big W": "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300",
  "Amazon AU": "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  OzBargain: "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300",
};

interface ProductCardProps {
  deal: ProductDeal;
}

export const ProductCard: FC<ProductCardProps> = ({ deal }) => (
  <a
    href={deal.url}
    target="_blank"
    rel="noreferrer"
    className="group rounded-xl focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
  >
    <Card className="flex flex-col w-full h-full overflow-hidden border bg-card text-card-foreground shadow-sm transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 pt-0 pb-1">
      {/* Thumbnail — always reserve the space */}
      <div className="relative aspect-video w-full overflow-hidden bg-muted">
        {deal.imageUrl ? (
          <img
            src={deal.imageUrl}
            alt={deal.title}
            className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground/30">
            <ShoppingCart size={36} />
          </div>
        )}
      </div>

      {/* Source badge */}
      <div className="flex items-center justify-between px-4 pt-3 pb-0">
        <span
          className={cn(
            "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold",
            sourceColors[deal.sourceName] ?? "bg-muted text-muted-foreground",
          )}
        >
          {deal.sourceName}
        </span>
        {deal.onSpecial && (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-medium text-red-700 dark:bg-red-900/40 dark:text-red-300">
            <Tag size={10} />
            Special
          </span>
        )}
      </div>

      {/* Title */}
      <CardHeader className="gap-1 px-4 pt-2 pb-0">
        <CardTitle className="line-clamp-2 text-sm font-semibold leading-snug">
          {deal.title}
        </CardTitle>
      </CardHeader>

      {/* Price + stock */}
      <CardContent className="mt-auto flex items-end justify-between gap-2 px-4 pt-2 pb-3">
        <span className="text-xl font-bold tabular-nums text-green-700 dark:text-green-400">
          {deal.priceText}
        </span>
        <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
          {deal.inStock ? (
            <>
              <ShoppingCart size={10} />
              In stock
            </>
          ) : (
            "Out of stock"
          )}
          <ExternalLink size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
        </span>
      </CardContent>
    </Card>
  </a>
);
