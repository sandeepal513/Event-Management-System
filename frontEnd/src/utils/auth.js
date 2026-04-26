import axios from "axios";
import { jwtDecode } from "jwt-decode";

function clearAuthStorage() {
	localStorage.removeItem("token");
	localStorage.removeItem("username");
	localStorage.removeItem("userRole");
}

export function isTokenValid(token) {
	if (!token) return false;

	try {
		const decoded = jwtDecode(token);
		if (decoded.exp * 1000 <= Date.now()) {
			clearAuthStorage();
			return false;
		}
		return true;
	} catch {
		clearAuthStorage();
		return false;
	}
}

export async function isAdmin() {
	const username = localStorage.getItem("username");
	if (!username) return false;

	try {
		const response = await axios.get(`http://localhost:3000/api/v1/users/username/${username}`);

		// Check if data exists and role
		if (!response || !response.data || !response.data.data) {
			return false;
		}

		if (response.data.data.role !== "admin") {
			return false;
		}

		return true;

	} catch (error) {
		console.error(error);
		return false;
	}
}

export async function isOrganizer() {
	const username = localStorage.getItem("username");
	if (!username) return false;

	try {
		const response = await axios.get(`http://localhost:3000/api/v1/users/username/${username}`);

		// Check if data exists and role
		if (!response || !response.data || !response.data.data) {
			return false;
		}

		if (response.data.data.role !== "organizer") {
			return false;
		}

		return true;

	} catch (error) {
		console.error(error);
		return false;
	}
}


export async function isStudent() {
	const username = localStorage.getItem("username");
	if (!username) return false;

	try {
		const response = await axios.get(`http://localhost:3000/api/v1/users/username/${username}`);

		// Check if data exists and role
		if (!response || !response.data || !response.data.data) {
			return false;
		}

		if (response.data.data.role !== "student") {
			return false;
		}

		return true;

	} catch (error) {
		console.error(error);
		return false;
	}
}