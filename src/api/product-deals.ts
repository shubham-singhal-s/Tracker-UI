export interface ProductDeal {
  title: string;
  price: number | null;
  priceText: string;
  url: string;
  imageUrl: string;
  source: "ozbargain" | "kmart" | "bigw" | "amazon";
  sourceName: string;
  inStock: boolean;
  onSpecial: boolean;
  relevance?: number;
}

export interface SearchResult {
  query: string;
  deals: ProductDeal[];
  sources: Record<string, number>;
}

const baseUrl = import.meta.env.VITE_IS_LOCAL
  ? "http://localhost:8787"
  : "https://randoms.shubham21197.workers.dev";

export const searchProductDeals = async (
  query: string,
): Promise<SearchResult> => {
  const data = await fetch(
    `${baseUrl}/api/product-deals?q=${encodeURIComponent(query)}`,
    { headers: { Accept: "application/json" } },
  );
  return await data.json();
};
