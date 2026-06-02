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

const baseUrl = import.meta.env.VITE_IS_LOCAL ? "http://localhost:8787" : "https://randoms.shubham21197.workers.dev";

export const getOzbargainDeals = async (term: string, hideOld: boolean): Promise<OzbargainDeal[]> => {
  const data = await fetch(baseUrl + "/api/deals/" + term, {
    headers: {
      Accept: "application/json",
    },
  });

  const response = await data.json();

  return hideOld ? response.filter((deal: OzbargainDeal) => deal.date <= 1) : response;
};

export const getOzbargainDealsBulk = async (terms: string[]): Promise<Record<string, OzbargainDeal[]>> => {
  const data = await fetch(baseUrl + "/api/deals/", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ terms }),
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
