import { useEffect, useRef } from "react";

import { Button } from "./Button";

/**
 * Confirmation for actions that cannot be undone.
 *
 * Built on <dialog> so focus trapping, Escape and the backdrop come from the
 * platform rather than from a re-implementation. The confirm button repeats the
 * verb from the trigger, so the user is never asked to confirm "OK".
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = "Cancel",
  destructive = false,
  busy = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  destructive?: boolean;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;

    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;

    const handleCancel = (event: Event) => {
      event.preventDefault();
      onCancel();
    };
    dialog.addEventListener("cancel", handleCancel);
    return () => {
      dialog.removeEventListener("cancel", handleCancel);
    };
  }, [onCancel]);

  return (
    <dialog
      ref={ref}
      className="m-auto w-[min(28rem,calc(100vw-2rem))] rounded-[var(--radius-panel)] border border-line-strong bg-surface p-0 text-fg backdrop:bg-black/70"
    >
      <div className="p-5">
        <h2 className="text-base font-semibold">{title}</h2>
        <p className="mt-2 text-[0.8125rem] leading-relaxed text-muted">
          {description}
        </p>
      </div>
      <div className="flex justify-end gap-2 border-t border-line px-5 py-3">
        <Button variant="ghost" onClick={onCancel} disabled={busy}>
          {cancelLabel}
        </Button>
        <Button
          variant={destructive ? "danger" : "primary"}
          onClick={onConfirm}
          loading={busy}
        >
          {confirmLabel}
        </Button>
      </div>
    </dialog>
  );
}
