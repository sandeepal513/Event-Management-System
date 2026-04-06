import { useState } from "react";
import { MdAdminPanelSettings, MdDashboard, MdMenu, MdClose } from "react-icons/md";
import { Link, Navigate, Route, Routes } from "react-router-dom";
import EventApprovals from "./EventApproval";

export default function AdminPage() {
	const [sidebarOpen, setSidebarOpen] = useState(false);

	return (
		<div className="w-full h-screen flex relative">
			{sidebarOpen && (
				<div
					className="fixed inset-0 bg-black/50 z-20 md:hidden"
					onClick={() => setSidebarOpen(false)}
				/>
			)}

			<button
				className="fixed top-4 left-4 z-30 md:hidden bg-[#29384d] text-white p-2 rounded-lg"
				onClick={() => setSidebarOpen(!sidebarOpen)}
			>
				{sidebarOpen ? <MdClose className="text-2xl" /> : <MdMenu className="text-2xl" />}
			</button>

			<div className={`fixed md:static z-30 w-75 h-full bg-[#1e1e1c] transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}>
				<div className="w-full h-25 flex flex-col items-center justify-center">
					<MdAdminPanelSettings className="w-16 h-16 text-white" />
					<h1 className="text-xl font-bold text-white">Admin</h1>
				</div>
				<div className="w-full flex flex-col pl-5 pt-5">
					<Link to="/admin/approvals" onClick={() => setSidebarOpen(false)} className="flex items-center gap-2 p-3 text-lg text-white/70">
						<MdDashboard className="text-2xl" /> Approvals
					</Link>
				</div>
			</div>

			<div className="flex-1 h-full bg-gray-100 overflow-y-scroll pt-14 md:pt-0">
				<Routes>
					<Route path="approvals" element={<EventApprovals />} />
					<Route path="*" element={<Navigate to="approvals" replace />} />
				</Routes>
			</div>
		</div>
	);
}
