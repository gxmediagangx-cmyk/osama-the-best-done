import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0b0b0e] text-[#ededf0] p-4 text-center">
      <h2 className="text-xl font-bold text-[#eed891]">Page Not Found</h2>
      <p className="mt-2 text-sm text-zinc-400">Return to your workout tracker</p>
      <Link
        href="/"
        className="mt-4 rounded-xl bg-[#d4b26f] px-4 py-2 text-xs font-bold text-black"
      >
        Return to App
      </Link>
    </div>
  );
}
