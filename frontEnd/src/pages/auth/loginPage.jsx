import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {

    const navigate = useNavigate();

    const [userEmail, setUserEmail] = useState('');
    const [userPassword, setUserPassword] = useState('');
    const [userRememberMe, setUserRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const username = localStorage.getItem("rememberUsername");
        const password = localStorage.getItem("rememberPassword");

        if (username != null && password != null) {
            setUserEmail(username);
            setUserPassword(password);
            setUserRememberMe(true);
        }
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!userEmail || !userPassword) {
            toast.error('All fields are required');
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post('http://localhost:3000/api/v1/auth/login', {
                email: userEmail,
                password: userPassword,
            });

            
            if (!response.data.success) {
                toast.error(response.data.message);
                return;
            }

            if (userRememberMe) {
                localStorage.setItem("rememberUsername", userEmail);
                localStorage.setItem("rememberPassword", userPassword);
                localStorage.setItem("rememberCheck", userRememberMe);
            } else {
                localStorage.removeItem("rememberUsername");
                localStorage.removeItem("rememberPassword");
                localStorage.removeItem("rememberCheck");
            }

            localStorage.setItem("token", response.data.token);
            localStorage.setItem("username", response.data.data.email);
            localStorage.setItem("userRole", response.data.data.role);
            localStorage.setItem("imageURL", response.data.data.image || "");
            toast.success(response.data.message);
            navigate('/');
        } catch (error) {
            const message =
            error.response?.data?.message || 'Server error. Please try again.';
            toast.error(message);

            setTimeout(() => {
                if (
                    error.response?.status === 403 && 
                    error.response?.data?.message == "Your account is pending admin approval."
                ) {
                    toast.error("Please contect admin [eventOraAdmin@gmail.com]");
                    navigate(`/auth/login`);
                    return;
                }

                if (error.response?.status === 403) {
                    toast.success("Redirecting to verification page...");
                    navigate(`/auth/verifymail?username=${userEmail}`);
                    return;
                }
                
            }, 1500);
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.14),_transparent_32%),radial-gradient(circle_at_top_right,_rgba(244,114,182,0.08),_transparent_28%),linear-gradient(180deg,_#171716_0%,_#101010_100%)]">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -left-20 -top-16 h-72 w-72 rounded-full bg-sky-400/20 blur-3xl" />
                <div className="absolute -right-24 top-20 h-80 w-80 rounded-full bg-emerald-400/15 blur-3xl" />
                <div className="absolute bottom-0 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-sky-300/15 blur-3xl" />
            </div>

            <div className="relative mx-auto grid min-h-screen w-full max-w-6xl items-center gap-8 px-4 py-10 md:grid-cols-2 md:px-8">

                {/* Left Panel */}
                <div className="hidden rounded-3xl bg-[#1c1c1a] border border-white/10 p-8 text-white shadow-[0_20px_60px_rgba(0,0,0,0.38)] md:block lg:p-10">
                    <p className="mb-3 inline-block rounded-full border border-sky-400/30 bg-sky-400/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-sky-200">
                        EventOra
                    </p>
                    <h1 className="text-3xl font-bold leading-tight lg:text-4xl text-white">
                        Faculty of Technology
                        <br />
                        University of Ruhuna
                    </h1>
                    <p className="mt-4 max-w-md text-sm text-white/70 lg:text-base">
                        Plan, organize, and monitor faculty events with a single secure
                        platform built for administrators, academic staff, and coordinators.
                    </p>

                    <div className="mt-8 flex flex-col gap-4">
                        <p className="text-sm text-white/60">
                            Don't have an account yet?
                        </p>
                        <button
                            onClick={() => navigate('/auth/register')}
                            className="rounded-xl bg-sky-500/20 border border-sky-400/50 px-6 py-3 text-sm font-semibold text-sky-200 hover:bg-sky-500/30 transition"
                        >
                            Create new account
                        </button>
                    </div>
                </div>

                {/* Right Panel */}
                <div className="w-full rounded-3xl border border-white/10 bg-[#1c1c1a] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.38)] sm:p-8">
                    <div className="mb-6">
                        <p className="text-sm font-semibold uppercase tracking-widest text-sky-400">
                            Welcome Back
                        </p>
                        <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
                            Sign in to your account
                        </h2>
                        <p className="mt-2 text-sm text-white/60">
                            Use your faculty credentials to continue.
                        </p>
                    </div>

                    <form className="space-y-5" onSubmit={handleSubmit}>

                        {/* Email */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-white/80" htmlFor="email">
                                Email Address
                            </label>
                            <input
                                className="w-full rounded-xl border border-white/10 bg-[#111110] px-4 py-3 text-sm text-white outline-none transition focus:border-sky-400/50 focus:ring-2 focus:ring-sky-400/20 placeholder:text-white/35"
                                id="email"
                                name="email"
                                placeholder="name@tech.ruh.ac.lk"
                                type="email"
                                required
                                value={userEmail}
                                onChange={(e) => setUserEmail(e.target.value)}
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-white/80" htmlFor="password">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    className="w-full rounded-xl border border-white/10 bg-[#111110] px-4 py-3 pr-24 text-sm text-white outline-none transition focus:border-sky-400/50 focus:ring-2 focus:ring-sky-400/20 placeholder:text-white/35"
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Enter your password"
                                    required
                                    value={userPassword}
                                    onChange={(e) => setUserPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-xs font-semibold text-sky-400 hover:bg-sky-400/10"
                                    onClick={() => setShowPassword((prev) => !prev)}
                                >
                                    {showPassword ? 'Hide' : 'Show'}
                                </button>
                            </div>
                        </div>

                        {/* Remember Me */}
                        <div className="flex items-center justify-between gap-4 text-sm">
                            <label className="flex items-center gap-2 text-white/70">
                                <input
                                    type="checkbox"
                                    checked={userRememberMe}
                                    onChange={(e) => setUserRememberMe(e.target.checked)}
                                    className="h-4 w-4 rounded border-white/10 bg-[#111110] cursor-pointer accent-sky-500"
                                />
                                Remember me
                            </label>
                            <button 
                                type="button" 
                                className="font-semibold text-sky-400 hover:text-sky-300 cursor-pointer"
                                onClick={() => navigate("/auth/forgotPassword")}
                            >
                                Forgot password?
                            </button>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-xl bg-sky-500 px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400/50 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Signing in…' : 'Sign In'}
                        </button>

                    </form>
                </div>

            </div>
        </section>
    );
};

export default LoginPage;