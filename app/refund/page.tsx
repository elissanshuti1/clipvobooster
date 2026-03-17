export default function RefundPage() {
  return (
    <>
      <main className="min-h-screen bg-[#08090d] text-[#dde1e9] pt-20 pb-16">
        <div className="max-w-3xl mx-auto px-6">
          <h1 className="font-serif text-4xl md:text-5xl text-white mb-6">Refund Policy</h1>

          <p className="text-slate-400 leading-7 text-lg">
            Clipvobooster partners with Paddle to process payments. Refunds for
            purchases made through Paddle are governed by Paddle's billing and
            refund procedures as well as the product owner's stated refund rules.
          </p>

          <h2 className="mt-6 font-semibold text-white text-2xl">Eligibility</h2>
          <p className="text-slate-400 leading-7 mt-2">
            Refunds may be issued when the product or service was not delivered
            as described or when a technical issue prevents access and cannot be
            resolved. If you believe you are eligible, please contact the seller
            or our billing team within 30 days of purchase.
          </p>

          <h2 className="mt-6 font-semibold text-white text-2xl">How to Request a Refund</h2>
          <ol className="list-decimal list-inside text-slate-400 mt-2 space-y-2">
            <li>Contact the product owner via the product page contact.</li>
            <li>If unresolved, email billing@clipvobooster.com with your order details.</li>
            <li>We will coordinate with Paddle and the seller to review your case.</li>
          </ol>
        </div>
      </main>
    </>
  );
}
