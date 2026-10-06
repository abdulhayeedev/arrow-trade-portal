import { verifyCode, resendCode } from "@/app/verify/actions";

export default function VerifyPage({
  searchParams,
}: {
  searchParams: { email?: string; error?: string; message?: string };
}) {
  const email = searchParams.email ?? "";

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <img src="/images/logo.png" alt="Arrow Engineering" className="h-12 w-auto" />
          <h1 className="font-heading mt-2 text-2xl font-bold text-[#14171F]">
            Check your email
          </h1>
          <p className="text-sm text-[#6B7280]">
            We sent a verification code to{" "}
            <span className="font-semibold text-[#14171F]">{email || "your email"}</span>. Enter
            it below to confirm your account.
          </p>
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

        <form action={verifyCode} className="flex flex-col gap-4">
          <input type="hidden" name="email" value={email} />
          <div className="flex flex-col gap-1.5">
            <label htmlFor="token" className="text-sm font-semibold text-[#14171F]">
              Verification code
            </label>
            <input
              id="token"
              name="token"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              required
              className="h-12 rounded-lg border border-[#E5E5E7] px-3.5 text-center text-lg font-semibold tracking-[0.4em] text-[#14171F] outline-none focus:border-[#14171F]"
            />
          </div>
          <button
            type="submit"
            className="h-11 rounded-lg bg-[#FF4438] text-sm font-bold text-white"
          >
            Verify
          </button>
        </form>

        <form action={resendCode} className="mt-5 text-center">
          <input type="hidden" name="email" value={email} />
          <span className="text-sm text-[#6B7280]">Didn&rsquo;t get it? </span>
          <button type="submit" className="text-sm font-semibold text-[#FF4438]">
            Resend code
          </button>
        </form>
      </div>
    </main>
  );
}