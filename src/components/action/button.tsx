import { cn } from "@/lib/utils";

interface ButtonProps {
  children: React.ReactNode;
  purpose: "nav" | "hyperlink" | "action";
  href?: string;
  className?: string;
  style?: "primary" | "secondary" | "ghost" | "muted";
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

function Button({
  children,
  purpose,
  href = "",
  className = "",
  style = "primary",
  onClick,
}: ButtonProps) {
  const sharedClassName = cn(
    "inline-flex cursor-pointer items-center justify-center rounded-md border border-transparent px-3.5 py-1.5 text-sm font-medium transition-[box-shadow,background-color,color] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rc-primary/40",
    style === "primary" && "rc-btn-primary text-rc-primary-fg",
    style === "secondary" &&
      "border-rc-border bg-rc-surface text-rc-fg hover:bg-rc-surface-hover",
    style === "ghost" &&
      "border-transparent bg-transparent text-rc-fg-muted hover:bg-rc-surface-hover hover:text-rc-fg",
    style === "muted" && "rc-btn-muted",
    className,
  );

  if (purpose === "nav" && href) {
    return (
      <a href={href} className={sharedClassName}>
        {children}
      </a>
    );
  }

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (purpose === "hyperlink") {
      window.open(href, "_blank", "noopener,noreferrer");
    } else if (purpose === "action") {
      onClick?.(event);
    }
  };

  return (
    <button type="button" onClick={handleClick} className={sharedClassName}>
      {children}
    </button>
  );
}

export default Button;
