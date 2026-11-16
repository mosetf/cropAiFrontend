import Link from 'next/link';
import { ArrowRight, Check, ChevronRight } from 'lucide-react';
import Logo from '@/components/Logo';
import RiskBadge from '@/components/RiskBadge';
import { Group, Row } from '@/components/Group';
import { formatKes, maizeBagsPerAcre, tonnesPerAcre } from '@/lib/units';

const SUPPORTED_CROPS = [
  { name: 'Maize', season: 'March to August' },
  { name: 'Beans', season: 'October to January' },
  { name: 'Wheat', season: 'March to July' },
  { name: 'Sorghum', season: 'March to August' },
  { name: 'Coffee', season: 'October to February' },
  { name: 'Tea', season: 'Year-round' },
  { name: 'Potatoes', season: 'March to June' },
];

const PROBLEMS = [
  {
    title: 'You plant, but the rains fail',
    body: 'Short rains, long rains. The timing shifts every season. You rely on what worked last year, but last year was different.',
    solution:
      'CropAI uses the current weather and forecast for your area, with your planting date, and flags rainfall or temperature conditions that put the expected yield at risk.',
  },
  {
    title: 'You spend on fertilizer, but yields stay low',
    body: 'Fertilizer is expensive. You buy it, apply it, and still harvest less than your neighbour. Nobody tells you why.',
    solution:
      'Enter your soil pH and moisture levels. The model estimates how your fertilizer amount and soil conditions affect the expected yield for your crop.',
  },
  {
    title: 'You sell at harvest, always at the lowest price',
    body: 'Everyone harvests in May. Everyone sells in May. Prices drop. You needed to know your harvest window three months ago.',
    solution:
      'The system calculates your likely harvest window from your planting date, so you can plan storage and time your sale better.',
  },
  {
    title: 'You chose the wrong crop for your land',
    body: 'Coffee looks like better money than maize. But your altitude, rainfall and soil tell a different story. You find out after two seasons.',
    solution: 'Compare yield and profit estimates across crops before you plant. Put numbers on the decision.',
  },
];

const STEPS = [
  {
    title: 'Enter your farm details',
    body: 'Your crop, location, planting date and soil readings. Soil pH and moisture testers cost under 1,000 shillings at any agro-vet.',
  },
  {
    title: 'The model runs on your data',
    body: 'A machine-learning model (XGBoost) combines your inputs with the current weather and forecast for your area to estimate the yield.',
  },
  {
    title: 'You get numbers to plan with',
    body: 'Expected yield, net profit after costs, harvest window, and any soil or weather risks worth knowing about before you plant.',
  },
];

const WHAT_YOU_GET = [
  'Yield estimate using your soil pH, moisture and organic carbon',
  'Rough profit estimate from default price and cost assumptions you can override',
  'Harvest window from your planting date',
  'Risk flags for weather and soil conditions before you plant',
  'AI recommendations specific to your inputs',
];

const LIMITS = [
  {
    title: 'An estimate, not a forecast',
    body: 'Yields come from machine-learning models whose accuracy has not been independently validated yet. Treat the numbers as a starting point and check them against local advice from your extension officer or agro-vet.',
  },
  {
    title: 'It can fall back to defaults',
    body: 'If live weather or the AI advice service is unavailable, the app uses default weather values and rule-based advice. The result page tells you when this happened.',
  },
  {
    title: 'Some inputs are assumed',
    body: 'Soil texture, market price and labour cost use fixed defaults unless you override them, so profit figures are rough. The yield range shown is a simple margin around the estimate, not a statistical interval.',
  },
];

// Example shown in the hero. Clearly labelled as an example on the page.
const EXAMPLE = { crop: 'maize', yieldTha: 2.6, low: 2.2, high: 3.0, profit: 67246 };

