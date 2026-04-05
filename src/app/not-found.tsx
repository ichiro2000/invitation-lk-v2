import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-pink-50 px-4">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-bold text-rose-600 mb-2">404</h1>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h2>
        <p className="text-gray-500 mb-6">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-block bg-rose-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-rose-700 transition-colors"
        >
          Go Home
        </Link>
        <div className="mt-8 text-sm text-gray-400">INVITATION.LK</div>
      </div>
    </div>
  );
}
