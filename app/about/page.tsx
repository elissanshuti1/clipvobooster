export default function AboutPage() {
  return (
    <>
      <main className="min-h-screen bg-[#08090d] text-[#dde1e9] pt-20 pb-16">
        <div className="max-w-3xl mx-auto px-6">
          <h1 className="font-serif text-4xl md:text-5xl text-white mb-6">About Clipvobooster</h1>
          <p className="text-slate-400 leading-7 text-lg">
            Clipvobooster is an engagement-first growth platform for creators and
            founders. We operate a credit-based economy that rewards meaningful
            participation — creators earn credits by engaging, and they can spend
            those credits to boost content to a qualified audience.
          </p>

          <section className="mt-8">
            <h2 className="font-semibold text-white text-2xl mb-3">Business & Billing</h2>
            <p className="text-slate-400 leading-7">
              Payments for premium features and boosts are handled by Paddle on our
              behalf. Paddle requires direct links to our legal pages (Refund,
              Privacy, Terms) — those pages are published and reachable from the
              navigation for verification.
            </p>
          </section>

          <section className="mt-8">
            <h2 className="font-semibold text-white text-2xl mb-3">Contact</h2>
            <p className="text-slate-400 leading-7">
              For billing or Paddle verification please contact our billing team at
              <a href="mailto:billing@clipvobooster.com" className="text-white underline ml-1">billing@clipvobooster.com</a>.
            </p>
          </section>
        </div>
      </main>
    </>
  );
}
