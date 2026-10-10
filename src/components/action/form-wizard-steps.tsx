import { cn } from "@/lib/utils";

export default function FormWizardSteps({
  labels,
  currentIndex,
}: {
  labels: string[];
  currentIndex: number;
}) {
  if (labels.length <= 1) return null;

  return (
    <nav aria-label="Progress" className="w-full">
      <ol className="flex items-start justify-between gap-1">
        {labels.map((label, index) => {
          const done = index < currentIndex;
          const active = index === currentIndex;
          return (
            <li
              key={label}
              className={cn(
                "flex min-w-0 flex-1 flex-col items-center gap-1.5",
                index === labels.length - 1 && "flex-none",
              )}
            >
              <div className="flex w-full items-center">
                {index > 0 ? (
                  <div
                    className={cn(
                      "h-px min-w-2 flex-1",
                      index <= currentIndex ? "bg-rc-fg/40" : "bg-rc-border",
                    )}
                    aria-hidden
                  />
                ) : (
                  <div className="min-w-2 flex-1" aria-hidden />
                )}
                <span
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold tabular-nums transition-colors",
                    active && "bg-rc-fg text-rc-bg shadow-sm",
                    done && "bg-rc-fg/90 text-rc-bg",
                    !active && !done && "border border-rc-border bg-rc-surface text-rc-fg-muted",
                  )}
                  aria-current={active ? "step" : undefined}
                >
                  {index + 1}
                </span>
                {index < labels.length - 1 ? (
                  <div
                    className={cn(
                      "h-px min-w-2 flex-1",
                      index < currentIndex ? "bg-rc-fg/40" : "bg-rc-border",
                    )}
                    aria-hidden
                  />
                ) : (
                  <div className="min-w-2 flex-1" aria-hidden />
                )}
              </div>
              <span
                className={cn(
                  "w-full truncate px-0.5 text-center text-[11px] font-medium leading-tight sm:text-xs",
                  active ? "text-rc-fg" : "text-rc-fg-muted",
                )}
              >
                {label}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
