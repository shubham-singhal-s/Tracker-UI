import { useQuery } from "@tanstack/react-query";
import { Search, AlertCircle, Loader2, ArrowLeft } from "lucide-react";
import { useState, useMemo, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";

import { searchProductDeals } from "@/api/product-deals";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ProductCard } from "@/views/product-card";

const ProductDeals = () => {
  const [query, setQuery] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const {
    data,
    isFetching,
    isError,
    error,
  } = useQuery({
    queryKey: ["product-deals", searchTerm],
    queryFn: () => searchProductDeals(searchTerm),
    enabled: searchTerm.length > 0,
    staleTime: 1000 * 60 * 30,
    retry: false,
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) setSearchTerm(trimmed);
  };

  const hasSearched = searchTerm.length > 0;
  const hasResults = data && data.deals.length > 0;

  // ── Client-side source filter ──────────────────────────────────────────
  const [filterSource, setFilterSource] = useState<string | null>(null);

  const toggleSource = (source: string) => {
    setFilterSource((prev) => (prev === source ? null : source));
  };

  const filteredDeals = useMemo(() => {
    if (!data) return [];
    if (!filterSource) return data.deals;
    return data.deals.filter(
      (d) => d.source === filterSource || d.sourceName === filterSource,
    );
  }, [data, filterSource]);

  // Compute per-store-name counts
  const storeCounts = useMemo(() => {
    if (!data) return {};
    const counts: Record<string, number> = {};
    for (const d of data.deals) {
      const key = d.sourceName;
      counts[key] = (counts[key] ?? 0) + 1;
    }
    return counts;
  }, [data]);

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={16} />
            Home
          </Link>
          <h1 className="text-lg font-semibold tracking-tight">Product Deals</h1>
        </div>
      </header>

      {/* Search bar */}
      <div className="mx-auto max-w-5xl px-4 pt-6 pb-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            className="h-11 text-base"
            placeholder='Search across Kmart, Big W, Amazon AU, OzBargain…'
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Button type="submit" disabled={isFetching || !query.trim()} className="h-11 px-5">
            {isFetching ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Search size={16} />
            )}
            <span className="ml-1.5 hidden sm:inline">Search</span>
          </Button>
        </form>
      </div>

      {/* Results area */}
      <div className="mx-auto max-w-5xl px-4 pb-12">
        {/* Loading */}
        {isFetching && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-xl border bg-card p-0 overflow-hidden">
                <Skeleton className="aspect-video w-full rounded-none" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-3 w-16 rounded-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-6 w-20 mt-2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {!isFetching && isError && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <AlertCircle size={40} className="text-destructive mb-3" />
            <p className="text-sm font-medium text-destructive">Failed to load deals</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {error instanceof Error ? error.message : "Something went wrong"}
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => setSearchTerm(searchTerm)} // retrigger query
            >
              Retry
            </Button>
          </div>
        )}

        {/* Empty: no search yet */}
        {!isFetching && !isError && !hasSearched && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Search size={48} className="text-muted-foreground/40 mb-4" />
            <p className="text-sm font-medium text-muted-foreground">
              Search for a product to find the best deals
            </p>
            <p className="mt-1 text-xs text-muted-foreground/60">
              Kmart · Big W · Amazon AU · OzBargain · Chemist Warehouse · Coles · Woolworths
            </p>
          </div>
        )}

        {/* Empty: searched but no results */}
        {!isFetching && !isError && hasSearched && !hasResults && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Search size={40} className="text-muted-foreground/30 mb-3" />
            <p className="text-sm font-medium text-muted-foreground">
              No deals found for <span className="text-foreground">"{searchTerm}"</span>
            </p>
            <p className="mt-1 text-xs text-muted-foreground/60">
              Try a broader or different search term
            </p>
          </div>
        )}

        {/* Results */}
        {!isFetching && hasResults && (
          <>
            {/* Source summary */}
            <div className="mb-4 flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
              <span className="font-medium text-foreground">
                {filteredDeals.length} results
                {filterSource && <> in <span className="text-foreground font-semibold">{filterSource}</span></>}
              </span>
              <span>·</span>
              {Object.entries(storeCounts)
                .sort(([, a], [, b]) => b - a)
                .map(([store, count]) => (
                  <button
                    key={store}
                    type="button"
                    onClick={() => toggleSource(store)}
                    className={cn(
                      "inline-flex items-center rounded-full px-2 py-0.5 transition-colors",
                      filterSource === store
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted hover:bg-muted-foreground/15",
                    )}
                  >
                    {store} {count}
                  </button>
                ))}
              {filterSource && (
                <button
                  type="button"
                  onClick={() => setFilterSource(null)}
                  className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-muted-foreground hover:text-foreground transition-colors"
                >
                  × clear
                </button>
              )}
            </div>

            {/* Deal cards */}
            {filteredDeals.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredDeals.map((deal, i) => (
                  <ProductCard key={`${deal.source}-${deal.url}-${i}`} deal={deal} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-sm text-muted-foreground">
                  No {filterSource} results for <span className="text-foreground">"{searchTerm}"</span>
                </p>
                <button
                  type="button"
                  onClick={() => setFilterSource(null)}
                  className="mt-2 text-xs text-primary hover:underline"
                >
                  Show all sources
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
};

export default ProductDeals;
