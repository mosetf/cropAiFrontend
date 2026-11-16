import React from 'react';
import Link from 'next/link';
import Logo from './Logo';

interface AuthShellProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

/** Centred, single-column layout shared by the sign-in and sign-up screens. */
const AuthShell: React.FC<AuthShellProps> = ({ title, subtitle, children, footer }) => (
  <main className="grid min-h-screen place-items-center px-4 py-10">
    <div className="rise w-full max-w-[400px]">
      <Link href="/" aria-label="CropAI Kenya home" className="mx-auto mb-8 block w-fit rounded-lg">
        <Logo />
      </Link>
      <h1 className="text-center text-[34px] font-bold tracking-[-0.035em]">{title}</h1>
      <p className="mb-8 mt-2 text-center text-[17px] text-ink-2">{subtitle}</p>
      {children}
      {footer && <p className="mt-8 text-center text-[15px] text-ink-2">{footer}</p>}
    </div>
  </main>
);

export default AuthShell;
