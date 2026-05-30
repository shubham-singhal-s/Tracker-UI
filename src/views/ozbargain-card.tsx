import type { OzbargainDeal } from "@/api/ozbargain";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, parseTitle, timeAgo } from "@/lib/deal-utils";
import { cn } from "@/lib/utils";
import { ArrowDown, ArrowUp, Calendar, MessageSquare, MousePointer } from "lucide-react";
import type { FC, ReactNode } from "react";

const Pill: FC<{ icon: ReactNode; label: string; value: string; className: string }> = ({
  icon,
  label,
  value,
  className,
}) => (
  <span
    className={cn(
      "inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-medium leading-none",
      className,
    )}
    title={label}
  >
    {icon}
    {value}
  </span>
);

interface DealCardProps {
  deal: OzbargainDeal;
}

export const DealCard: FC<DealCardProps> = ({ deal }) => {
  const { provider, dealTitle } = parseTitle(deal.title);

  return (
    <a
      href={deal.url}
      target="_blank"
      rel="noreferrer"
      className="group rounded-xl focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      aria-label={`${dealTitle} from ${provider}`}
    >
      <Card className="flex flex-col w-75 justify-start gap-3 overflow-hidden border bg-card text-card-foreground shadow-sm transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 h-full pt-0 pb-1">
        <div className="relative aspect-video w-full overflow-hidden bg-muted">
          <img
            src={deal.thumbnail}
            alt={deal.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute right-2 top-2">
            <span className="inline-flex items-center rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
              {provider}
            </span>
          </div>
        </div>

        <CardHeader className="gap-1 px-4 pt-0 pb-0">
          <CardTitle className="line-clamp-2 text-sm font-semibold leading-snug">{dealTitle}</CardTitle>
          {deal.description && (
            <CardDescription className="line-clamp-2 text-[11px] leading-normal text-muted-foreground">
              {deal.description}
            </CardDescription>
          )}
        </CardHeader>

        <CardContent className="flex flex-wrap gap-1.5 px-4 py-0">
          <Pill
            icon={<ArrowUp size={10} />}
            label="Up votes"
            value={deal.ups}
            className="bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300"
          />
          <Pill
            icon={<ArrowDown size={10} />}
            label="Down votes"
            value={deal.downs}
            className="bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300"
          />
          <Pill
            icon={<MessageSquare size={10} />}
            label="Comments"
            value={deal.comments}
            className="bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300"
          />
          <Pill
            icon={<MousePointer size={10} />}
            label="Clicks"
            value={deal.clicks}
            className="bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
          />
        </CardContent>

        <CardFooter className="mt-auto flex flex-col gap-2 px-4 pt-1 pb-4">
          <div className="flex w-full flex-wrap gap-1">
            {deal.categories?.map((cat) => (
              <span
                key={cat}
                className="inline-flex items-center rounded-full bg-muted px-1.5 text-[10px] font-medium text-muted-foreground leading-none py-0.5"
              >
                {cat}
              </span>
            ))}
          </div>
          <div className="flex w-full items-center justify-between text-[10px] text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Calendar size={10} />
              {formatDate(deal.publishedAt)}
            </span>
            <span>{timeAgo(deal.publishedAt)}</span>
          </div>
        </CardFooter>
      </Card>
    </a>
  );
};
