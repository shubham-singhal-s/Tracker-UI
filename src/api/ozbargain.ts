export const getOzbargainDeals = async (term: string, hideOld: boolean) => {
  const data = await fetch(
    "https://randoms.shubham21197.workers.dev/api/deals/" + term,
    {
      headers: {
        Accept: "application/json",
      },
    }
  );

  const response = await data.json();

  return hideOld ? response.filter((deal: any) => deal.date <= 1) : response;
};
