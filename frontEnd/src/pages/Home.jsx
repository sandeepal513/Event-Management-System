import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight, FiCalendar, FiMapPin, FiUsers } from "react-icons/fi";

export default function Home() {
	const [upcomingEvents, setUpcomingEvents] = useState([]);
	const [featuredEvents, setFeaturedEvents] = useState([]);

	useEffect(() => {
		// Mock data for demo purposes
		setFeaturedEvents([
			{
				id: 1,
				title: "Tech Conference 2026",
				date: "April 15, 2026",
				time: "10:00 AM",
				venue: { name: "Convention Center" },
				society: { name: "Tech Society" },
				image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop",
				attendees: 250,
				category: "Technology",
			},
			{
				id: 2,
				title: "Music Festival",
				date: "April 20, 2026",
				time: "6:00 PM",
				venue: { name: "City Park" },
				society: { name: "Arts Club" },
				image: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&h=300&fit=crop",
				attendees: 500,
				category: "Music",
			},
			{
				id: 3,
				title: "Sports Championship",
				date: "April 25, 2026",
				time: "2:00 PM",
				venue: { name: "Sports Stadium" },
				society: { name: "Sports Club" },
				image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&h=300&fit=crop",
				attendees: 1000,
				category: "Sports",
			},
			{
				id: 4,
				title: "Art Exhibition",
				date: "May 1, 2026",
				time: "11:00 AM",
				venue: { name: "Art Gallery" },
				society: { name: "Art Society" },
				image: "https://images.unsplash.com/photo-1561214115-6e846a5f3a6f?w=400&h=300&fit=crop",
				attendees: 200,
				category: "Art",
			},
		]);

		setUpcomingEvents([
			{
				id: 5,
				title: "Startup Pitch Night",
				date: "April 18, 2026",
				time: "7:00 PM",
				venue: { name: "Innovation Hub" },
				society: { name: "Entrepreneurship Club" },
				image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=300&h=250&fit=crop",
				attendees: 150,
			},
			{
				id: 6,
				title: "Food Festival",
				date: "April 22, 2026",
				time: "5:00 PM",
				venue: { name: "Food Court" },
				society: { name: "Food Club" },
				image: "https://images.unsplash.com/photo-1555939594-58d7cb561a1a?w=300&h=250&fit=crop",
				attendees: 400,
			},
		]);
	}, []);

	const categories = [
		{
			name: "Technology",
			icon: "🖥️",
			image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=300&h=200&fit=crop",
		},
		{
			name: "Music",
			icon: "🎵",
			image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=200&fit=crop",
		},
		{
			name: "Sports",
			icon: "⚽",
			image: "https://images.unsplash.com/photo-1517836357463-d25ddfcbf042?w=300&h=200&fit=crop",
		},
		{
			name: "Art & Culture",
			icon: "🎨",
			image: "https://images.unsplash.com/photo-1561019613-cd4628902d4a?w=300&h=200&fit=crop",
		},
		{
			name: "Food & Drinks",
			icon: "🍽️",
			image: "https://images.unsplash.com/photo-1555939594-58d7cb561a1b?w=300&h=200&fit=crop",
		},
		{
			name: "Business",
			icon: "💼",
			image: "https://images.unsplash.com/photo-1552664730-d307ca884970?w=300&h=200&fit=crop",
		},
	];

	return (
		<div className="min-h-screen bg-gradient-to-b from-[#0f0f0e] to-[#1a1a18]">
			<nav className="sticky top-0 z-30 border-b border-white/10 bg-[#0f0f0e]/90 backdrop-blur">
				<div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 md:px-8">
					<Link to="/" className="text-lg font-semibold tracking-wide text-white">
						EventOra
					</Link>
					<div className="flex items-center gap-3">
						<Link
							to="/auth/register"
							className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-sky-500 to-cyan-500 px-5 py-2 text-sm font-semibold text-white hover:shadow-lg hover:shadow-sky-500/30 transition-all"
						>
							Get Started
						</Link>
						<Link
							to="/auth/login"
							className="inline-flex items-center justify-center rounded-lg border border-white/30 px-5 py-2 text-sm font-semibold text-white hover:border-sky-400/50 hover:bg-sky-500/10 transition-all"
						>
							Sign In
						</Link>
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
					<div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
				</div>

				<div className="relative h-full flex items-center justify-start px-8 md:px-16">
					<div className="max-w-2xl">
						<h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
							Discover Amazing <span className="bg-gradient-to-r from-sky-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">Events</span>
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
					<div className="bg-gradient-to-br from-sky-500/10 to-sky-500/5 border border-sky-500/20 rounded-xl p-6">
						<div className="text-4xl font-bold text-sky-400 mb-2">1.2K+</div>
						<p className="text-white/70">Active Events</p>
					</div>
					<div className="bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border border-cyan-500/20 rounded-xl p-6">
						<div className="text-4xl font-bold text-cyan-400 mb-2">50K+</div>
						<p className="text-white/70">Active Members</p>
					</div>
					<div className="bg-gradient-to-br from-violet-500/10 to-violet-500/5 border border-violet-500/20 rounded-xl p-6">
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
						{categories.map((category, index) => (
							<Link
								key={index}
								to={`/search?category=${category.name}`}
								className="group relative h-48 rounded-xl overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300"
							>
								<img
									src={category.image}
									alt={category.name}
									className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
								/>
								<div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
								<div className="absolute bottom-0 left-0 right-0 p-6">
									<p className="text-3xl mb-2">{category.icon}</p>
									<h3 className="text-2xl font-bold text-white">{category.name}</h3>
								</div>
							</Link>
						))}
					</div>
				</div>
			</section>

			{/* Featured Events */}
			<section className="py-16 px-4 md:px-8">
				<div className="max-w-7xl mx-auto">
					<h2 className="text-4xl font-bold text-white mb-4">Featured Events</h2>
					<p className="text-white/60 mb-12">Don't miss out on these amazing events</p>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
						{featuredEvents.map((event) => (
							<Link
								key={event.id}
								to={`/event/${event.id}`}
								className="group relative h-72 rounded-xl overflow-hidden cursor-pointer hover:shadow-xl hover:shadow-sky-500/20 transition-all duration-300"
							>
								<img
									src={event.image}
									alt={event.title}
									className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
								/>
								<div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

								{/* Badge */}
								<div className="absolute top-4 right-4 bg-gradient-to-r from-sky-500 to-cyan-500 px-3 py-1 rounded-full text-white text-sm font-semibold">
									{event.category}
								</div>

								{/* Event Info */}
								<div className="absolute bottom-0 left-0 right-0 p-5">
									<h3 className="text-xl font-bold text-white mb-3 line-clamp-2">{event.title}</h3>

									<div className="space-y-2 text-sm text-white/80">
										<p className="flex items-center gap-2">
											<FiCalendar className="text-sky-400 flex-shrink-0" />
											{event.date}
										</p>
										<p className="flex items-center gap-2">
											<FiMapPin className="text-pink-400 flex-shrink-0" />
											{event.venue?.name}
										</p>
										<p className="flex items-center gap-2">
											<FiUsers className="text-emerald-400 flex-shrink-0" />
											{event.attendees} attending
										</p>
									</div>
								</div>
							</Link>
						))}
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
								to={`/event/${event.id}`}
								className="group flex bg-gradient-to-r from-[#1f1f1d] to-[#2a2a27] border border-white/10 rounded-xl overflow-hidden hover:border-sky-500/50 hover:shadow-lg hover:shadow-sky-500/10 transition-all duration-300"
							>
								<img
									src={event.image}
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
			<section className="py-16 px-4 md:px-8">
				<div className="max-w-7xl mx-auto bg-gradient-to-r from-sky-500/10 via-cyan-500/10 to-emerald-500/10 border border-sky-500/20 rounded-2xl p-12 text-center">
					<h2 className="text-4xl font-bold text-white mb-4">Organize Your Own Event</h2>
					<p className="text-white/70 text-lg mb-8">Join thousands of organizers and create unforgettable experiences</p>
					<div className="flex flex-col sm:flex-row gap-4 justify-center">
						<Link
							to="/organizer/create"
							className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-sky-500 to-cyan-500 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-sky-500/50 transition-all"
						>
							Create Event <FiArrowRight />
						</Link>
						<Link
							to="/auth/register"
							className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-transparent border-2 border-sky-400 text-sky-400 font-semibold rounded-lg hover:bg-sky-500/10 transition-all"
						>
							Sign Up Now
						</Link>
					</div>
				</div>
			</section>
		</div>
	);
}
