import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-paper px-4 text-center">
      <p className="font-display text-6xl font-semibold text-ink-700">404</p>
      <p className="text-sm text-ink-400 mt-3 mb-6">This page doesn't exist, or you don't have access to it.</p>
      <Link to="/" className="bg-ink-700 text-white text-sm font-medium rounded-lg px-4 py-2.5 hover:bg-ink-600 transition-colors">
        Go home
      </Link>
    </div>
  );
}
