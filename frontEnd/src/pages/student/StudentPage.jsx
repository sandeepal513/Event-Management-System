import { useState } from "react";
import { Link, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { MdAdminPanelSettings, MdClose, MdDashboard, MdMenu } from "react-icons/md";


import ProfilePage from "../../components/ProfilePage";
import ChangePassword from "../../components/ChangePassword";
import DeleteAccount from "../../components/DeleteAccount";
import StudentRegitered from "./StudentRegitered";
import TicketPage from "./TicketPage";
import EventDetailsPage from './EventDetailsPage';
import EventView from './EventView';


const StudentPage = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();

    const isActiveItem = (path) => {
        if (path === "/student/events") {
            return location.pathname.startsWith("/student/events");
        }

        return location.pathname === path;
    };

    const sidebarItems = [
        { label: "Profile", path: "/student/profile" },
        { label: "Events", path: "/student/events" },
        { label: "Registered Events", path: "/student/registered-events" },
        { label: "Change Password", path: "/student/change-password" },
        { label: "Delete Account", path: "/student/delete-account" },
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

            <div className={`fixed md:static z-30 w-75 h-full bg-[#1e1e1c] transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}>
                <div className="w-full h-25 flex flex-col items-center justify-center">
                    <MdAdminPanelSettings className="w-16 h-16 text-white" />
                    <h1 className="text-xl font-bold text-white">Student</h1>
                </div>

                <div className="w-full flex flex-col pl-5 pt-5">
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
                <div className="w-full">
                    <Routes>
                        <Route path="profile" element={<ProfilePage />} />
                        <Route path="registered-events" element={<StudentRegitered />} />
                        <Route path="events" element={<EventView />} />
                        <Route path="events/:eventId" element={<EventDetailsPage />} />
                        <Route path="tickets/:registrationId" element={<TicketPage />} />
                        <Route path="change-password" element={<ChangePassword />} />
                        <Route path="delete-account" element={<DeleteAccount />} />
                        <Route path="*" element={<Navigate to="profile" replace />} />
                    </Routes>
                </div>
            </div>
        </div>
    );
};

export default StudentPage;
