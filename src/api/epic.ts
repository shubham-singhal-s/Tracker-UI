export const getFreeGames = async () => {
  const data = await fetch(
    "https://randoms.shubham21197.workers.dev/api/epic",
    {
      body: null,
      method: "POST",
    }
  );

  return await data.json();
};
