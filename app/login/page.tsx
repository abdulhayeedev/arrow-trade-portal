import { login } from "@/app/auth/actions";

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string; message?: string };
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <img src="/images/logo.png" alt="Arrow Engineering" className="h-12 w-auto" />
          <h1 className="font-heading mt-2 text-2xl font-bold text-[#14171F]">
            Trade account sign in
          </h1>
        </div>

        {searchParams.message && (
          <div className="mb-4 rounded-lg border border-[#1D7A34] bg-[#EAF6EC] px-4 py-3 text-sm text-[#1D7A34]">
            {searchParams.message}
          </div>
        )}
        {searchParams.error && (
          <div className="mb-4 rounded-lg border border-[#C8102E] bg-[#FFF3F2] px-4 py-3 text-sm text-[#A50D24]">
            {searchParams.error}
          </div>
        )}

        <form action={login} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-semibold text-[#14171F]">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="h-11 rounded-lg border border-[#E5E5E7] px-3.5 text-sm text-[#14171F] outline-none focus:border-[#14171F]"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-sm font-semibold text-[#14171F]">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="h-11 rounded-lg border border-[#E5E5E7] px-3.5 text-sm text-[#14171F] outline-none focus:border-[#14171F]"
            />
          </div>
          <button
            type="submit"
            className="mt-2 h-11 rounded-lg bg-[#14171F] text-sm font-bold text-white"
          >
            Sign in
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#6B7280]">
          Don&rsquo;t have a trade account?{" "}
          <a href="/signup" className="font-semibold text-[#FF4438]">
            Request access
          </a>
        </p>
      </div>
    </main>
  );
}