export default function PrivacyPage() {
  return (
    <>
      <main className="min-h-screen bg-[#08090d] text-[#dde1e9] pt-20 pb-16">
        <div className="max-w-3xl mx-auto px-6">
          <h1 className="font-serif text-4xl md:text-5xl text-white mb-6">Privacy Policy</h1>

          <p className="text-slate-400 leading-7 text-lg">
            This Privacy Policy explains how Clipvobooster collects, uses, and
            shares information. By using our services you agree to the collection
            and use of information in accordance with this policy.
          </p>

          <h2 className="mt-6 font-semibold text-white text-2xl">Information We Collect</h2>
          <ul className="list-disc list-inside text-slate-400 mt-2 space-y-2">
            <li>Account information (email, username) provided when signing up.</li>
            <li>Usage data such as interactions, boosts used, and analytics.</li>
            <li>Payment information processed by Paddle (we do not store full card details).</li>
          </ul>

          <h2 className="mt-6 font-semibold text-white text-2xl">How We Use Data</h2>
          <p className="text-slate-400 leading-7 mt-2">
            We use data to provide and improve services, process payments via
            Paddle, communicate with users, and detect abuse or fraud. We may
            share aggregated or anonymized data for analytics.
          </p>

          <h2 className="mt-6 font-semibold text-white text-2xl">Third Parties</h2>
          <p className="text-slate-400 leading-7 mt-2">
            We use third-party providers (including Paddle) for payments and
            other services. Please review their policies as well. For questions
            contact <a href="mailto:privacy@clipvobooster.com" className="underline">privacy@clipvobooster.com</a>.
          </p>
        </div>
      </main>
    </>
  );
}
