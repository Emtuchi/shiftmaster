"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-4xl font-bold mb-6">Welcome to ShiftSync</h1>

      <div className="flex flex-col space-y-4">
        <Link
          href="/auth/signup"
          className="bg-blue-600 text-white py-2 px-6 rounded hover:bg-blue-700 text-center"
        >
          Sign Up
        </Link>

        <Link
          href="/auth/login"
          className="bg-gray-200 text-gray-900 py-2 px-6 rounded hover:bg-gray-300 text-center"
        >
          Log In
        </Link>
      </div>
    </div>
  );
}
