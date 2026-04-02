import { useState } from 'react';
import { toast } from 'react-toastify';
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
                `http://localhost:3000/api/v1/auth/change-password`,
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
        <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">Reset Password</h2>
                    <p className="text-gray-600">
                        {step === 1 && 'Enter your email to get started'}
                        {step === 2 && 'Enter the OTP sent to your email'}
                        {step === 3 && 'Create your new password'}
                    </p>
                </div>

                {/* Step 1: Email */}
                {step === 1 && (
                    <form onSubmit={verifyEmailandSendOTP} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="Enter your email"
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none 
                                    focus:ring-2 order-gray-300 focus:ring-indigo-500"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
                        >
                            {loading ? 'Sending OTP...' : 'Send OTP'}
                        </button>
                    </form>
                )}

                {/* Step 2: OTP Verification */}
                {step === 2 && (
                    <form onSubmit={verifyOTP} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
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
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 text-center 
                                            ext-2xl tracking-widest border-gray-300 focus:ring-indigo-500"
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition duration-200"
                            >
                                Back
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
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
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                New Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    placeholder="Enter new password"
                                    className="w-full px-4 py-2 pr-16 border rounded-lg 
                                    focus:outline-none focus:ring-2 border-gray-300 focus:ring-indigo-500"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((prev) => !prev)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-indigo-600 hover:text-indigo-700"
                                >
                                    {showPassword ? 'Hide' : 'Show'}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                    placeholder="Confirm your password"
                                    className="w-full px-4 py-2 pr-16 border rounded-lg 
                                    focus:outline-none focus:ring-2 border-gray-300 focus:ring-indigo-500"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-indigo-600 hover:text-indigo-700"
                                >
                                    {showConfirmPassword ? 'Hide' : 'Show'}
                                </button>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition duration-200"
                            >
                                Back
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
                            >
                                {loading ? 'Resetting...' : 'Reset Password'}
                            </button>
                        </div>
                    </form>
                )}

                {/* Footer */}
                <div className="mt-8 text-center">
                    <p className="text-gray-600 text-sm">
                        Remember your password?{' '}
                        <a href="/auth/login" className="text-indigo-600 hover:text-indigo-700 font-semibold">
                            Login
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default ForgotPassword;