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
        image: "",
        password: formData.password,
        role: formData.role,
      });

      if (!response.data.success) {
        toast.error(response.data.message);
        return;
      }

      toast.success(response.data.message);
      navigate(`/auth/verifymail?username=${formData.email}`);
    } catch (error) {
      const message = error.response?.data?.message || 'Server error. Please try again.';
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

      <div className="relative mx-auto grid min-h-screen w-full max-w-6xl items-center gap-8 px-4 py-10 md:grid-cols-2 md:px-8">

        {/* Left Panel */}
        <div className="hidden rounded-3xl bg-[#1c1c1a] border border-white/10 p-8 text-white shadow-[0_20px_60px_rgba(0,0,0,0.38)] md:block lg:p-10">
          <p className="mb-3 inline-block rounded-full border border-sky-400/30 bg-sky-400/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-sky-200">
            EventOra
          </p>
          <h1 className="text-3xl font-bold leading-tight lg:text-4xl">
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
              Already have an account?
            </p>
            <button
              onClick={() => navigate('/auth/login')}
              className="rounded-xl bg-sky-500/20 border border-sky-400/50 px-6 py-3 text-sm font-semibold text-sky-200 hover:bg-sky-500/30 transition"
            >
              Sign in to your account
            </button>
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-full rounded-3xl border border-white/10 bg-[#1c1c1a] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.38)] sm:p-8 max-h-[90vh] overflow-y-auto">
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-widest text-sky-400">
              Join Us
            </p>
            <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
              Create your account
            </h2>
            <p className="mt-2 text-sm text-white/60">
              Register with your faculty details to get started.
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>

            {/* First Name & Last Name */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-white/80" htmlFor="firstName">
                  First Name
                </label>
                <input
                  className="w-full rounded-xl border border-white/10 bg-[#111110] px-4 py-3 text-sm text-white outline-none transition focus:border-sky-400/50 focus:ring-2 focus:ring-sky-400/20 placeholder:text-white/35"
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
                <label className="mb-2 block text-sm font-medium text-white/80" htmlFor="lastName">
                  Last Name
                </label>
                <input
                  className="w-full rounded-xl border border-white/10 bg-[#111110] px-4 py-3 text-sm text-white outline-none transition focus:border-sky-400/50 focus:ring-2 focus:ring-sky-400/20 placeholder:text-white/35"
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
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            
            {/* Phone */}
            <div>
              <label className="mb-2 block text-sm font-medium text-white/80" htmlFor="phone">
                Phone No
              </label>
              <input
                className="w-full rounded-xl border border-white/10 bg-[#111110] px-4 py-3 text-sm text-white outline-none transition focus:border-sky-400/50 focus:ring-2 focus:ring-sky-400/20 placeholder:text-white/35"
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
              <label className="mb-2 block text-sm font-medium text-white/80" htmlFor="role">
                Select Role
              </label>
              <div className="relative">
                <select
                  className="w-full appearance-none rounded-xl border border-white/10 bg-[#111110] px-4 py-3 pr-12 text-sm text-white outline-none transition focus:border-sky-400/50 focus:ring-2 focus:ring-sky-400/20"
                  id="role"
                  name="role"
                  required
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="" className="bg-[#111110]">-- Choose your role --</option>
                  <option value="organizer" className="bg-[#111110]">Organizer</option>
                  <option value="student" className="bg-[#111110]">Student</option>
                </select>
                <svg className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 9l6 6 6-6" />
                </svg>
              </div>
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
                  placeholder="At least 8 characters"
                  required
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-xs font-semibold text-sky-400 hover:bg-sky-400/10"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              {formData.password && (
                <div className="mt-3 space-y-2 rounded-lg bg-white/5 border border-white/10 p-3">
                  <p className="text-xs font-semibold text-white/70">Password Requirements:</p>
                  <div className="space-y-1">
                    <div className={`flex items-center gap-2 text-xs ${passwordValidation.hasUppercase ? 'text-emerald-400' : 'text-white/50'}`}>
                      <span className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${passwordValidation.hasUppercase ? 'bg-emerald-500/30 border-emerald-400' : 'border-white/20'}`}>
                        {passwordValidation.hasUppercase && <span className="text-emerald-300 text-xs">✓</span>}
                      </span>
                      Uppercase letter (A-Z)
                    </div>
                    <div className={`flex items-center gap-2 text-xs ${passwordValidation.hasLowercase ? 'text-emerald-400' : 'text-white/50'}`}>
                      <span className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${passwordValidation.hasLowercase ? 'bg-emerald-500/30 border-emerald-400' : 'border-white/20'}`}>
                        {passwordValidation.hasLowercase && <span className="text-emerald-300 text-xs">✓</span>}
                      </span>
                      Lowercase letter (a-z)
                    </div>
                    <div className={`flex items-center gap-2 text-xs ${passwordValidation.hasNumber ? 'text-emerald-400' : 'text-white/50'}`}>
                      <span className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${passwordValidation.hasNumber ? 'bg-emerald-500/30 border-emerald-400' : 'border-white/20'}`}>
                        {passwordValidation.hasNumber && <span className="text-emerald-300 text-xs">✓</span>}
                      </span>
                      Number (0-9)
                    </div>
                    <div className={`flex items-center gap-2 text-xs ${passwordValidation.hasSymbol ? 'text-emerald-400' : 'text-white/50'}`}>
                      <span className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${passwordValidation.hasSymbol ? 'bg-emerald-500/30 border-emerald-400' : 'border-white/20'}`}>
                        {passwordValidation.hasSymbol && <span className="text-emerald-300 text-xs">✓</span>}
                      </span>
                      Special symbol (!@#$%^&*)
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="mb-2 block text-sm font-medium text-white/80" htmlFor="confirmPassword">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  className="w-full rounded-xl border border-white/10 bg-[#111110] px-4 py-3 pr-24 text-sm text-white outline-none transition focus:border-sky-400/50 focus:ring-2 focus:ring-sky-400/20 placeholder:text-white/35"
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-xs font-semibold text-sky-400 hover:bg-sky-400/10"
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
              className="w-full rounded-xl bg-sky-500 px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400/50 disabled:opacity-60 disabled:cursor-not-allowed mt-6"
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
