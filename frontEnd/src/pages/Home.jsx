import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiArrowRight, FiCalendar, FiMapPin, FiUsers } from "react-icons/fi";
import { isOrganizer, isTokenValid } from "../utils/auth";
import axios from "axios";

export default function Home() {
	const navigate = useNavigate();
	const [upcomingEvents, setUpcomingEvents] = useState([]);

	const [isLogin, setLogin] = useState(false);
	const [isOrganizerUser, setIsOrganizerUser] = useState(false);
	const [profile, setProfile] = useState('');
	const [categories, setCategories] = useState([]);
	const role = localStorage.getItem("userRole");

	useEffect(() => {
		let isMounted = true;

		const token = localStorage.getItem("token");
		const valid = isTokenValid(token);

		if (!valid) {
			setLogin(false);
			setProfile('');
		} else {
			setLogin(true);
			const profileText = localStorage.getItem("username");
			if (profileText) setProfile(profileText.toUpperCase());
		}

		const checkOrganizer = async () => {
			if (!token) {
				if (isMounted) setIsOrganizerUser(false);
				return;
			}

			const organizer = await isOrganizer();
			if (isMounted) setIsOrganizerUser(organizer);
		};

		checkOrganizer();

		return () => {
			isMounted = false;
		};
	}, []);

	useEffect(() => {
		let isMounted = true;

		async function getCategories() {
			try {
				const res = await axios.get("http://localhost:3000/api/categories/all");

				if (isMounted) {
					setCategories(res.data);
				}
			} catch (err) {
				console.error("Error fetching categories:", err);
			}
		}

		getCategories();

		return () => {
			isMounted = false;
		};
	}, []);

	useEffect(() => {
		async function fetchUpComingEvents() {
			try {
				const res = await axios.get("http://localhost:3000/api/events/upcoming");
				setUpcomingEvents(res.data);
			} catch (err) {
				console.error("Error fetching upcoming events:", err);
			}
		}
		fetchUpComingEvents();
	}, []);

	const categoryExtras = {
		"Academic": {
			icon: "📚",
			image: "https://aimemlqbnggmvrrgaayd.supabase.co/storage/v1/object/public/other-images/Academic.jpg?w=300&h=200&fit=crop"
		},
		"Sports": {
			icon: "⚽",
			image: "https://aimemlqbnggmvrrgaayd.supabase.co/storage/v1/object/public/other-images/Sports.jpg?w=300&h=200&fit=crop"
		},
		"Arts": {
			icon: "🎨",
			image: "https://aimemlqbnggmvrrgaayd.supabase.co/storage/v1/object/public/other-images/Arts.jpg?w=300&h=200&fit=crop"
		},
		"Technology": {
			icon: "🖥️",
			image: "https://aimemlqbnggmvrrgaayd.supabase.co/storage/v1/object/public/other-images/Technology.jpg?w=300&h=200&fit=crop"
		},
		"Social Events": {
			icon: "🎉",
			image: "https://aimemlqbnggmvrrgaayd.supabase.co/storage/v1/object/public/other-images/Social%20Events.png?w=300&h=200&fit=crop"
		},
		"Other Events": {
			icon: "💼",
			image: "https://aimemlqbnggmvrrgaayd.supabase.co/storage/v1/object/public/other-images/Career%20&%20Alumni.jpg?w=300&h=200&fit=crop"
		}
	};

	const handleLogout = () => {
		localStorage.removeItem("token");
		localStorage.removeItem("username");
		localStorage.removeItem("user");
		setLogin(false);
		setIsOrganizerUser(false);
		setProfile("");
		navigate("/auth/login");
	};

	return (
		<div className="min-h-screen bg-linear-to-b from-[#0f0f0e] to-[#1a1a18]">
			<nav className="sticky top-0 z-30 border-b border-white/10 bg-[#0f0f0e]/90 backdrop-blur">
				<div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 md:px-8">
					<Link to="/" className="text-lg font-semibold tracking-wide text-white">
						EventOra
					</Link>
					<div className="flex items-center gap-3">
						{!isLogin &&
							<Link
								to="/auth/register"
								className="inline-flex items-center justify-center rounded-lg bg-linear-to-r from-sky-500 to-cyan-500 px-5 py-2 text-sm font-semibold text-white hover:shadow-lg hover:shadow-sky-500/30 transition-all"
							>
								Get Started
							</Link>
						}

						{isLogin ?
							<div className="group relative">
								<button
									type="button"
									className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-red-600 text-sm font-semibold text-white border border-white/30 hover:border-sky-400/50 hover:bg-red-500 transition-all"
								>
									{profile[0] || "U"}
								</button>

								<div className="invisible absolute right-0 top-12 z-40 min-w-36 rounded-lg border border-white/15 bg-[#1f1f1d] p-1 opacity-0 shadow-xl transition-all duration-150 group-hover:visible group-hover:opacity-100">
									<Link
										to={`/${role}/profile`}
										className="block rounded-md px-3 py-2 text-sm text-white/90 hover:bg-white/10"
									>
										Profile
									</Link>
									<button
										type="button"
										onClick={handleLogout}
										className="block w-full rounded-md px-3 py-2 text-left text-sm text-red-300 hover:bg-red-500/10"
									>
										Logout
									</button>
								</div>
							</div>
							:
							<Link
								to="/auth/login"
								className="inline-flex items-center justify-center rounded-lg border border-white/30 px-5 py-2 text-sm font-semibold text-white hover:border-sky-400/50 hover:bg-sky-500/10 transition-all"
							>
								Sign In
							</Link>
						}
					</div>
				</div>
			</nav>

			{/* Hero Section */}
			<section className="relative h-96 overflow-hidden">
				<div className="absolute inset-0">
					<img
						src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&h=500&fit=crop"
						alt="Hero Banner"
						className="w-full h-full object-cover"
					/>
					<div className="absolute inset-0 bg-linear-to-r from-black/70 via-black/50 to-transparent" />
				</div>

				<div className="relative h-full flex items-center justify-start px-8 md:px-16">
					<div className="max-w-2xl">
						<h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
							Discover Amazing <span className="bg-linear-to-r from-sky-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">Events</span>
						</h1>
						<p className="text-xl text-white/80 mb-8">
							Find and attend the best events happening around you. Connect with your community.
						</p>
					</div>
				</div>
			</section>

			{/* Stats Section */}
			<section className="py-12 px-4 md:px-8">
				<div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
					<div className="bg-linear-to-br from-sky-500/10 to-sky-500/5 border border-sky-500/20 rounded-xl p-6">
						<div className="text-4xl font-bold text-sky-400 mb-2">1.2K+</div>
						<p className="text-white/70">Active Events</p>
					</div>
					<div className="bg-linear-to-br from-cyan-500/10 to-cyan-500/5 border border-cyan-500/20 rounded-xl p-6">
						<div className="text-4xl font-bold text-cyan-400 mb-2">50K+</div>
						<p className="text-white/70">Active Members</p>
					</div>
					<div className="bg-linear-to-br from-violet-500/10 to-violet-500/5 border border-violet-500/20 rounded-xl p-6">
						<div className="text-4xl font-bold text-violet-400 mb-2">4.8★</div>
						<p className="text-white/70">Average Rating</p>
					</div>
				</div>
			</section>

			{/* Event Categories */}
			<section className="py-16 px-4 md:px-8">
				<div className="max-w-7xl mx-auto">
					<h2 className="text-4xl font-bold text-white mb-4">Browse by Category</h2>
					<p className="text-white/60 mb-12">Explore events across different categories</p>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

						{categories.map((category) => {
							const extra = categoryExtras[category.name] || {
								icon: "📌",
								image: "https://via.placeholder.com/300x200"
							};

							return (
								<Link
									key={category.id}
									to={`/search?category=${category.name}`}
									className="group relative h-48 rounded-xl overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300"
								>
									<img
										src={extra.image}
										alt={category.name}
										className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
									/>

									<div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/30 to-transparent" />

									<div className="absolute bottom-0 left-0 right-0 p-6">
										<p className="text-3xl mb-2">{extra.icon}</p>
										<h3 className="text-2xl font-bold text-white">{category.name}</h3>
									</div>
								</Link>
							);
						})}

					</div>
				</div>
			</section>

			{/* Upcoming Events */}
			<section className="py-16 px-4 md:px-8">
				<div className="max-w-7xl mx-auto">
					<h2 className="text-4xl font-bold text-white mb-4">Upcoming Events</h2>
					<p className="text-white/60 mb-12">Mark your calendar for these exciting events</p>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{upcomingEvents.map((event) => (
							<Link
								key={event.id}
								to={`/events/${event.id}`}
								state={{ event, fromUrl: "/", fromLabel: "Back to Home" }}
								className="group flex bg-linear-to-r from-[#1f1f1d] to-[#2a2a27] border border-white/10 rounded-xl overflow-hidden hover:border-sky-500/50 hover:shadow-lg hover:shadow-sky-500/10 transition-all duration-300"
							>
								<img
									src={event.imageUrl}
									alt={event.title}
									className="w-40 h-40 object-cover group-hover:scale-110 transition-transform duration-300"
								/>
								<div className="flex-1 p-6 flex flex-col justify-between">
									<div>
										<h3 className="text-xl font-bold text-white mb-2">{event.title}</h3>
										<div className="space-y-2 text-sm text-white/70">
											<p className="flex items-center gap-2">
												<FiCalendar className="text-sky-400" />
												{event.date} at {event.time}
											</p>
											<p className="flex items-center gap-2">
												<FiMapPin className="text-pink-400" />
												{event.venue?.name}
											</p>
										</div>
									</div>
									<button className="mt-4 inline-flex items-center gap-2 text-sky-400 hover:text-sky-300 transition-colors">
										Learn More <FiArrowRight />
									</button>
								</div>
							</Link>
						))}
					</div>
				</div>
			</section>

			{/* CTA Section */}
			{(!isLogin || isOrganizerUser) &&
				<section className="py-16 px-4 md:px-8">
					<div className="max-w-7xl mx-auto bg-linear-to-r from-sky-500/10 via-cyan-500/10 to-emerald-500/10 border border-sky-500/20 rounded-2xl p-12 text-center">
						<h2 className="text-4xl font-bold text-white mb-4">Organize Your Own Event</h2>
						<p className="text-white/70 text-lg mb-8">Join thousands of organizers and create unforgettable experiences</p>
						<div className="flex flex-col sm:flex-row gap-4 justify-center">
							<Link
								to="/organizer/create"
								className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-linear-to-r from-sky-500 to-cyan-500 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-sky-500/50 transition-all"
							>
								Create Event <FiArrowRight />
							</Link>
							{!isLogin &&
								<Link
									to="/auth/register"
									className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-transparent border-2 border-sky-400 text-sky-400 font-semibold rounded-lg hover:bg-sky-500/10 transition-all"
								>
									Sign Up Now
								</Link>
							}
						</div>
					</div>
				</section>
			}
		</div>
	);
}
