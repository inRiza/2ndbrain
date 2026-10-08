import { cn } from "@/lib/utils";

export default function UserAvatar({
  username,
  avatarUrl,
  size = 32,
  className = "",
}: {
  username: string;
  avatarUrl: string;
  size?: number;
  className?: string;
}) {
  return (
    <img
      src={avatarUrl}
      alt=""
      width={size}
      height={size}
      className={cn("shrink-0 rounded-full border border-rc-border bg-rc-surface", className)}
      aria-hidden
      title={username}
    />
  );
}
