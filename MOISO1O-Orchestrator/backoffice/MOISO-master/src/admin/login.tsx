import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
// import CreditToBank from "../lib/CreditToBank"
export default function LoginPage() {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        navigate('/dashboard', { state: { loginSuccess: true } });
    }

    return (
        <main className="grid min-h-screen min-h-dvh w-full grid-cols-1 bg-white md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <section className="relative hidden min-h-dvh min-w-0 items-center justify-center overflow-hidden bg-[#b589d6] p-8 md:flex lg:p-12">
                {/* <CreditToBank /> */}
            </section>
            <section className="flex min-h-screen min-h-dvh min-w-0 items-center justify-center px-5 py-8 sm:px-10 lg:px-16">
                <div className="w-full max-w-md">
                    {/* <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-indigo-600 md:hidden">MOISO Pay</p> */}
                    <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Admin Login</h1>
                    <p className="mt-2 text-base leading-6 text-slate-500">
                        Sign in to access the Moiso backoffice dashboard.
                    </p>
                    <div className="mt-4">
                        <p className="mb-6 text-sm text-slate-500">Enter your credentials to sign in</p>
                        <form className="space-y-5" onSubmit={handleSubmit} autoComplete="off">
                            <label htmlFor="email" className="block space-y-2 text-sm font-medium text-slate-700 ">
                                <span>Email</span>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="you@moiso.com"
                                    autoComplete="off"
                                    required
                                    className="w-full rounded-lg border border-slate-300 px-3.5 py-3 text-sm text-slate-900"
                                />
                            </label>
                            <div className="space-y-2">
                                <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Enter your password"
                                        autoComplete="new-password"
                                        required
                                        className="w-full rounded-lg border border-slate-300 px-3.5 py-3 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((visible) => !visible)}
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                        aria-pressed={showPassword}
                                        className="absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-500 focus-visible:outline-2 focus-visible:outline-indigo-600"
                                    >
                                        {showPassword ? (
                                            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8M9.9 5.2A10.8 10.8 0 0112 5c5 0 8.5 4.5 9.5 7-.4 1-1.2 2.2-2.4 3.4M6.2 6.2C3.9 7.7 2.7 10 2.5 12c.5 1.2 1.6 2.8 3.4 4.3A9.8 9.8 0 0012 19c1.1 0 2.1-.2 3-.5" />
                                            </svg>
                                        ) : (
                                            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.5 12S6 5 12 5s9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7z" />
                                                <circle cx="12" cy="12" r="2.5" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>
                            <button
                                className="w-full rounded-lg bg-[#b589d6] px-4 py-3 text-sm text_color"
                                type="submit"
                            >
                                Sign in
                            </button>
                        </form>
                    </div>
                </div>
            </section>
        </main >
    );
}