import Link from 'next/link';

const highlights = [
  'Instant CSV/XLSX validation',
  'Age and income eligibility checks',
  'Zero-retention, GDPR-first',
  'Stripe billing with usage tiers',
];

export default function LandingPage() {
  return (
    <main className="space-y-10">
      <section className="card flex flex-col md:flex-row gap-6 items-center">
        <div className="flex-1 space-y-4">
          <p className="text-sm uppercase tracking-wide text-primary font-semibold">
            AutoEnroll.ie
          </p>
          <h1 className="text-4xl font-bold leading-tight text-slate-900">
            Payroll auto-enrolment validation built for Irish employers.
          </h1>
          <p className="text-lg text-slate-700">
            Upload payroll exports from BrightPay, Thesaurus, or Sage. We validate structure, assess
            eligibility, and calculate contributions without storing sensitive data.
          </p>
          <div className="flex gap-4">
            <Link
              href="/dashboard"
              className="px-4 py-2 rounded-md bg-primary text-white font-semibold shadow"
            >
              Launch app
            </Link>
            <Link
              href="#pricing"
              className="px-4 py-2 rounded-md border border-primary text-primary font-semibold"
            >
              Pricing
            </Link>
          </div>
        </div>
        <div className="flex-1 grid grid-cols-2 gap-3 w-full">
          {highlights.map((item) => (
            <div key={item} className="card text-sm font-semibold text-slate-800">
              {item}
            </div>
          ))}
        </div>
      </section>
      <section id="pricing" className="grid md:grid-cols-3 gap-4">
        {[
          { name: 'Starter', price: '€19/mo', uploads: '20 uploads' },
          { name: 'Growth', price: '€49/mo', uploads: '200 uploads' },
          { name: 'Enterprise', price: 'Custom', uploads: 'Advanced controls' },
        ].map((tier) => (
          <div key={tier.name} className="card space-y-2">
            <h3 className="text-xl font-bold">{tier.name}</h3>
            <p className="text-primary text-lg font-semibold">{tier.price}</p>
            <p className="text-slate-600 text-sm">{tier.uploads}</p>
            <Link
              href="/dashboard"
              className="inline-block px-4 py-2 rounded bg-primary text-white"
            >
              Get started
            </Link>
          </div>
        ))}
      </section>
    </main>
  );
}
