export interface OzbargainDeal {
  title: string;
  url: string;
  ups: string;
  downs: string;
  thumbnail: string;
  date: number;
  author: string;
  clicks: string;
  comments: string;
  externalUrl: string;
  expiry: string;
  categories: string[];
  description: string;
  publishedAt: string;
}

export interface OzbargainDealsResponse {
  deals: OzbargainDeal[];
  error?: string;
}

const baseUrl = import.meta.env.VITE_IS_LOCAL ? "http://localhost:8787" : "https://randoms.shubham21197.workers.dev";

export const getOzbargainDeals = async (term: string): Promise<OzbargainDealsResponse> => {
  const data = await fetch(baseUrl + "/api/deals/" + encodeURIComponent(term), {
    headers: {
      Accept: "application/json",
    },
  });

  return await data.json();
};

export const getOzbargainFrontpage = async (): Promise<OzbargainDeal[]> => {
  const data = await fetch(baseUrl + "/api/deals/", {
    headers: {
      Accept: "application/json",
    },
  });

  return await data.json();
};
