'use client';

import dynamic from 'next/dynamic';

const GymApp = dynamic(
  () => import('@/components/GymApp').then((mod) => mod.GymApp),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-[#0b0b0e] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 animate-spin rounded-full border-2 border-[#d4b26f] border-t-transparent" />
          <span className="font-mono text-xs uppercase tracking-widest text-[#d4b26f]/80">Loading Osama App...</span>
        </div>
      </div>
    ),
  }
);

export default function Home() {
  return <GymApp />;
}



