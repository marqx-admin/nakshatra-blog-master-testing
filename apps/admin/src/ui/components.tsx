import {
  forwardRef,
  useEffect,
  useId,
  useRef,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type PropsWithChildren,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";

export function cx(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(" ");
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "tertiary" | "destructive";
  loading?: boolean;
}
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "secondary", loading = false, disabled, children, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cx("bp-button", `bp-button--${variant}`, className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? <Spinner size="small" /> : null}
      <span>{loading ? "Working…" : children}</span>
    </button>
  );
});

export function IconButton({ label, children, ...props }: PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement> & { label: string }>) {
  return (
    <button className="bp-icon-button" aria-label={label} title={label} {...props}>
      {children}
    </button>
  );
}

interface FieldShellProps { label: string; hint?: string; error?: string; required?: boolean; id: string; children: ReactNode }
function FieldShell({ label, hint, error, required, id, children }: FieldShellProps) {
  const messageId = `${id}-message`;
  return (
    <div className={cx("bp-field", error && "bp-field--error")}>
      <label htmlFor={id} className="bp-label">{label}{required ? <span className="bp-required"> — required</span> : null}</label>
      {children}
      {error ? <p id={messageId} className="bp-field-error" role="alert">⚠ {error}</p> : hint ? <p id={messageId} className="bp-field-hint">{hint}</p> : null}
    </div>
  );
}

