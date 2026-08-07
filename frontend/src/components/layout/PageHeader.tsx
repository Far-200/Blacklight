import type { ReactNode } from "react";
import { Link } from "react-router";
import { ChevronRight } from "lucide-react";

export interface Crumb {
  label: string;
  to?: string;
}

/** Page title, optional breadcrumb trail, and page-level actions. */
export function PageHeader({
  title,
  description,
  breadcrumbs,
  actions,
  meta,
}: {
  title: string;
  description?: ReactNode;
  breadcrumbs?: Crumb[];
  actions?: ReactNode;
  /** Small status row rendered under the title, e.g. badges. */
  meta?: ReactNode;
}) {
  return (
    <div className="mb-6 space-y-3">
      {breadcrumbs && breadcrumbs.length > 0 ? (
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-1 text-xs text-muted">
            {breadcrumbs.map((crumb, index) => (
              <li key={`${crumb.label}-${index}`} className="flex items-center gap-1">
                {index > 0 ? (
                  <ChevronRight aria-hidden className="size-3 text-faint" />
                ) : null}
                {crumb.to ? (
                  <Link to={crumb.to} className="rounded-sm hover:text-fg">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-faint">{crumb.label}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      ) : null}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1
            className="text-xl font-semibold text-fg sm:text-2xl"
            style={{ fontVariationSettings: '"wdth" 112' }}
          >
            {title}
          </h1>
          {description ? (
            <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted">
              {description}
            </p>
          ) : null}
          {meta ? <div className="mt-3 flex flex-wrap items-center gap-2">{meta}</div> : null}
        </div>
        {actions ? (
          <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
        ) : null}
      </div>
    </div>
  );
}
