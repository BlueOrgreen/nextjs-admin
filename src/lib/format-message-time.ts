export function formatMessageTime(timestamp: string) {
  const messageDate = new Date(timestamp);
  const now = new Date();
  const diffInMinutes = Math.floor(
    (now.getTime() - messageDate.getTime()) / (60 * 1000),
  );
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  // For messages from today, show time
  if (diffInDays === 0) {
    // If less than 60 minutes ago, show "X分钟前"
    if (diffInMinutes < 60) {
      return diffInMinutes === 0 ? "刚刚" : `${diffInMinutes}分钟前`;
    }
    // Otherwise show time like "16:39"
    return messageDate.toLocaleTimeString("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  }

  // For messages from this week, show day name
  if (diffInDays < 7) {
    return messageDate.toLocaleDateString("zh-CN", { weekday: "short" });
  }

  // For messages from this year, show date
  if (messageDate.getFullYear() === now.getFullYear()) {
    return messageDate.toLocaleDateString("zh-CN", {
      day: "numeric",
      month: "short",
    });
  }

  // For older messages, show date with year
  return messageDate.toLocaleDateString("zh-CN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
