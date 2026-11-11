import Link from "next/link";
import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/src/lib/auth";

export default async function ResultPage() {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10 font-sans">
      <section className="w-full max-w-lg rounded-3xl border border-slate-100 bg-white p-7 shadow-xl shadow-slate-200/60 sm:p-9">
        <div className="mb-8">
          <p className="mb-2 text-sm font-semibold text-indigo-600">
            Ringkasan akun
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Login berhasil!
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Anda masuk dengan akun yang terdaftar.
          </p>
        </div>

        <div
          aria-live="polite"
          className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-800"
          role="status"
        >
          Login berhasil.
        </div>
        <dl className="divide-y divide-slate-100">
          <div className="flex items-center justify-between gap-4 py-4 first:pt-0">
            <dt className="text-sm font-medium text-slate-600">Nama</dt>
            <dd className="text-right text-sm text-slate-900">{user.name}</dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-4 last:pb-0">
            <dt className="text-sm font-medium text-slate-600">Nomor HP</dt>
            <dd className="text-right text-sm text-slate-900">{user.phone}</dd>
          </div>
        </dl>

        <Link
          className="mt-8 flex w-full items-center justify-center rounded-xl bg-indigo-600 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          href="/register"
        >
          Kembali ke pendaftaran
        </Link>
      </section>
    </main>
  );
}
