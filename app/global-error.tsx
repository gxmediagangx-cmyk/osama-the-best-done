'use client';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0b0b0e] text-[#ededf0] antialiased min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <h2 className="text-xl font-bold text-[#eed891]">Something went wrong</h2>
        <p className="mt-2 text-sm text-zinc-400">An unexpected system error occurred.</p>
        <button
          onClick={() => reset()}
          className="mt-4 rounded-xl bg-[#d4b26f] px-4 py-2 text-xs font-bold text-black cursor-pointer"
        >
          Try again
        </button>
      </body>
    </html>
  );
}
