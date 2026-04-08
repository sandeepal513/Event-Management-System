import { useState } from "react";
import { MdClose, MdEvent, MdMenu, MdPerson, MdSchedule } from "react-icons/md";
import { Link, Navigate, Route, Routes } from "react-router-dom";
import EventView from "./EventView";
import EventDetailsPage from "./EventDetailsPage";
import StudentRegitered from "./StudentRegitered";
import TicketPage from "./TicketPage";

export default function StudentPage() {
	const [sidebarOpen, setSidebarOpen] = useState(false);

	return (
		<div className="w-full h-screen flex relative">
			{sidebarOpen && (
				<div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={() => setSidebarOpen(false)} />
			)}

			<button
				className="fixed top-4 left-4 z-30 md:hidden bg-[#29384d] text-white p-2 rounded-lg"
				onClick={() => setSidebarOpen((open) => !open)}
			>
				{sidebarOpen ? <MdClose className="text-2xl" /> : <MdMenu className="text-2xl" />}
			</button>

			<div className={`fixed md:static z-30 w-75 h-full bg-[#1e1e1c] transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}>
				<div className="w-full h-25 flex flex-col items-center justify-center">
					<MdPerson className="w-16 h-16 text-white" />
					<h1 className="text-xl font-bold text-white">Student</h1>
				</div>

				<div className="w-full flex flex-col pl-5 pt-5">
					<Link to="/student/events" onClick={() => setSidebarOpen(false)} className="flex items-center gap-2 p-3 text-lg text-white/70">
						<MdEvent className="text-2xl" /> Events
					</Link>
					<Link to="/student/registrations" onClick={() => setSidebarOpen(false)} className="flex items-center gap-2 p-3 text-lg text-white/70">
						<MdSchedule className="text-2xl" /> Registrations
					</Link>
				</div>
			</div>

			<div className="flex-1 h-full bg-[#151514] overflow-y-scroll pt-14 md:pt-6 px-4 md:px-6">
				<Routes>
					<Route path="events" element={<EventView />} />
					<Route path="events/:eventId" element={<EventDetailsPage />} />
					<Route path="registrations" element={<StudentRegitered />} />
					<Route path="*" element={<Navigate to="events" replace />} />
					<Route path="tickets/:registrationId" element={<TicketPage />} />
				</Routes>
			</div>
		</div>
	);
}
