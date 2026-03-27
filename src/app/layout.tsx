// app/layout.tsx
import "./globals.css";
import Link from "next/link";

export const metadata = {
  title: "ShiftMaster",
  description: "Manage your shifts efficiently",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-white text-black min-h-screen flex flex-col">
        {/* HEADER */}
        <header className="shadow-md">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            {/* Left: Home */}
            <div>
              <Link href="/" className="text-xl font-bold">
                Home
              </Link>
            </div>

            {/* Right: Login / Sign Up */}
            <nav className="flex space-x-4">
              <Link href="/login" className="hover:underline">
                Login
              </Link>
              <Link href="/signup" className="hover:underline">
                Sign Up
              </Link>
            </nav>
          </div>
        </header>

        {/* MAIN CONTENT */}
        <main className="flex-1 p-4 max-w-7xl mx-auto w-full">{children}</main>

        {/* FOOTER */}
        <footer className="mt-auto text-center p-4 border-t bg-gray-50">
          <p className="text-sm text-gray-600">
            &copy; {new Date().getFullYear()} ShiftSync. All rights reserved.
          </p>
          <div className="mt-2 space-x-4">
            <Link
              href="/privacy"
              className="text-gray-500 hover:underline text-sm"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="text-gray-500 hover:underline text-sm"
            >
              Terms
            </Link>
            <Link
              href="/contact"
              className="text-gray-500 hover:underline text-sm"
            >
              Contact
            </Link>
          </div>
        </footer>
      </body>
    </html>
  );
}
