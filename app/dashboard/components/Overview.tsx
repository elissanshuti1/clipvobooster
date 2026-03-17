"use client";

export default function Overview() {
  return (
    <div className="bg-[#0e1018] p-6 rounded border border-white/5">
      <h2 className="font-semibold text-lg mb-3">Overview</h2>
      <p className="text-slate-400">A quick snapshot of your account — views, credits, and performance.</p>
      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="p-4 bg-[#12151f] rounded">Total Views<br/><strong className="text-white">7,130</strong></div>
        <div className="p-4 bg-[#12151f] rounded">Credits<br/><strong className="text-white">1,240</strong></div>
        <div className="p-4 bg-[#12151f] rounded">Active Boosts<br/><strong className="text-white">2</strong></div>
      </div>
    </div>
  );
}
