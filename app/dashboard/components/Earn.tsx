"use client";
export default function Earn(){
  return (
    <div className="bg-[#0e1018] p-6 rounded border border-white/5">
      <h2 className="font-semibold text-lg mb-3">Earn Credits</h2>
      <p className="text-slate-400">Complete simple tasks to earn credits.</p>
      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="p-4 bg-[#12151f] rounded">Watch a video<br/><strong className="text-white">+12 credits</strong></div>
        <div className="p-4 bg-[#12151f] rounded">Try a product<br/><strong className="text-white">+10 credits</strong></div>
        <div className="p-4 bg-[#12151f] rounded">Share feedback<br/><strong className="text-white">+8 credits</strong></div>
      </div>
    </div>
  );
}
