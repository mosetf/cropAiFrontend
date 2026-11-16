import React from 'react';
import { Sprout } from 'lucide-react';

interface LogoProps {
  className?: string;
  /** Hide the wordmark and show only the app-icon style mark. */
  markOnly?: boolean;
}

/** App-icon style mark plus wordmark. */
const Logo: React.FC<LogoProps> = ({ className = '', markOnly = false }) => (
  <span className={`inline-flex items-center gap-2.5 ${className}`}>
    <span
      aria-hidden="true"
      className="grid h-8 w-8 shrink-0 place-items-center rounded-[9px] bg-gradient-to-b from-[#2fa365] to-[#13693a] text-white shadow-[0_1px_2px_rgba(0,0,0,0.25)]"
    >
      <Sprout size={18} strokeWidth={2.4} />
    </span>
    {!markOnly && (
      <span className="text-[19px] font-bold tracking-[-0.03em] text-ink">
        CropAI<span className="font-medium text-ink-3"> Kenya</span>
      </span>
    )}
  </span>
);

export default Logo;
