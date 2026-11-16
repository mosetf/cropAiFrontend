import React from 'react';

export interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

/** Large-title header, as in iOS navigation. */
const PageHeader: React.FC<PageHeaderProps> = ({ title, description, action }) => {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
      <div className="min-w-0">
        <h1 className="text-[34px] font-bold leading-[1.05] tracking-[-0.035em] text-ink sm:text-[40px]">{title}</h1>
        {description && <p className="mt-2 max-w-prose text-[17px] text-ink-2">{description}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
};

export default PageHeader;
