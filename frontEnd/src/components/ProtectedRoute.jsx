import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { isAdmin, isOrganizer, isTokenValid } from "../utils/auth";

export default function ProtectedRoute({ children, requiredRole }) {
	const location = useLocation();
	const token = localStorage.getItem("token");
	const authorized = isTokenValid(token);
	const [hasRequiredRole, setHasRequiredRole] = useState(requiredRole ? null : true);

	useEffect(() => {
		if (!authorized) {
			toast.error("Please login to continue", { id: "auth-required" });
			return;
		}

		let isMounted = true;

		const checkRole = async () => {
			if (!requiredRole) {
				if (isMounted) setHasRequiredRole(true);
				return;
			}

			let allowed = false;
			if (requiredRole === "admin") {
				allowed = await isAdmin();
			} else if (requiredRole === "organizer") {
				allowed = await isOrganizer();
			}

			if (isMounted) {
				setHasRequiredRole(allowed);
				if (!allowed) {
					toast.error("You are not authorized to access this page", {
						id: `role-required-${requiredRole}`,
					});
				}
			}
		};

		checkRole();

		return () => {
			isMounted = false;
		};
	}, [authorized, requiredRole]);

	if (!authorized) {
		return <Navigate to="/auth/login" replace state={{ from: location }} />;
	}

	if (requiredRole && hasRequiredRole === null) {
		return null;
	}

	if (requiredRole && !hasRequiredRole) {
		return <Navigate to="/" replace />;
	}

	return children;
}