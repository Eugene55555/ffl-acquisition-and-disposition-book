import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <span className="inline-block h-14 w-14 rounded-2xl bg-[linear-gradient(to_right,#FF512F,#F09819)]" />
      <h1 className="mt-6 text-5xl font-bold text-gray-900 dark:text-white">404</h1>
      <p className="mt-3 text-gray-600 dark:text-gray-300">
        This page wandered off. Let&apos;s get you back.
      </p>
      <Link
        href="/en/"
        className="mt-8 inline-block rounded-lg bg-[linear-gradient(to_right,#FF512F,#F09819)] px-6 py-3 font-semibold text-white shadow hover:opacity-90"
      >
        Go home
      </Link>
    </div>
  );
}
