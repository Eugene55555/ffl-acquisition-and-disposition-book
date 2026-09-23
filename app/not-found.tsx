import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="relative flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-1/4 h-[24rem] w-[24rem] -translate-x-1/2 animate-glow rounded-full bg-brand-500/15 blur-[120px]" />
      </div>
      <Link href="/en/" aria-label="Home" className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-600 to-brand-400 shadow-[0_10px_30px_-12px_rgba(226,100,5,0.8)]">
        <span className="font-display text-lg leading-none text-white">ST</span>
      </Link>
      <h1 className="display mt-8 text-6xl text-sand-900 dark:text-sand-50">404</h1>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-sand-500 dark:text-sand-400">
        This page wandered off. The bound book, however, is exactly where you left it.
      </p>
      <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
        <Link href="/en/" className="btn-primary">
          Back to the shop
        </Link>
        <Link href="/en/books/ffl-acquisition-disposition-200/" className="btn-outline">
          See the books
        </Link>
      </div>
    </div>
  );
}
