"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  // STATE
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // SUBMIT HANDLER
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // -------------------------
    // VALIDATION
    // -------------------------
    if (!email || !password) {
      setError("All fields are required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // -------------------------
      // API CALL
      // -------------------------
      const res = await axios.post("/api/auth/login", {
        email,
        password,
      });

      const role = res.data.role;

      // -------------------------
      // REDIRECT
      // -------------------------
      if (role === "ADMIN") {
        router.push("/admin");
      } else if (role === "MANAGER") {
        router.push("/manager");
      } else {
        router.push("/staff");
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      // -------------------------
      // ERROR HANDLING
      // -------------------------
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow-md w-full max-w-md space-y-4"
      >
        <h2 className="text-2xl font-bold text-center">Login</h2>

        {/* Email */}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border p-2 rounded"
        />

        {/* Password */}
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border p-2 rounded"
        />

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        {/* Error */}
        {error && <p className="text-red-500 text-sm">{error}</p>}
      </form>
    </div>
  );
}
