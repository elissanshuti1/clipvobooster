export default function TermsPage() {
  return (
    <>
      <main className="min-h-screen bg-[#08090d] text-[#dde1e9] pt-20 pb-16">
        <div className="max-w-3xl mx-auto px-6">
          <h1 className="font-serif text-4xl md:text-5xl text-white mb-6">Terms & Conditions</h1>

          <p className="text-slate-400 leading-7 text-lg">
            These Terms & Conditions govern use of the Clipvobooster service.
            By accessing or using the service you agree to these terms. If you
            do not agree, do not use the service.
          </p>

          <h2 className="mt-6 font-semibold text-white text-2xl">Payments</h2>
          <p className="text-slate-400 leading-7 mt-2">
            Payments for premium features and boosts are processed by Paddle. You
            will be redirected to Paddle for checkout and billing. All payment
            disputes or chargebacks will be handled according to Paddle's policies.
          </p>

          <h2 className="mt-6 font-semibold text-white text-2xl">User Responsibilities</h2>
          <p className="text-slate-400 leading-7 mt-2">
            Users must not engage in fraudulent activity, use bots, or attempt to
            manipulate boosts or credits. Violations may result in suspension or
            refund denial.
          </p>

          <h2 className="mt-6 font-semibold text-white text-2xl">Contact</h2>
          <p className="text-slate-400 leading-7 mt-2">
            For questions about these terms or billing, email <a href="mailto:billing@clipvobooster.com" className="underline">billing@clipvobooster.com</a>.
          </p>
        </div>
      </main>
    </>
  );
}
