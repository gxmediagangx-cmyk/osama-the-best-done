'use client';

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0b0b0e] text-[#ededf0] p-4 text-center">
      <h2 className="text-xl font-bold text-[#eed891]">Something went wrong</h2>
      <button
        onClick={() => reset()}
        className="mt-4 rounded-xl bg-[#d4b26f] px-4 py-2 text-xs font-bold text-black"
      >
        Try again
      </button>
    </div>
  );
}
