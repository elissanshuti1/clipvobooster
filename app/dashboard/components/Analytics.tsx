"use client";
export default function Analytics(){
  return (
    <div className="bg-[#0e1018] p-6 rounded border border-white/5">
      <h2 className="font-semibold text-lg mb-3">Analytics</h2>
      <p className="text-slate-400">Charts and recent performance metrics.</p>
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="p-4 bg-[#12151f] rounded">Views chart (placeholder)</div>
        <div className="p-4 bg-[#12151f] rounded">Credits chart (placeholder)</div>
      </div>
    </div>
  );
}
