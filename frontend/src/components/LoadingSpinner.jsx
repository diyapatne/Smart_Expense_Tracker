// src/components/Spinner.jsx

// A small reusable loading spinner.
// We use plain CSS (no extra npm library) — a rotating border trick.
export default function Spinner({ label = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center py-6">
      <div
        className="w-10 h-10 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"
        role="status"
        aria-label="loading"
      ></div>
      <p className="mt-3 text-sm text-gray-500">{label}</p>
    </div>
  );
}