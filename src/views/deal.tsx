import { getOzbargainDeals } from "@/api/ozbargain";
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardFooter, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Star } from "lucide-react";
import type { FC } from "react";

interface OzbProps {
  deal: string;
  hideOld?: boolean;
}

const removeFromLocalStorage = (deal: string) => {
  if (!deal || !confirm("Do you want to remove: " + deal)) {
    return;
  }

  const savedDeals = JSON.parse(localStorage.getItem("savedDeals") || "[]") as string[];
  const updatedDeals = savedDeals.filter((d) => d !== deal);
  localStorage.setItem("savedDeals", JSON.stringify(updatedDeals));
  window.dispatchEvent(new Event("savedDealsUpdated"));
};

const parseTitle = (title: string) => {
  const parts = title.split("@");
  const provider = parts.length > 1 ? parts[parts.length - 1].trim() : "Unknown";
  const dealTitle = parts.length > 1 ? parts.slice(0, -1).join("@").trim() : title.trim();

  return { provider, dealTitle };
};

export const Ozb: FC<OzbProps> = ({ deal, hideOld = true }) => {
  const query = useQuery({
    queryKey: ["bargains", deal, hideOld],
    queryFn: () => getOzbargainDeals(deal, hideOld),
    retry: false,
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  const newDeals = query.data?.some((d: any) => d.date <= 1);

  if (!query?.data?.length && hideOld) {
    return <></>;
  }

  const renderTitle = (deal: any) => {
    const { provider, dealTitle } = parseTitle(deal.title);
    return (
      <div className="flex flex-col gap-2 justify-center align-middle">
        <div className="text-md font-bold px-2">{dealTitle}</div>
        <div className="text-xs mt-4 px-2 bg-sky-900 w-fit mx-auto rounded-t-md p-1">{provider}</div>
      </div>
    );
  };

  return (
    <div>
      <AccordionItem value={"deals" + deal}>
        <AccordionTrigger className="border px-4 rounded-none">
          <a
            className="flex flex-row gap-2 align-center"
            href={`https://www.ozbargain.com.au/search/node/${deal}`}
            target="_blank"
            rel="noreferrer"
          >
            <span>
              {query.data?.length || "0"} <span className="text-blue-400 font-bold">{deal}</span> deals
            </span>
            {newDeals ? <Star size={16} className="text-yellow-400" /> : ""}
          </a>
        </AccordionTrigger>
        <AccordionContent className="pt-4 bg-gray-50 dark:bg-neutral-900">
          <div>
            <div className="flex flex-row gap-4 justify-center items-stretch flex-wrap">
              {query.data
                ?.sort((a: any, b: any) => a.date - b.date)
                .map((deal: any, index: number) => (
                  <div className="w-xs" key={index}>
                    <Card
                      className="shadow-sm shadow-neutral-800 bg-gray-950 border-none h-full relative flex items-center justify-center overflow-hidden cursor-pointer gap-0"
                      onClick={() => window.open(deal.url, "_blank")}
                    >
                      <CardTitle>{renderTitle(deal)}</CardTitle>
                      <CardDescription>
                        <img src={deal.thumbnail} alt={deal.title} />
                      </CardDescription>
                      <CardFooter className="mt-8 flex flex-col gap-2">
                        <div className="font-bold">
                          {deal.date || "--"} {deal.date === 1 ? "day" : "days"} ago
                        </div>
                        <div className="flex flex-row justify-center items-center gap-0">
                          <span className="bg-green-800 font-extrabold px-2 rounded-l-sm">✓ {deal.ups}</span>
                          <span className="bg-red-700 font-extrabold px-2 rounded-r-sm">✗ {deal.downs}</span>
                        </div>
                      </CardFooter>
                    </Card>
                  </div>
                ))}
            </div>
            <Button onClick={() => removeFromLocalStorage(deal)} variant="destructive" className="mt-4">
              Remove
            </Button>
          </div>
        </AccordionContent>
      </AccordionItem>
    </div>
  );
};
