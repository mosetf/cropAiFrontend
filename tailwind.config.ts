import type { Config } from "tailwindcss";

const ramp = (name: string) =>
  Object.fromEntries(
    [50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((step) => [step, `var(--color-${name}-${step})`])
  );

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Semantic tokens (see app/globals.css).
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        fill: 'var(--fill)',
        line: 'var(--line)',
        ink: { DEFAULT: 'var(--text)', 2: 'var(--text-2)', 3: 'var(--text-3)' },
        accent: { DEFAULT: 'var(--accent)', strong: 'var(--accent-strong)', soft: 'var(--accent-soft)' },
        'on-accent': 'var(--on-accent)',
        good: { DEFAULT: 'var(--good)', soft: 'var(--good-soft)' },
        warn: { DEFAULT: 'var(--warn)', soft: 'var(--warn-soft)' },
        bad: { DEFAULT: 'var(--bad)', soft: 'var(--bad-soft)' },
        maize: 'var(--maize)',

        // Legacy ramps, kept so existing pages keep working.
        earth: ramp('earth'),
        sage: ramp('sage'),
        terracotta: ramp('terracotta'),
        primary: { ...ramp('sage'), 950: '#06210f' },
        neutral: { ...ramp('earth'), 950: '#000000' },
      },
      fontFamily: {
        // One family everywhere: the system font (SF Pro on Apple devices).
        sans: ['var(--font)'],
        serif: ['var(--font)'],
        display: ['var(--font)'],
      },
      borderRadius: {
        squircle: '22px',
        sheet: '28px',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      boxShadow: {
        soft: 'var(--shadow-1)',
        lifted: 'var(--shadow-2)',
        card: 'var(--shadow-1)',
        float: 'var(--shadow-2)',
      },
      transitionTimingFunction: {
        apple: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'slide-up': 'slideUp 0.8s ease-out forwards',
        'scale-in': 'scaleIn 0.5s ease-out forwards',
      },
    },
  },
  plugins: [],
};
export default config;
