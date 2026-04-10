import { useState, useEffect } from "react";
import axios from "axios";
import { MdDashboard, MdMenu, MdClose } from "react-icons/md";
import { Link, Navigate, Route, Routes, useLocation } from "react-router-dom";
import EventApprovals from "./EventApproval";
import EventRegistration from "./EventRegistration";
import TicketCreate from "./TicketCreate";
import TicketManage from "./TicketManage";
import TicketSummary from "./TicketSummary";
import TicketSummaryEventList from "./TicketSummaryEventList";
import TicketEdit from "./TicketEdit";
import TicketCancel from "./TicketCancel";
import ProfilePage from "../../components/ProfilePage";
import ChangePassword from "../../components/ChangePassword";
import DeleteAccount from "../../components/DeleteAccount";
import UsersList from "../../components/UsersList";

const defaultAvatar = "/defaultAvatart.svg";

export default function AdminPage() {
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const [userProfile, setUserProfile] = useState({
		name: "",
		image: defaultAvatar,
		role: "Admin",
	});
	const location = useLocation();

	useEffect(() => {
		const fetchUserProfile = async () => {
			try {
				const username = localStorage.getItem("username");
				if (username) {
					const response = await axios.get(`http://localhost:3000/api/v1/users/username/${username}`);
					const user = response?.data?.data;
					if (user) {
						setUserProfile({
							name: user.name || "Admin",
							image: user.image || defaultAvatar,
							role: localStorage.getItem("userRole") || "Admin",
						});
					}
				}
			} catch (error) {
				console.error("Failed to fetch user profile", error);
			}
		};
		fetchUserProfile();
	}, []);

	const isActiveItem = (path) => {
		if (path === "/admin/approvals") {
			return location.pathname.startsWith("/admin/approvals");
		}

		if (path === "/admin/registrations") {
			return location.pathname.startsWith("/admin/registrations");
		}

		if (path === "/admin/tickets") {
			return location.pathname.startsWith("/admin/tickets");
		}

		return location.pathname === path;
	};

	const sidebarItems = [
		{ label: "Profile", path: "/admin/profile" },
		{ label: "Approvals", path: "/admin/approvals" },
		{ label: "Registrations", path: "/admin/registrations" },
		{ label: "Summary", path: "/admin/tickets/summary" },
		{ label: "Ticket Create", path: "/admin/tickets/create" },
		{ label: "Users", path: "/admin/userlist" },
		{ label: "Change Password", path: "/admin/change-password" },
		{ label: "Delete Account", path: "/admin/delete-account" },
		{ label: "Logout", path: "/logout" },
	];

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

			<div className={`fixed md:static z-30 w-75 h-full bg-[#1e1e1c] transition-transform duration-300 overflow-y-auto ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}>
				<div className="w-full px-5 py-6 flex flex-col items-center justify-center border-b border-white/10">
					<img
						src={userProfile.image}
						alt={userProfile.name}
						className="w-16 h-16 rounded-full object-cover border-2 border-white/10 mb-3"
					/>
					<h2 className="text-lg font-semibold text-white text-center truncate">{userProfile.name}</h2>
					<p className="text-xs text-white/60 mt-1">{userProfile.role}</p>
				</div>
				<div className="w-full flex flex-col pl-5 pt-5 pb-6">
					{sidebarItems.map((item) => (
						<Link
							key={item.label}
							to={item.path}
							state={item.path === "/logout" ? { backgroundLocation: location } : undefined}
							onClick={() => setSidebarOpen(false)}
							className={`flex items-center gap-2 border-r-4 px-3 py-3 text-lg transition ${isActiveItem(item.path) ? "border-sky-400 bg-sky-400/10 text-white" : "border-transparent text-white/70 hover:border-white/15 hover:bg-white/5 hover:text-white"}`}
						>
							<MdDashboard className="text-2xl" /> {item.label}
						</Link>
					))}
				</div>
			</div>

			<div className="flex-1 h-full overflow-y-scroll bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.18),transparent_35%),radial-gradient(circle_at_top_right,rgba(16,185,129,0.14),transparent_30%),linear-gradient(180deg,#171716_0%,#101010_100%)] pt-20 px-4 pb-6 md:px-8 md:pt-8 md:pb-8">
				<Routes>
					<Route path="profile" element={<ProfilePage />} />
					<Route path="approvals" element={<EventApprovals />} />
					<Route path="registrations" element={<EventRegistration />} />
					<Route path="tickets" element={<Navigate to="summary" replace />} />
					<Route path="tickets/manage" element={<TicketManage />} />
					<Route path="tickets/summary" element={<TicketSummary />} />
					<Route path="tickets/summary/:eventId" element={<TicketSummaryEventList />} />
					<Route path="tickets/create" element={<TicketCreate />} />
					<Route path="tickets/edit/:ticketId" element={<TicketEdit />} />
					<Route path="tickets/cancel/:ticketId" element={<TicketCancel />} />
					<Route path="userlist" element={<UsersList />} />
					<Route path="change-password" element={<ChangePassword />} />
					<Route path="delete-account" element={<DeleteAccount />} />
					<Route path="*" element={<Navigate to="profile" replace />} />

				</Routes>
			</div>
		</div>
	);
}
