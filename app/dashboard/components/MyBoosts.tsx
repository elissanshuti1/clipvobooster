"use client";
import { useState } from 'react';

export default function MyBoosts(){
  const [items, setItems] = useState([] as any[]);
  return (
    <div className="bg-[#0e1018] p-6 rounded border border-white/5">
      <h2 className="font-semibold text-lg mb-3">My Boosts</h2>
      <p className="text-slate-400">Manage your boosts and track progress.</p>
      <div className="mt-4">
        <table className="w-full text-left">
          <thead>
            <tr className="text-slate-400 text-sm"><th>Name</th><th>Views</th><th>Clicks</th><th>Status</th></tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan={4} className="py-6 text-center text-slate-500">No boosts yet — create one in the dashboard.</td></tr>
            ) : items.map((it,i)=> (
              <tr key={i}><td>{it.title}</td><td>{it.views}</td><td>{it.clicks}</td><td>{it.status}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
