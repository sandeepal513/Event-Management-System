import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const RegisterPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNo: '',
    password: '',
    confirmPassword: '',
    role: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState({
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSymbol: false,
  });

  const validatePassword = (password) => {
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSymbol = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

    return {
      hasUppercase,
      hasLowercase,
      hasNumber,
      hasSymbol,
      isValid: hasUppercase && hasLowercase && hasNumber && hasSymbol,
    };
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Update password validation in real-time
    if (name === 'password') {
      setPasswordValidation(validatePassword(value));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phoneNo || !formData.password || !formData.confirmPassword || !formData.role) {
      toast.error('All fields are required');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      let errorMsg = 'Password must contain: ';
      const missing = [];
      if (!passwordValidation.hasUppercase) missing.push('uppercase letter');
      if (!passwordValidation.hasLowercase) missing.push('lowercase letter');
      if (!passwordValidation.hasNumber) missing.push('number');
      if (!passwordValidation.hasSymbol) missing.push('special symbol');
      toast.error(errorMsg + missing.join(', '));
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('http://localhost:3000/api/v1/auth/register', {
        name: formData.firstName + " " + formData.lastName,
        email: formData.email,
        phoneNo: formData.phoneNo,
        password: formData.password,
        role: formData.role,
      });

      if (!response.data.success) {
        toast.error(response.data.message);
        return;
      }

      toast.success(response.data.message);
      navigate('/auth/login');
    } catch (error) {
      const message = error.response?.data?.message || 'Server error. Please try again.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative min-h-screen overflow-hidden bg-slate-100">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 -top-16 h-72 w-72 rounded-full bg-amber-300/40 blur-3xl" />
        <div className="absolute -right-24 top-20 h-80 w-80 rounded-full bg-teal-400/30 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-cyan-300/30 blur-3xl" />
      </div>

      <div className="relative mx-auto grid min-h-screen w-full max-w-6xl items-center gap-8 px-4 py-10 md:grid-cols-2 md:px-8">

        {/* Left Panel */}
        <div className="hidden rounded-3xl bg-linear-to-br from-slate-900 via-teal-900 to-cyan-900 p-8 text-white shadow-2xl md:block lg:p-10">
          <p className="mb-3 inline-block rounded-full border border-white/30 px-3 py-1 text-xs uppercase tracking-[0.2em] text-amber-200">
            EventOra
          </p>
          <h1 className="text-3xl font-bold leading-tight lg:text-4xl">
            Faculty of Technology
            <br />
            University of Ruhuna
          </h1>
          <p className="mt-4 max-w-md text-sm text-slate-100/90 lg:text-base">
            Plan, organize, and monitor faculty events with a single secure
            platform built for administrators, academic staff, and coordinators.
          </p>

          <div className="mt-8 flex flex-col gap-4">
            <p className="text-sm text-slate-300">
              Already have an account?
            </p>
            <button
              onClick={() => navigate('/auth/login')}
              className="rounded-xl bg-amber-300/20 border border-amber-300/50 px-6 py-3 text-sm font-semibold text-amber-200 hover:bg-amber-300/30 transition"
            >
              Sign in to your account
            </button>
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-full rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl backdrop-blur-sm sm:p-8">
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-widest text-teal-700">
              Join Us
            </p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
              Create your account
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Register with your faculty details to get started.
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>

            {/* First Name & Last Name */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="firstName">
                  First Name
                </label>
                <input
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
                  id="firstName"
                  name="firstName"
                  placeholder="John"
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="lastName">
                  Last Name
                </label>
                <input
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
                  id="lastName"
                  name="lastName"
                  placeholder="Doe"
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="email">
                Email Address
              </label>
              <input
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
                id="email"
                name="email"
                placeholder="name@tech.ruh.ac.lk"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            
            {/* Phone */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="phone">
                Phone No
              </label>
              <input
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
                id="phone"
                name="phoneNo"
                placeholder="+94 766845685"
                type="text"
                required
                value={formData.phoneNo}
                onChange={handleChange}
              />
            </div>

            {/* Role */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="role">
                Select Role
              </label>
              <div className="relative">
                <select
                  className="w-full appearance-none rounded-xl border border-slate-300 bg-white px-4 py-3 pr-12 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
                  id="role"
                  name="role"
                  required
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="">-- Choose your role --</option>
                  <option value="organizer">Organizer</option>
                  <option value="student">Student</option>
                </select>
                <svg className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 9l6 6 6-6" />
                </svg>
              </div>
            </div>
            {/* Password */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <input
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 pr-24 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="At least 8 characters"
                  required
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-xs font-semibold text-teal-700 hover:bg-teal-50"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              {formData.password && (
                <div className="mt-3 space-y-2 rounded-lg bg-slate-50 p-3">
                  <p className="text-xs font-semibold text-slate-700">Password Requirements:</p>
                  <div className="space-y-1">
                    <div className={`flex items-center gap-2 text-xs ${passwordValidation.hasUppercase ? 'text-green-600' : 'text-slate-500'}`}>
                      <span className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${passwordValidation.hasUppercase ? 'bg-green-600 border-green-600' : 'border-slate-300'}`}>
                        {passwordValidation.hasUppercase && <span className="text-white text-xs">✓</span>}
                      </span>
                      Uppercase letter (A-Z)
                    </div>
                    <div className={`flex items-center gap-2 text-xs ${passwordValidation.hasLowercase ? 'text-green-600' : 'text-slate-500'}`}>
                      <span className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${passwordValidation.hasLowercase ? 'bg-green-600 border-green-600' : 'border-slate-300'}`}>
                        {passwordValidation.hasLowercase && <span className="text-white text-xs">✓</span>}
                      </span>
                      Lowercase letter (a-z)
                    </div>
                    <div className={`flex items-center gap-2 text-xs ${passwordValidation.hasNumber ? 'text-green-600' : 'text-slate-500'}`}>
                      <span className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${passwordValidation.hasNumber ? 'bg-green-600 border-green-600' : 'border-slate-300'}`}>
                        {passwordValidation.hasNumber && <span className="text-white text-xs">✓</span>}
                      </span>
                      Number (0-9)
                    </div>
                    <div className={`flex items-center gap-2 text-xs ${passwordValidation.hasSymbol ? 'text-green-600' : 'text-slate-500'}`}>
                      <span className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${passwordValidation.hasSymbol ? 'bg-green-600 border-green-600' : 'border-slate-300'}`}>
                        {passwordValidation.hasSymbol && <span className="text-white text-xs">✓</span>}
                      </span>
                      Special symbol (!@#$%^&*)
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="confirmPassword">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 pr-24 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-xs font-semibold text-teal-700 hover:bg-teal-50"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                >
                  {showConfirmPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-linear-to-r from-teal-700 to-cyan-700 px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:from-teal-800 hover:to-cyan-800 focus:outline-none focus:ring-2 focus:ring-cyan-300 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account…' : 'Create Account'}
            </button>

          </form>
        </div>

      </div>
    </section>
  );
};

export default RegisterPage;
