export const parseTitle = (title: string) => {
  const parts = title.split("@");
  const provider = parts.length > 1 ? parts[parts.length - 1].trim() : "Unknown";
  const dealTitle = parts.length > 1 ? parts.slice(0, -1).join("@").trim() : title.trim();
  return { provider, dealTitle };
};

export const timeAgo = (dateStr: string) => {
  const then = new Date(dateStr).getTime();
  const now = Date.now();
  const diffMs = now - then;
  const diffH = Math.floor(diffMs / (1000 * 60 * 60));
  const diffD = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffH < 1) return "Just now";
  if (diffH < 24) return `${diffH}h ago`;
  if (diffD === 1) return "1d ago";
  return `${diffD}d ago`;
};

export const formatDate = (dateStr: string) => {
  try {
    return new Date(dateStr).toLocaleDateString("en-AU", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
};
