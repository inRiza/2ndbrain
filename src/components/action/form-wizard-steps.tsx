import { cn } from "@/lib/utils";

export default function FormWizardSteps({
  labels,
  currentIndex,
}: {
  labels: string[];
  currentIndex: number;
}) {
  if (labels.length <= 1) return null;

  const total = labels.length;
  const progress = ((currentIndex + 1) / total) * 100;

  return (
    <nav aria-label="Progress" className="flex w-full flex-col gap-3">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-xs font-medium tracking-wide text-rc-fg-subtle uppercase">
          Step {currentIndex + 1} of {total}
        </p>
        <p className="truncate text-sm font-medium text-rc-fg">{labels[currentIndex]}</p>
      </div>
      <div
        className="h-1 w-full overflow-hidden rounded-full bg-rc-surface-hover"
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={currentIndex + 1}
        aria-label={`Step ${currentIndex + 1}: ${labels[currentIndex]}`}
      >
        <div
          className="h-full rounded-full bg-rc-fg transition-[width] duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <ol className="flex justify-between gap-2">
        {labels.map((label, index) => {
          const active = index === currentIndex;
          const done = index < currentIndex;
          return (
            <li
              key={label}
              className={cn(
                "min-w-0 flex-1 truncate text-center text-xs",
                active && "font-medium text-rc-fg",
                done && !active && "text-rc-fg-muted",
                !active && !done && "text-rc-fg-subtle",
              )}
              aria-current={active ? "step" : undefined}
            >
              {label}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
