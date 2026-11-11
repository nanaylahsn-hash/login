"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

const inputClassName =
  "mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("password") ?? "");
    const passwordConfirmation = String(
      formData.get("passwordConfirmation") ?? "",
    );

    if (password !== passwordConfirmation) {
      setError("Password dan konfirmasi password tidak sama.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          phone: formData.get("phone"),
          password,
          passwordConfirmation,
        }),
      });
      const result: unknown = await response.json();

      if (
        typeof result !== "object" ||
        result === null ||
        !("registration" in result) ||
        typeof result.registration !== "object" ||
        result.registration === null ||
        !("name" in result.registration) ||
        typeof result.registration.name !== "string" ||
        !("phone" in result.registration) ||
        typeof result.registration.phone !== "string"
      ) {
        const message =
          typeof result === "object" &&
          result !== null &&
          "error" in result &&
          typeof result.error === "string"
            ? result.error
            : "Pendaftaran gagal. Silakan coba lagi.";
        setError(message);
        return;
      }

      if (!response.ok) {
        setError("Pendaftaran gagal. Silakan coba lagi.");
        return;
      }

      router.push("/login");
    } catch {
      setError("Tidak dapat terhubung ke server. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10 font-sans">
      <section className="w-full max-w-md rounded-3xl border border-slate-100 bg-white p-7 shadow-xl shadow-slate-200/60 sm:p-9">
        <div className="mb-8">
          <p className="mb-2 text-sm font-semibold text-indigo-600">Buat akun</p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Daftar sekarang
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Isi data berikut untuk membuat akun Anda.
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label
              className="text-sm font-medium text-slate-700"
              htmlFor="name"
            >
              Nama
            </label>
            <input
              autoComplete="name"
              className={inputClassName}
              id="name"
              name="name"
              placeholder="Masukkan nama"
              required
              type="text"
            />
          </div>

          <div>
            <label
              className="text-sm font-medium text-slate-700"
              htmlFor="phone"
            >
              Nomor HP
            </label>
            <input
              autoComplete="tel"
              className={inputClassName}
              id="phone"
              name="phone"
              placeholder="Contoh: 081234567890"
              required
              type="tel"
            />
          </div>

          <div>
            <label
              className="text-sm font-medium text-slate-700"
              htmlFor="password"
            >
              Password
            </label>
            <input
              autoComplete="new-password"
              className={inputClassName}
              id="password"
              name="password"
              minLength={8}
              placeholder="Masukkan password"
              required
              type="password"
            />
          </div>

          <div>
            <label
              className="text-sm font-medium text-slate-700"
              htmlFor="password-confirmation"
            >
              Konfirmasi Password
            </label>
            <input
              autoComplete="new-password"
              className={inputClassName}
              id="password-confirmation"
              name="passwordConfirmation"
              placeholder="Ulangi password"
              required
              type="password"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}
          <button
            className="w-full rounded-xl bg-indigo-600 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? "Menyimpan..." : "Daftar"}
          </button>
        </form>

        <Link
          className="mt-4 flex w-full items-center justify-center rounded-xl border border-indigo-200 bg-white px-4 py-3.5 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          href="/login"
        >
          Sudah punya akun? Login
        </Link>
      </section>
    </main>
  );
}