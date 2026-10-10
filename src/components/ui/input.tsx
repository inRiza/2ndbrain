import { cn } from "@/lib/utils";

export function Input({
  className,
  type,
  ...props
}: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-lg border border-rc-border bg-rc-bg px-3 py-2 text-sm text-rc-fg transition-[color,box-shadow] placeholder:text-rc-fg-subtle focus-visible:border-rc-border-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rc-fg/8 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}
