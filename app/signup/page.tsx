import { signup } from "@/app/auth/actions";

export default function SignupPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <img src="/images/logo.png" alt="Arrow Engineering" className="h-12 w-auto" />
          <h1 className="font-heading mt-2 text-2xl font-bold text-[#14171F]">
            Create an account
          </h1>
        </div>

        {searchParams.error && (
          <div className="mb-4 rounded-lg border border-[#C8102E] bg-[#FFF3F2] px-4 py-3 text-sm text-[#A50D24]">
            {searchParams.error}
          </div>
        )}

        <form action={signup} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-[#14171F]">I am a</span>
            <div className="flex gap-3">
              <label className="flex flex-1 cursor-pointer items-center gap-2 rounded-lg border border-[#E5E5E7] px-3.5 py-2.5 text-sm has-[:checked]:border-[#FF4438] has-[:checked]:bg-[#FFF3F2]">
                <input type="radio" name="role" value="customer" defaultChecked className="accent-[#FF4438]" />
                Trade customer
              </label>
              <label className="flex flex-1 cursor-pointer items-center gap-2 rounded-lg border border-[#E5E5E7] px-3.5 py-2.5 text-sm has-[:checked]:border-[#FF4438] has-[:checked]:bg-[#FFF3F2]">
                <input type="radio" name="role" value="staff" className="accent-[#FF4438]" />
                Arrow staff
              </label>
            </div>
            <span className="text-xs text-[#9AA2B1]">
              Staff accounts require an @arrowengineering.com email address.
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="companyName" className="text-sm font-semibold text-[#14171F]">
              Company name <span className="font-normal text-[#9AA2B1]">(customers only)</span>
            </label>
            <input
              id="companyName"
              name="companyName"
              type="text"
              className="h-11 rounded-lg border border-[#E5E5E7] px-3.5 text-sm text-[#14171F] outline-none focus:border-[#14171F]"
            />
          </div>
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
              minLength={8}
              className="h-11 rounded-lg border border-[#E5E5E7] px-3.5 text-sm text-[#14171F] outline-none focus:border-[#14171F]"
            />
          </div>
          <button
            type="submit"
            className="mt-2 h-11 rounded-lg bg-[#FF4438] text-sm font-bold text-white"
          >
            Create account
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#6B7280]">
          Already have an account?{" "}
          <a href="/login" className="font-semibold text-[#FF4438]">
            Sign in
          </a>
        </p>
      </div>
    </main>
  );
}