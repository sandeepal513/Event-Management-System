import { useState } from 'react';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';


const ForgotPassword = () => {

    const navigate = useNavigate();

    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        email: '',
        otp: '',
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validPassword = (password) => {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
        return passwordRegex.test(password);
    }

    const verifyEmailandSendOTP = async (e) => {
        e.preventDefault();

        if (!formData.email) {
            toast.error("Email is required");
            return;
        }

        if (!validateEmail(formData.email)) {
            toast.error("Not a valid email");
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post(
                `http://localhost:3000/api/v1/auth/send-otp/${encodeURIComponent(formData.email)}`
            );

            if (!response.data.success) {
                toast.error(response.data.message);
                return;
            }

            toast.success(response.data.message);
            setStep(2);

        } catch (error) {
            const message = error.response?.data?.message || 'Server error. Please try again.';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const verifyOTP = async (e) => {
        e.preventDefault();

        const otpValue = formData.otp.trim();

        if (!otpValue) {
            toast.error("OTP is required");
            return;
        }

        if (!/^\d{6}$/.test(otpValue)) {
            toast.error("OTP must be 6 digits");
            return;
        }
        
        setLoading(true);
        try {
            const response = await axios.post(
                `http://localhost:3000/api/v1/auth/verify-otp/${otpValue}`,
                {},
                { timeout: 10000 }
            );

            if (!response.data.success) {
                toast.error(response.data.message);
                setLoading(false);
                return;
            }

            toast.success(response.data.message);
            setTimeout(() => {
                setStep(3);
                setLoading(false);
            }, 3000);

        } catch (error) {
            const message =
                error?.code === 'ECONNABORTED'
                    ? 'Verification timed out. Please try again.'
                    : error?.response?.data?.message || 'Server error. Try again.';
            toast.error(message);
            setLoading(false);
        }
    };

    // change password
    const changePassword = async (e) => {
        e.preventDefault();

        const newPassword = formData.password.trim();
        const confirmPassword = formData.confirmPassword.trim();
        const email = formData.email.trim();

        if (!newPassword) {
            toast.error("Password is required");
            return;
        }

        if (!validPassword(newPassword)) {
            toast.error("Password must be at least 8 characters and include uppercase, lowercase, symbol and a number");
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post(
                `http://localhost:3000/api/v1/auth/change-forget-password`,
                {
                    email: email,
                    password: newPassword
                }
            );

            if (!response.data.success) {
                toast.error(response.data.message);
                return;
            }

            toast.success(response.data.message);
            setTimeout(() => {
                navigate("/auth/login");
            }, 2000);
        } catch (error) {
            const message =
                    error?.response?.data?.message || 'Server error. Try again.';
            toast.error(message);
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

            <div className="relative mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-4 py-10 md:px-8">
                <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#1c1c1a] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.38)]">
                    
                    {/* Header */}
                    <div className="mb-8 text-center">
                        <h2 className="text-3xl font-bold text-white">Reset Password</h2>
                        <p className="mt-3 text-sm text-white/60">
                            {step === 1 && 'Enter your email to get started'}
                            {step === 2 && 'Enter the OTP sent to your email'}
                            {step === 3 && 'Create your new password'}
                        </p>
                    </div>

                    {/* Step 1: Email */}
                    {step === 1 && (
                        <form onSubmit={verifyEmailandSendOTP} className="space-y-4">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-white/80">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="Enter your email"
                                    className="w-full rounded-xl border border-white/10 bg-[#111110] px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 transition focus:border-sky-400/50 focus:ring-2 focus:ring-sky-400/20"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full rounded-xl bg-sky-500 px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-sky-400 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Sending OTP...' : 'Send OTP'}
                            </button>

                            <div className="text-center">
                                <button
                                    type="button"
                                    onClick={() => navigate("/auth/login")}
                                    className="text-sm text-sky-400 hover:text-sky-300 transition"
                                >
                                    Back to login
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Step 2: OTP Verification */}
                    {step === 2 && (
                        <form onSubmit={verifyOTP} className="space-y-4">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-white/80">
                                    One Time Password (OTP)
                                </label>
                                <input
                                    type="text"
                                    name="otp"
                                    value={formData.otp}
                                    onChange={handleInputChange}
                                    placeholder="Enter 6-digit OTP"
                                    maxLength="6"
                                    inputMode="numeric"
                                    className="w-full rounded-xl border border-white/10 bg-[#111110] px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 text-center tracking-widest transition focus:border-sky-400/50 focus:ring-2 focus:ring-sky-400/20"
                                />
                                <p className="mt-2 text-xs text-white/50">
                                    Check your email for the verification code
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white/80 transition hover:bg-white/10"
                                >
                                    Back
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 rounded-xl bg-sky-500 px-4 py-3 text-sm font-medium text-white transition hover:bg-sky-400 disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Verifying...' : 'Verify OTP'}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Step 3: Reset Password */}
                    {step === 3 && (
                        <form onSubmit={changePassword} className="space-y-4">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-white/80">
                                    New Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        placeholder="Enter new password"
                                        className="w-full rounded-xl border border-white/10 bg-[#111110] px-4 py-3 pr-24 text-sm text-white outline-none placeholder:text-white/35 transition focus:border-sky-400/50 focus:ring-2 focus:ring-sky-400/20"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((prev) => !prev)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-sky-400 hover:text-sky-300 transition"
                                    >
                                        {showPassword ? 'Hide' : 'Show'}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-white/80">
                                    Confirm Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleInputChange}
                                        placeholder="Confirm your password"
                                        className="w-full rounded-xl border border-white/10 bg-[#111110] px-4 py-3 pr-24 text-sm text-white outline-none placeholder:text-white/35 transition focus:border-sky-400/50 focus:ring-2 focus:ring-sky-400/20"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-sky-400 hover:text-sky-300 transition"
                                    >
                                        {showConfirmPassword ? 'Hide' : 'Show'}
                                    </button>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white/80 transition hover:bg-white/10"
                                >
                                    Back
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 rounded-xl bg-sky-500 px-4 py-3 text-sm font-medium text-white transition hover:bg-sky-400 disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Resetting...' : 'Reset Password'}
                                </button>
                            </div>
                        </form>
                    )}

                </div>
            </div>
        </section>
    );
}

export default ForgotPassword;