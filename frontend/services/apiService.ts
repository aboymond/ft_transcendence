const API_BASE_URL = 'http://localhost:8000/api'; // Update with your actual backend URL

function getHeaders() {
	const token = localStorage.getItem('token'); // Or however you store the token
	return {
		'Content-Type': 'application/json',
		...(token ? { Authorization: `Bearer ${token}` } : {}),
	};
}

async function fetchAPI(endpoint: string, options = {}) {
	const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
		...options,
		headers: getHeaders(),
	});
	if (!response.ok) {
		throw new Error(`API call failed: ${response.statusText}`);
	}
	return response.json();
}

export const apiService = {
	getUser: async (userId: string) => {
		return fetchAPI(`users/${userId}/`); // Endpoint for fetching user data
	},
	updateUser: async (userId: string, userData: any) => {
		return fetchAPI(`users/${userId}/`, {
			// Endpoint for updating user data
			method: 'PUT',
			body: JSON.stringify(userData),
		});
	},
	login: async (username: string, password: string) => {
		return fetchAPI('users/login/', {
			// Update with your actual login endpoint
			method: 'POST',
			body: JSON.stringify({ username, password }),
		});
	},
	// Add other API methods as needed
};
