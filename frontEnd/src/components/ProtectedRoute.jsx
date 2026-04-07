import { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { isTokenValid } from "../utils/auth";

export default function ProtectedRoute({ children }) {
	const location = useLocation();
	const token = localStorage.getItem("token");
	const authorized = isTokenValid(token);

	useEffect(() => {
		if (!authorized) {
			toast.error("Please login to continue", { id: "auth-required" });
		}
	}, [authorized]);

	if (!authorized) {
		return <Navigate to="/auth/login" replace state={{ from: location }} />;
	}

	return children;
}