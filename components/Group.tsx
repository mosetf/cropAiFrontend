import React from 'react';

interface GroupProps {
  title?: string;
  footer?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

/** iOS-style inset grouped list: an optional small heading, rounded rows, optional footnote. */
export const Group: React.FC<GroupProps> = ({ title, footer, children, className = '' }) => (
  <section className={className}>
    {title && <h2 className="group-title">{title}</h2>}
    <div className="group">{children}</div>
    {footer && <p className="group-foot">{footer}</p>}
  </section>
);

interface RowProps {
  label: React.ReactNode;
  value?: React.ReactNode;
  /** Small second line under the label. */
  detail?: React.ReactNode;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

export const Row: React.FC<RowProps> = ({ label, value, detail, icon, children }) => (
  <div className="row">
    {icon && (
      <span aria-hidden="true" className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-accent-soft text-accent">
        {icon}
      </span>
    )}
    <div className="row-label min-w-0">
      {label}
      {detail && <p className="text-[13px] leading-snug text-ink-3">{detail}</p>}
    </div>
    {value !== undefined && <div className="row-value">{value}</div>}
    {children}
  </div>
);