export function TextField({ label, hint, error, required, id: suppliedId, className, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string; error?: string }) {
  const generated = useId(); const id = suppliedId ?? generated;
  return <FieldShell label={label} id={id} {...(hint !== undefined ? { hint } : {})} {...(error !== undefined ? { error } : {})} {...(required !== undefined ? { required } : {})}><input id={id} className={cx("bp-input", className)} aria-invalid={Boolean(error)} aria-describedby={error || hint ? `${id}-message` : undefined} required={required} {...props} /></FieldShell>;
}
export function TextArea({ label, hint, error, required, id: suppliedId, className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; hint?: string; error?: string }) {
  const generated = useId(); const id = suppliedId ?? generated;
  return <FieldShell label={label} id={id} {...(hint !== undefined ? { hint } : {})} {...(error !== undefined ? { error } : {})} {...(required !== undefined ? { required } : {})}><textarea id={id} className={cx("bp-textarea", className)} aria-invalid={Boolean(error)} aria-describedby={error || hint ? `${id}-message` : undefined} required={required} {...props} /></FieldShell>;
}
export function SelectField({ label, hint, error, required, id: suppliedId, className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement> & { label: string; hint?: string; error?: string }) {
  const generated = useId(); const id = suppliedId ?? generated;
  return <FieldShell label={label} id={id} {...(hint !== undefined ? { hint } : {})} {...(error !== undefined ? { error } : {})} {...(required !== undefined ? { required } : {})}><select id={id} className={cx("bp-select", className)} aria-invalid={Boolean(error)} aria-describedby={error || hint ? `${id}-message` : undefined} required={required} {...props}>{children}</select></FieldShell>;
}
export function Checkbox({ label, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  const id = props.id ?? useId();
  return <label className="bp-checkbox" htmlFor={id}><input id={id} type="checkbox" {...props} /><span>{label}</span></label>;
}

export function FormSection({ title, description, children }: PropsWithChildren<{ title: string; description?: string }>) {
  return <section className="bp-form-section"><header><h2>{title}</h2>{description ? <p>{description}</p> : null}</header><div className="bp-form-stack">{children}</div></section>;
}

export function Spinner({ size = "normal" }: { size?: "small" | "normal" }) {
  return <span className={cx("bp-spinner", `bp-spinner--${size}`)} role="status" aria-label="Loading" />;
}
export function Skeleton({ rows = 4 }: { rows?: number }) {
  return <div className="bp-skeleton" aria-hidden="true">{Array.from({ length: rows }, (_, index) => <div key={index} className="bp-skeleton-row" />)}</div>;
}

export function Alert({ tone = "info", title, children }: PropsWithChildren<{ tone?: "info" | "warning" | "danger" | "success"; title?: string }>) {
  return <div className={cx("bp-alert", `bp-alert--${tone}`)} role={tone === "danger" ? "alert" : "status"}>{title ? <strong>{title}</strong> : null}<div>{children}</div></div>;
}

export function StatusBadge({ value }: { value: string }) {
  return <span className={cx("bp-status-badge", `bp-status-badge--${value.toLowerCase().replaceAll("_", "-")}`)}><span className="bp-status-dot" aria-hidden="true" />{value}</span>;
}
export function ScopeBadge({ scope }: { scope: "SITE" | "GLOBAL" }) {
  return <span className="bp-scope-badge">{scope === "SITE" ? "SITE workspace" : "GLOBAL workspace"}</span>;
}

export function PageHeader({ title, pageId, scope, context, actions, back }: { title: string; pageId?: string; scope?: "SITE" | "GLOBAL"; context?: string; actions?: ReactNode; back?: ReactNode }) {
  return (
    <header className="bp-page-header">
      <div className="bp-page-heading">
        {back ? <div className="bp-back">{back}</div> : null}
        <div className="bp-heading-meta">{scope ? <ScopeBadge scope={scope} /> : null}{pageId ? <span className="bp-page-id">{pageId}</span> : null}</div>
        <h1>{title}</h1>
        {context ? <p>{context}</p> : null}
      </div>
      {actions ? <div className="bp-page-actions">{actions}</div> : null}
    </header>
  );
}

export function Breadcrumbs({ items }: { items: Array<{ label: string; href?: string }> }) {
  return <nav className="bp-breadcrumbs" aria-label="Breadcrumb"><ol>{items.map((item, index) => <li key={`${item.label}-${index}`}>{item.href ? <a href={item.href}>{item.label}</a> : <span aria-current={index === items.length - 1 ? "page" : undefined}>{item.label}</span>}</li>)}</ol></nav>;
}

export function LoadingState({ label = "Loading" }: { label?: string }) {
  return <main className="bp-centered-state"><Spinner /><h1>{label}</h1><p>Please wait while the current server-authoritative context is loaded.</p></main>;
}
export function EmptyState({ title = "Nothing here yet", description = "The authorized query returned no records.", action }: { title?: string; description?: string; action?: ReactNode }) {
  return <div className="bp-empty-state"><div aria-hidden="true" className="bp-empty-mark">○</div><h2>{title}</h2><p>{description}</p>{action}</div>;
}
export function ErrorState({ title = "Unable to load this view", description = "The request could not be completed. Retry keeps the same page and execution context.", onRetry }: { title?: string; description?: string; onRetry?: () => void }) {
  return <main className="bp-centered-state bp-centered-state--error"><div aria-hidden="true">!</div><h1>{title}</h1><p>{description}</p>{onRetry ? <Button variant="primary" onClick={onRetry}>Retry</Button> : null}</main>;
}
export function DeniedState({ title = "Access denied" }: { title?: string }) {
  return <main className="bp-centered-state"><div aria-hidden="true">⊘</div><h1>{title}</h1><p>Your authenticated account does not currently have authority for this page or action. Protected object details are not shown.</p></main>;
}
export function NotFoundState({ title = "Not found" }: { title?: string }) {
  return <main className="bp-centered-state"><div aria-hidden="true">?</div><h1>{title}</h1><p>The target is unavailable in the authorized context, or its existence is intentionally not disclosed.</p></main>;
}
export function StaleContextState({ onReload }: { onReload?: () => void }) {
  return <Alert tone="warning" title="Context changed"><p>A response from an earlier website or target context was discarded.</p>{onReload ? <Button onClick={onReload}>Reload current context</Button> : null}</Alert>;
}
export function SuccessState({ children }: PropsWithChildren) {
  return <Alert tone="success" title="Saved">{children ?? "The server accepted the change and returned authoritative state."}</Alert>;
}
export function ConflictPanel({ onReload, children }: PropsWithChildren<{ onReload?: () => void }>) {
  return <Alert tone="danger" title="A newer version exists"><p>{children ?? "Your change was not applied because the server rejected a stale write. Reload or review the current server state; this Admin never auto-overwrites conflicts."}</p>{onReload ? <Button variant="secondary" onClick={onReload}>Reload server version</Button> : null}</Alert>;
}

export interface Column<T> { key: string; header: string; cell(row: T): ReactNode; width?: string }
export function DataTable<T>({ columns, rows, rowKey, caption = "Results", empty }: { columns: Array<Column<T>>; rows: T[]; rowKey(row: T): string; caption?: string; empty?: ReactNode }) {
  if (rows.length === 0) return <>{empty ?? <EmptyState />}</>;
  return <div className="bp-table-scroll" tabIndex={0} aria-label={`${caption} table scroll region`}><table className="bp-table"><caption className="bp-sr-only">{caption}</caption><thead><tr>{columns.map((column) => <th key={column.key} style={column.width ? { width: column.width } : undefined} scope="col">{column.header}</th>)}</tr></thead><tbody>{rows.map((row) => <tr key={rowKey(row)}>{columns.map((column) => <td key={column.key}>{column.cell(row)}</td>)}</tr>)}</tbody></table></div>;
}

export function StatCard({ label, value, note }: { label: string; value: ReactNode; note?: string }) {
  return <article className="bp-stat-card"><span>{label}</span><strong>{value}</strong>{note ? <small>{note}</small> : null}</article>;
}

export function FilterBar({ children }: PropsWithChildren) { return <div className="bp-filter-bar">{children}</div>; }
export function Pagination({ page, onPrevious, onNext, hasNext = true }: { page: number; onPrevious(): void; onNext(): void; hasNext?: boolean }) {
  return <nav className="bp-pagination" aria-label="Pagination"><Button onClick={onPrevious} disabled={page <= 1}>Previous</Button><span aria-current="page">Page {page}</span><Button onClick={onNext} disabled={!hasNext}>Next</Button></nav>;
}

export function Modal({ open, title, description, onClose, children, footer }: PropsWithChildren<{ open: boolean; title: string; description?: string; onClose(): void; footer?: ReactNode }>) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  const previousFocus = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (!open) return;
    previousFocus.current = document.activeElement as HTMLElement | null;
    const dialog = dialogRef.current;
    const focusable = dialog?.querySelector<HTMLElement>("button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href]");
    focusable?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); onClose(); return; }
      if (event.key !== "Tab" || !dialog) return;
      const nodes = Array.from(dialog.querySelectorAll<HTMLElement>("button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href]"));
      if (!nodes.length) return;
      const first = nodes[0]; const last = nodes[nodes.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("keydown", onKey); previousFocus.current?.focus(); };
  }, [open, onClose]);
  if (!open) return null;
  return <div className="bp-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><div ref={dialogRef} className="bp-modal" role="dialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={description ? descriptionId : undefined}><header><div><h2 id={titleId}>{title}</h2>{description ? <p id={descriptionId}>{description}</p> : null}</div><IconButton label="Close dialog" onClick={onClose}>×</IconButton></header><div className="bp-modal-body">{children}</div>{footer ? <footer>{footer}</footer> : null}</div></div>;
}
export function ConfirmDialog({ open, title, description, confirmLabel, cancelLabel = "Cancel", destructive = false, onConfirm, onCancel }: { open: boolean; title: string; description: string; confirmLabel: string; cancelLabel?: string; destructive?: boolean; onConfirm(): void; onCancel(): void }) {
  return <Modal open={open} title={title} description={description} onClose={onCancel} footer={<><Button onClick={onCancel}>{cancelLabel}</Button><Button variant={destructive ? "destructive" : "primary"} onClick={onConfirm}>{confirmLabel}</Button></>}><Alert tone={destructive ? "warning" : "info"}>The server will reauthorize the operation at submit time.</Alert></Modal>;
}

export function JsonSummary({ value, label = "Server response" }: { value: unknown; label?: string }) {
  const record = value && typeof value === "object" ? value as Record<string, unknown> : {};
  const entries = Object.entries(record).slice(0, 12);
  return <dl className="bp-definition-list" aria-label={label}>{entries.map(([key, item]) => <div key={key}><dt>{key.replaceAll("_", " ")}</dt><dd>{typeof item === "object" ? Array.isArray(item) ? `${item.length} item(s)` : "Available" : String(item ?? "—")}</dd></div>)}</dl>;
}
