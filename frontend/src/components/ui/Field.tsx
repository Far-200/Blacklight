import type {
  InputHTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes,
} from "react";
import { useId } from "react";
import { AlertCircle } from "lucide-react";

import { cn } from "@/utils/cn";

/**
 * Form field scaffolding.
 *
 * `Field` owns the id wiring so that every control is labelled, every hint and
 * error is referenced by aria-describedby, and errors carry role="alert". None
 * of that is left to the call site to remember.
 */
export function Field({
  label,
  hint,
  error,
  required,
  children,
  className,
}: {
  label: string;
  hint?: ReactNode;
  error?: string;
  required?: boolean;
  /** Receives the wired-up ids. */
  children: (ids: {
    id: string;
    describedBy: string | undefined;
    invalid: boolean;
  }) => ReactNode;
  className?: string;
}) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;

  const describedBy =
    [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(" ") ||
    undefined;

  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={id} className="block text-[0.8125rem] font-medium text-fg">
        {label}
        {required ? (
          <span className="ml-1 text-uv" aria-hidden>
            *
          </span>
        ) : (
          <span className="ml-2 text-xs font-normal text-faint">Optional</span>
        )}
      </label>

      {children({ id, describedBy, invalid: Boolean(error) })}

      {hint ? (
        <p id={hintId} className="text-xs leading-relaxed text-muted">
          {hint}
        </p>
      ) : null}

      {error ? (
        <p
          id={errorId}
          role="alert"
          className="flex items-start gap-1.5 text-xs text-danger"
        >
          <AlertCircle aria-hidden className="mt-px size-3.5 shrink-0" />
          {error}
        </p>
      ) : null}
    </div>
  );
}

const CONTROL_BASE =
  "w-full rounded-[var(--radius-control)] border bg-ink px-3 text-sm text-fg " +
  "placeholder:text-faint transition-colors duration-150 " +
  "hover:border-line-strong focus:border-uv focus:outline-none " +
  "disabled:cursor-not-allowed disabled:opacity-55";

export function TextInput({
  invalid,
  className,
  mono,
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & {
  invalid?: boolean;
  mono?: boolean;
}) {
  return (
    <input
      aria-invalid={invalid || undefined}
      className={cn(
        CONTROL_BASE,
        "h-10",
        mono && "font-mono text-[0.8125rem]",
        invalid ? "border-danger" : "border-line",
        className,
      )}
      {...rest}
    />
  );
}

export function TextArea({
  invalid,
  className,
  ...rest
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }) {
  return (
    <textarea
      aria-invalid={invalid || undefined}
      className={cn(
        CONTROL_BASE,
        "min-h-24 py-2 leading-relaxed",
        invalid ? "border-danger" : "border-line",
        className,
      )}
      {...rest}
    />
  );
}

export function Checkbox({
  label,
  description,
  className,
  id,
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & {
  label: ReactNode;
  description?: ReactNode;
}) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <div className={cn("flex items-start gap-3", className)}>
      <input
        id={inputId}
        type="checkbox"
        className={cn(
          "mt-0.5 size-4 shrink-0 rounded-[3px] border border-line-strong bg-ink",
          "accent-[var(--color-uv)]",
          "disabled:cursor-not-allowed disabled:opacity-50",
        )}
        {...rest}
      />
      <div className="min-w-0">
        <label
          htmlFor={inputId}
          className={cn(
            "block text-[0.8125rem] leading-snug",
            rest.disabled ? "text-faint" : "text-fg",
          )}
        >
          {label}
        </label>
        {description ? (
          <p className="mt-0.5 text-xs leading-relaxed text-muted">{description}</p>
        ) : null}
      </div>
    </div>
  );
}