function ExampleScreen() {
  const perAcre = tonnesPerAcre(EXAMPLE.yieldTha);
  const bags = maizeBagsPerAcre(EXAMPLE.crop, EXAMPLE.yieldTha);
  const scaleMax = EXAMPLE.high * 1.25;
  const pct = (n: number) => `${(n / scaleMax) * 100}%`;

  return (
    <div className="device" aria-label="Example of a result screen" role="img">
      <div className="device-notch" />
      <div className="device-screen text-left">
        <p className="eyebrow !text-[10px]">Example · Maize · Nakuru</p>
        <p className="num mt-1.5 flex items-baseline gap-1 text-[60px] font-bold leading-none tracking-[-0.05em]">
          {EXAMPLE.yieldTha.toFixed(1)}
          <span className="text-[18px] font-semibold tracking-normal text-ink-3">t/ha</span>
        </p>
        <p className="mt-2 text-[11.5px] leading-snug text-ink-2">
          About {perAcre.toFixed(2)} tonnes per acre
          {bags !== null && <> · roughly {Math.round(bags)} bags of 90 kg</>}
        </p>

        <div className="mt-4 rounded-[14px] bg-surface p-3 shadow-card">
          <div className="relative h-2.5 rounded-full bg-fill">
            <div
              className="absolute inset-y-0 rounded-full bg-accent opacity-30"
              style={{ left: pct(EXAMPLE.low), width: `calc(${pct(EXAMPLE.high)} - ${pct(EXAMPLE.low)})` }}
            />
            <div
              className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-surface bg-accent"
              style={{ left: pct(EXAMPLE.yieldTha) }}
            />
          </div>
          <div className="num mt-2 flex justify-between text-[10.5px] text-ink-3">
            <span>Low {EXAMPLE.low.toFixed(1)}</span>
            <span>High {EXAMPLE.high.toFixed(1)}</span>
          </div>
        </div>

        <div className="group mt-3 text-[12.5px]">
          <div className="row !min-h-[38px] !py-1.5">
            <span className="row-label">Net profit</span>
            <span className="row-value font-semibold text-ink">{formatKes(EXAMPLE.profit)}</span>
          </div>
          <div className="row !min-h-[38px] !py-1.5">
            <span className="row-label">Harvest window</span>
            <span className="row-value">4 to 24 Dec</span>
          </div>
          <div className="row !min-h-[38px] !py-1.5">
            <span className="row-label">Risk</span>
            <RiskBadge level="low" className="!px-2.5 !py-0.5 !text-[12px]" />
          </div>
        </div>

        <div className="group mt-3 text-[12px]">
          <div className="row !min-h-0 !items-start !py-2.5">
            <span
              aria-hidden="true"
              className="num mt-px grid h-5 w-5 shrink-0 place-items-center rounded-full bg-accent-soft text-[11px] font-bold text-accent"
            >
              1
            </span>
            <p className="leading-snug text-ink">Apply DAP at planting and urea four weeks after the crop emerges.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <>
      <header className="glass sticky top-0 z-50 [border-bottom:0.5px_solid_var(--line)]">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" aria-label="CropAI Kenya home" className="rounded-lg">
            <Logo />
          </Link>
          <nav aria-label="Sections" className="hidden items-center gap-7 text-[14px] text-ink-2 md:flex">
            <a href="#how" className="hover:text-ink">How it works</a>
            <a href="#crops" className="hover:text-ink">Crops</a>
            <a href="#limits" className="hover:text-ink">Limits</a>
          </nav>
          <div className="flex items-center gap-1 sm:gap-3">
            <Link href="/login" className="rounded-full px-3 py-2 text-[15px] font-medium text-accent hover:underline hover:underline-offset-4">
              Sign in
            </Link>
            <Link href="/signup" className="btn btn-primary !min-h-[36px] !px-4 !text-[15px]">
              Get started
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-20 pt-14 sm:px-6 lg:grid-cols-[1.15fr_1fr] lg:pb-28 lg:pt-24">
          <div>
            <p className="rise eyebrow" style={{ '--i': 0 } as React.CSSProperties}>For Kenyan farmers</p>
            <h1
              className="rise mt-4 text-[46px] font-bold leading-[1.02] tracking-[-0.045em] text-balance sm:text-[64px] lg:text-[76px]"
              style={{ '--i': 1 } as React.CSSProperties}
            >
              Know your harvest
              <span className="text-ink-3"> before you plant.</span>
            </h1>
            <p className="rise mt-6 max-w-xl text-[19px] leading-relaxed text-ink-2 sm:text-[21px]" style={{ '--i': 2 } as React.CSSProperties}>
              Most farmers find out a harvest was bad in May. CropAI lets you check the numbers in January. Before you buy
              seeds, before you pay for labour, before you commit to the wrong crop.
            </p>
            <div className="rise mt-9 flex flex-wrap items-center gap-x-6 gap-y-3" style={{ '--i': 3 } as React.CSSProperties}>
              <Link href="/signup" className="btn btn-primary btn-lg">
                Get started, it&apos;s free
              </Link>
              <a href="#how" className="btn-link inline-flex items-center gap-1">
                See how it works <ChevronRight size={18} aria-hidden="true" />
              </a>
            </div>
          </div>
          <div className="rise flex justify-center lg:justify-end" style={{ '--i': 3 } as React.CSSProperties}>
            <ExampleScreen />
          </div>
        </section>

        {/* Facts */}
        <section aria-label="At a glance" className="bg-surface">
          <dl className="mx-auto grid max-w-6xl grid-cols-2 gap-y-8 px-4 py-12 sm:px-6 md:grid-cols-4">
            {[
              { value: '7', label: 'crops with yield models' },
              { value: '47', label: 'locations across Kenya' },
              { value: '3 min', label: 'to your first estimate' },
              { value: 'Free', label: 'to get started' },
            ].map((s) => (
              <div key={s.label} className="px-2 text-center md:border-l md:border-line first:md:border-l-0 [&:nth-child(odd)]:max-md:border-0">
                <dt className="num text-[44px] font-bold leading-none tracking-[-0.04em] sm:text-[52px]">{s.value}</dt>
                <dd className="mt-2 text-[15px] text-ink-2">{s.label}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Problems */}
        <section id="problems" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20 sm:px-6 lg:py-28">
          <p className="eyebrow">Why most forecasts fail farmers</p>
          <h2 className="mt-3 max-w-2xl text-[36px] font-bold leading-[1.05] tracking-[-0.04em] text-balance sm:text-[52px]">
            Four things that go wrong every season.
          </h2>
          <p className="mt-5 max-w-2xl text-[19px] text-ink-2">
            These are not unusual situations. They happen to almost every smallholder in Kenya, every year. Here is what
            CropAI actually does about them.
          </p>
          <div className="mt-12 grid gap-4 md:grid-cols-2">
            {PROBLEMS.map((p) => (
              <article key={p.title} className="rounded-squircle bg-surface p-6 shadow-card sm:p-8">
                <h3 className="text-[24px] font-bold leading-tight tracking-[-0.03em]">{p.title}</h3>
                <p className="mt-3 text-[17px] text-ink-2">{p.body}</p>
                <div className="my-5 [border-top:0.5px_solid_var(--line)]" />
                <p className="eyebrow !text-[12px]">How CropAI helps</p>
                <p className="mt-2 text-[17px] text-ink">{p.solution}</p>
              </article>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="scroll-mt-20 bg-surface">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-28">
            <p className="eyebrow">How it works</p>
            <h2 className="mt-3 max-w-2xl text-[36px] font-bold leading-[1.05] tracking-[-0.04em] text-balance sm:text-[52px]">
              Three inputs. One clear answer.
            </h2>
            <p className="mt-5 max-w-2xl text-[19px] text-ink-2">
              No complicated setup. No guesswork. Enter your details and see the numbers.
            </p>
            <ol className="mt-12 grid gap-10 md:grid-cols-3">
              {STEPS.map((s, i) => (
                <li key={s.title}>
                  <span
                    aria-hidden="true"
                    className="num grid h-10 w-10 place-items-center rounded-full bg-accent-soft text-[18px] font-bold text-accent"
                  >
                    {i + 1}
                  </span>
                  <h3 className="mt-5 text-[22px] font-bold tracking-[-0.03em]">{s.title}</h3>
                  <p className="mt-2 text-[17px] text-ink-2">{s.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Crops */}
        <section id="crops" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20 sm:px-6 lg:py-28">
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <p className="eyebrow">Supported crops</p>
              <h2 className="mt-3 text-[36px] font-bold leading-[1.05] tracking-[-0.04em] text-balance sm:text-[52px]">
                Seven crops. 47 places across Kenya.
              </h2>
              <p className="mt-5 text-[19px] text-ink-2">
                Pick your crop and location. The estimate uses that location&apos;s position and elevation together with
                current weather and the soil details you enter.
              </p>
              <ul className="mt-8 grid grid-cols-2 gap-3">
                {SUPPORTED_CROPS.map((c) => (
                  <li key={c.name} className="rounded-[16px] bg-surface p-4 shadow-card">
                    <p className="text-[18px] font-bold tracking-[-0.02em]">{c.name}</p>
                    <p className="mt-0.5 text-[14px] text-ink-3">{c.season}</p>
                  </li>
                ))}
              </ul>
            </div>
            <div className="self-center">
              <Group title="Every estimate includes">
                {WHAT_YOU_GET.map((item) => (
                  <Row
                    key={item}
                    icon={<Check size={17} strokeWidth={2.6} />}
                    label={<span className="text-[17px]">{item}</span>}
                  />
                ))}
              </Group>
              <Link href="/signup" className="btn btn-primary mt-6 w-full sm:w-auto">
                Run your first estimate <ArrowRight size={18} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>

        {/* Limits */}
        <section id="limits" className="scroll-mt-20 bg-surface">
          <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:py-28">
            <p className="eyebrow">Before you rely on it</p>
            <h2 className="mt-3 text-[36px] font-bold leading-[1.05] tracking-[-0.04em] text-balance sm:text-[52px]">
              What CropAI can and can&apos;t tell you.
            </h2>
            <p className="mt-5 text-[19px] text-ink-2">
              CropAI is a working prototype. Here is what to keep in mind when you read a result.
            </p>
            <div className="mt-10 overflow-hidden rounded-squircle bg-bg">
              {LIMITS.map((l) => (
                <div key={l.title} className="row !items-start !gap-0 !py-5 !pr-5 flex-col">
                  <h3 className="text-[19px] font-bold tracking-[-0.025em]">{l.title}</h3>
                  <p className="mt-1.5 text-[17px] text-ink-2">{l.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Call to action */}
        <section className="px-4 py-20 sm:px-6 lg:py-28">
          <div className="mx-auto max-w-4xl rounded-sheet bg-[#13693a] px-6 py-16 text-center text-white sm:px-12 sm:py-20">
            <h2 className="mx-auto max-w-2xl text-[34px] font-bold leading-[1.05] tracking-[-0.04em] text-balance !text-white sm:text-[52px]">
              Your next planting season starts with a number.
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-[19px] text-white/80">
              Create an account, enter your crop and location, and see what the data says. It takes about three minutes.
            </p>
            <Link href="/signup" className="btn btn-lg mt-9 bg-white !text-[#13693a] hover:bg-white/90">
              Get started, it&apos;s free
            </Link>
          </div>
        </section>
      </main>

      <footer className="[border-top:0.5px_solid_var(--line)]">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-[14px] text-ink-3 sm:flex-row sm:px-6">
          <Logo />
          <nav aria-label="Footer" className="flex gap-6">
            <a href="#" className="hover:text-ink">Privacy</a>
            <a href="#" className="hover:text-ink">Terms</a>
            <a href="mailto:support@cropai-kenya.com" className="hover:text-ink">Contact</a>
          </nav>
          <p>© 2026 CropAI Kenya</p>
        </div>
      </footer>
    </>
  );
}
