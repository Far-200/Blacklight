import { Check, Copy, X } from "lucide-react";

import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";

import { Button } from "./Button";

/** Copy a value, and say so afterwards. The label changes, not just the icon. */
export function CopyButton({
  value,
  label = "Copy",
  copiedLabel = "Copied",
  size = "sm",
  variant = "secondary",
  className,
}: {
  value: string;
  label?: string;
  copiedLabel?: string;
  size?: "sm" | "md";
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
}) {
  const { copied, failed, copy } = useCopyToClipboard();

  return (
    <Button
      size={size}
      variant={variant}
      className={className}
      onClick={() => {
        void copy(value);
      }}
      icon={
        failed ? (
          <X aria-hidden className="size-3.5" />
        ) : copied ? (
          <Check aria-hidden className="size-3.5" />
        ) : (
          <Copy aria-hidden className="size-3.5" />
        )
      }
    >
      {failed ? "Copy failed" : copied ? copiedLabel : label}
    </Button>
  );
}
