import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate, useSearchParams } from 'react-router-dom';

const VerifyMail = () => {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	
	const hasSentOtp = useRef(false);
	const [email, setEmail] = useState('');
	const [otp, setOtp] = useState(['', '', '', '', '', '']);
	const [otpSent, setOtpSent] = useState(false);
	const [verified, setVerified] = useState(false);
	const [isOtpLoading, setOtpLoading] = useState(false);
	const [isVerifyLoading, setVerifyLoading] = useState(false);


	useEffect(() => {
		const email = searchParams.get('username');

		if (!email) {
			toast.error("email not found");
			return;
		}

		if (hasSentOtp.current) return;
		hasSentOtp.current = true;

		setEmail(email);
		handleSendOtp(undefined, email);
	}, [searchParams]);

	const handleOtpKeyDown = (index, event) => {
		if (event.key === 'Backspace') {
			event.preventDefault();
			const newOtp = [...otp];

			if (newOtp[index]) {
				newOtp[index] = '';
				setOtp(newOtp);
				return;
			}

			if (index > 0) {
				newOtp[index - 1] = '';
				setOtp(newOtp);
				const prevInput = document.getElementById(`otp-${index - 1}`);
				if (prevInput) {
					prevInput.focus();
				}
			}
			return;
		}

		if (event.key === 'ArrowLeft' && index > 0) {
			event.preventDefault();
			const prevInput = document.getElementById(`otp-${index - 1}`);
			if (prevInput) {
				prevInput.focus();
			}
		}

		if (event.key === 'ArrowRight' && index < otp.length - 1) {
			event.preventDefault();
			const nextInput = document.getElementById(`otp-${index + 1}`);
			if (nextInput) {
				nextInput.focus();
			}
		}
	};

	const handleOtpChange = (index, value) => {
		const lastChar = value.slice(-1);

		if (lastChar && !/^\d$/.test(lastChar)) {
			return;
		}

		const newOtp = [...otp];
		newOtp[index] = lastChar || '';
		setOtp(newOtp);

		if (lastChar && index < otp.length - 1) {
			const nextInput = document.getElementById(`otp-${index + 1}`);
			if (nextInput) {
				nextInput.focus();
			}
		}
	};

	const handleSendOtp = async (e, emailToSend = email) => {
		if (e?.preventDefault) {
			e.preventDefault();
		}

		if (!emailToSend) {
			return;
		}

		setOtpLoading(true);
		try {
			const response = await axios.post(`http://localhost:3000/api/v1/auth/send-verifyEmail/${emailToSend}`);
	
			if (!response.data.success) {
				toast.error(response.data.message);
				return;
			}
	
			toast.success(response.data.message);
			setOtpSent(true);
		} catch (error) {
			const message = error?.response?.data?.message;
			toast.error(message || "Server error. try again");
		} finally {
			setOtpLoading(false);
		}
	};

	const handleVerifyOtp = async (event) => {
		event.preventDefault();
		
		const otpString = otp.join('');

		if (otpString.length < 6) {
			toast.error("Please enter the full OTP");
			return;
		}
		
		if (!email) {
			toast.error("Email is required");
			return;
		}

		setVerifyLoading(true);
		try {
			const response = await axios.post(`http://localhost:3000/api/v1/auth/verify-email`,
				{
					email: email,
					otp: otpString
				}
			);

			if (!response.data.success) {
				toast.error(response.data.message);
				return;
			}

			toast.success(response.data.message);
			setVerified(true);
		} catch (error) {
			const message = error?.response?.data?.message;
			toast.error(message || "Server error. try again");
			console.log(message);
		} finally {
			setVerifyLoading(false);
		}
	};

	return (
		<section className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.14),_transparent_32%),radial-gradient(circle_at_top_right,_rgba(244,114,182,0.08),_transparent_28%),linear-gradient(180deg,_#171716_0%,_#101010_100%)]">
			
			{isOtpLoading && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
					<div className="flex flex-col items-center gap-4 rounded-2xl border border-white/10 bg-[#1c1c1a] p-8 shadow-2xl">
						<div className="h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-sky-400" />
						<p className="text-sm font-semibold tracking-wide text-white/60 animate-pulse">
							Sending OTP...
						</p>
					</div>
				</div>
			)}
			
			<div className="pointer-events-none absolute inset-0">
				<div className="absolute -left-24 top-8 h-80 w-80 rounded-full bg-sky-400/20 blur-3xl" />
				<div className="absolute -right-24 bottom-10 h-96 w-96 rounded-full bg-emerald-400/15 blur-3xl" />
				<div className="absolute left-1/3 top-1/2 h-64 w-64 rounded-full bg-sky-300/15 blur-3xl" />
			</div>

			<div className="relative mx-auto flex min-h-screen w-full max-w-6xl items-center px-4 py-10 md:px-8">
				<div className="grid w-full items-stretch gap-8 md:grid-cols-2">
					<div className="hidden rounded-3xl bg-[#1c1c1a] border border-white/10 p-10 text-white shadow-[0_20px_60px_rgba(0,0,0,0.38)] md:flex md:flex-col md:justify-between">
						<div>
							<p className="mb-4 inline-block rounded-full border border-sky-400/30 bg-sky-400/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-sky-200">
								EventOra
							</p>
							<h1 className="text-4xl font-bold leading-tight">
								Verify your
								<br />
								email address
							</h1>
							<p className="mt-5 max-w-md text-sm text-white/70">
								We use one-time passcodes to protect your account and keep event
								access secure for students, organizers, and admins.
							</p>
						</div>

						<div className="rounded-2xl border border-white/10 bg-white/5 p-4">
							<p className="text-sm font-semibold text-white/80">Quick tips</p>
							<ul className="mt-2 space-y-1 text-xs text-white/60">
								<li>Use your registered email address.</li>
								<li>OTP expires quickly, so verify immediately.</li>
								<li>Check spam or promotions if not received.</li>
							</ul>
						</div>
					</div>

					<div className="w-full rounded-3xl border border-white/10 bg-[#1c1c1a] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.38)] sm:p-8">
						<div className="mb-6">
							<p className="text-sm font-semibold uppercase tracking-widest text-sky-400">
								Email Verification
							</p>
							<h2 className="mt-2 text-3xl font-bold text-white">
								{verified ? 'Email Verified' : 'Verify Your Email'}
							</h2>
							<p className="mt-2 text-sm text-white/60">
								{verified
									? 'Your account is now confirmed. You can continue to login.'
									: 'Send OTP to your email, then enter the 6-digit code to verify.'}
							</p>
						</div>

						{!verified && (
							<form className="mt-6 space-y-6 border-t border-white/10 pt-6" onSubmit={handleVerifyOtp}>
								<div>
									<p className="mb-3 text-sm font-medium text-white/80">
										Enter 6-digit OTP
									</p>
									<div className="flex flex-wrap gap-2 sm:gap-3">
										{otp.map((digit, index) => (
											<input
												key={index}
												id={`otp-${index}`}
												type="text"
												inputMode="numeric"
												maxLength={1}
												value={digit}
												onChange={(event) => handleOtpChange(index, event.target.value)}
												onKeyDown={(event) => handleOtpKeyDown(index, event)}
												disabled={!otpSent}
												className="h-12 w-11 sm:h-14 sm:w-12 rounded-xl border border-white/10 bg-[#111110] text-center text-lg font-bold text-white outline-none transition focus:border-sky-400/50 focus:ring-2 focus:ring-sky-400/20 disabled:cursor-not-allowed disabled:opacity-50"
											/>
										))}
									</div>
								</div>

								<div className="rounded-xl border border-sky-400/20 bg-sky-400/10 px-4 py-3 text-xs text-white/60">
									{otpSent ? (
										<>
											OTP sent to <span className="font-semibold text-sky-200">{email}</span>
										</>
									) : (
										'Send OTP first. You will receive the code to your mail.'
									)}
								</div>

								<div className="flex flex-col gap-3 sm:flex-row">
									<button
										type="submit"
										disabled={isVerifyLoading}
										className="flex-1 rounded-xl bg-sky-500 px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-sky-400 disabled:opacity-60 disabled:cursor-not-allowed"
									>
										{isVerifyLoading ? "Verifying OTP..." : "Verify OTP"}
									</button>

									<button
										type="button"
										onClick={() => setOtp(['', '', '', '', '', ''])}
										className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white/80 transition hover:bg-white/10"
									>
										Clear
									</button>
								</div>

								{!otpSent ? (
									<button
										type="button"
										onClick={handleSendOtp}
										disabled={isOtpLoading}
										className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-sky-400 hover:text-sky-300 transition disabled:opacity-60 disabled:cursor-not-allowed"
									>
										{isOtpLoading ? "Sending..." : "Send OTP"}
									</button>
								) : (
									<>
									</>
									// <button
									// 	type="button"
									// 	onClick={() => setOtp(['', '', '', '', '', ''])}
									// 	className="w-full text-sm font-semibold text-sky-400 hover:text-sky-300 transition"
									// >
									// 	Change email
									// </button>
								)}
							</form>
						)}

						{verified && (
							<div className="space-y-5">
								<div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4">
									<p className="text-sm font-semibold text-emerald-300">
										✓ Verification Successful
									</p>
									<p className="mt-1 text-sm text-emerald-200/80">
										Your email has been verified. You can now proceed to login.
									</p>
								</div>

								<button
									type="button"
									onClick={() => navigate('/auth/login')}
									className="w-full rounded-xl bg-sky-500 px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-sky-400"
								>
									Continue to Login
								</button>
							</div>
						)}
					</div>
				</div>
			</div>
		</section>
	);
};

export default VerifyMail;