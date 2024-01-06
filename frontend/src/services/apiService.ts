import { User, FriendRequest } from '../types';

const API_BASE_URL = 'http://localhost:8000/api'; // Update with your actual backend URL

// function getHeaders() {
//     const token = localStorage.getItem('token');
//     const headers = {
//         'Access-Control-Allow-Origin': 'salut',
//         'Content-Type': 'application/json',
//     };

//     if (token) {
//         headers.Authorization = `Bearer ${token}`;
//     }

//     return headers;
// }

function getHeaders() {
	const token = localStorage.getItem('token'); // Or however you store the token
	return {
		// 'Access-Control-Allow-Origin': '*',
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
    const text = await response.text();
    return text ? JSON.parse(text) : {};
}


interface UserData {
	username?: string;
	display_name?: string;
	bio?: string;
}

export const apiService = {
	verifyToken: async (token: string) => {
		if (!token) {
			return false;
		}
		try {
			await fetchAPI('users/token/verify/', {
				method: 'POST',
				body: JSON.stringify({ token }),
			});
			return true;
		} catch (error) {
			localStorage.removeItem('token');
			return false;
		}
	},
	authlogin: async() => {
		try{
			return fetchAPI('users/auth');
		} catch (error) {
			console.log("ERROR fetching api");
			return false;
		}
	},
	getUserProfile: async () => {
		return fetchAPI('users/profile/'); // Endpoint for fetching the current user's profile
	},
	getUser: async (userId: string) => {
		return fetchAPI(`users/${userId}/`); // Endpoint for fetching user data
	},
	register: async (username: string, password: string, displayName: string) => {
		return fetchAPI('users/register/', {
			// Update with your actual registration endpoint
			method: 'POST',
			body: JSON.stringify({ username, password, display_name: displayName }),
		});
	},
	login: async (username: string, password: string) => {
		return fetchAPI('users/login/', {
			// Update with your actual login endpoint
			method: 'POST',
			body: JSON.stringify({ username, password }),
		});
	},
	updateUserProfile: async (data: UserData) => {
		return fetchAPI('users/update/', {
			method: 'PATCH',
			body: JSON.stringify(data),
		});
	},
	uploadUserAvatar: async (avatar: File) => {
		const formData = new FormData();
		formData.append('avatar', avatar);
		return fetchAPI('users/avatar/upload/', {
			method: 'POST',
			body: formData,
		});
	},
	getFriends: async (): Promise<User[]> => {
		return fetchAPI('users/friends/list/');
	},
	getFriendRequests: async (): Promise<FriendRequest[]> => {
		return fetchAPI('users/friends/requests-list/');
	},
	sendFriendRequest: async (username: string) => {
		return fetchAPI('users/friends/request/', {
			method: 'POST',
			body: JSON.stringify({ receiver: username }),
		});
	},
	acceptFriendRequest: async (requestId: number) => {
		return fetchAPI(`users/friends/request-accept/${requestId}/`, {
			method: 'PATCH',
		});
	},
	rejectFriendRequest: async (requestId: number) => {
		return fetchAPI(`users/friends/request-reject-cancel/${requestId}/`, {
			method: 'DELETE',
		});
	},
	removeFriend: async (friendId: number) => {
		return fetchAPI(`users/friends/remove/${friendId}/`, {
			method: 'DELETE',
		});
	},
};

export default apiService;
