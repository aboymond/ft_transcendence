import { User, FriendRequest, GameHistory } from '../types';

interface ErrorResponse {
	detail?: string;
}
const API_BASE_URL = 'http://localhost:8000/api'; // Update with your actual backend URL

function getHeaders(includeToken = true): HeadersInit {
	const token = includeToken ? localStorage.getItem('token') : null;
	const headers = new Headers();
	headers.append('Content-Type', 'application/json');
	if (token) {
		headers.append('Authorization', `Bearer ${token}`);
	}
	return headers;
}

async function fetchAPI(endpoint: string, options: RequestInit = {}, includeToken = true) {
	const headers = getHeaders(includeToken);
	if (options.body instanceof FormData && headers instanceof Headers) {
		headers.delete('Content-Type');
	}

	const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
		...options,
		headers: headers,
	});

	if (response.status === 401) {
		localStorage.removeItem('token');
		throw new Error('Unauthorized');
	}
	if (!response.ok) {
		let errorDetail: ErrorResponse = {};
		const contentType = response.headers.get('Content-Type');
		if (contentType && contentType.includes('application/json')) {
			const text = await response.text();
			try {
				errorDetail = JSON.parse(text);
			} catch (e) {
				console.error('Error parsing JSON response:', e);
			}
		}
		const errorMessage = errorDetail.detail || `API call failed: ${response.statusText}`;
		throw new Error(errorMessage);
	}

	const text = await response.text();
	try {
		return text ? JSON.parse(text) : {};
	} catch (e) {
		console.error('Error parsing JSON response:', e);
		return {};
	}
}

interface UserData {
	username?: string;
	display_name?: string;
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

	authlogin: async () => {
		try {
			return fetchAPI('users/auth');
		} catch (error) {
			console.log('ERROR fetching api');
			return false;
		}
	},
	getUserById: async (userId: string): Promise<User> => {
		return fetchAPI(`users/${userId}/`);
	},
	getUsers(): Promise<User[]> {
		return fetchAPI('users/list/');
	},
	getUserProfile: async () => {
		return fetchAPI('users/profile/'); // Endpoint for fetching the current user's profile
	},
	getUser: async (userId: string) => {
		return fetchAPI(`users/${userId}/`); // Endpoint for fetching user data
	},
	getUserGameHistory: async (userId: number): Promise<GameHistory[]> => {
		return fetchAPI(`users/${userId}/game_history/`);
	},
	register: async (username: string, password: string, displayName: string, email: string) => {
		return fetchAPI(
			'users/register/',
			{
				// Update with your actual registration endpoint
				method: 'POST',
				body: JSON.stringify({ username, password, display_name: displayName, email }),
			},
			false,
		);
	},
	login: async (username: string, password: string) => {
		return fetchAPI(
			'users/login/',
			{
				// Update with your actual login endpoint
				method: 'POST',
				body: JSON.stringify({ username, password }),
			},
			false,
		);
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
		try {
			const response = await fetchAPI('users/avatar/upload/', {
				method: 'PUT',
				body: formData,
			});
			return response;
		} catch (error) {
			throw new Error('Error uploading avatar');
		}
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
	getGameHistory: async (): Promise<GameHistory[]> => {
		return fetchAPI('users/game_histories/');
	},
	getTournaments: async () => {
		return fetchAPI('tournaments/list/');
	},
	getTournament: async (tournamentId: number) => {
		return fetchAPI(`tournaments/${tournamentId}/detail/`);
	},
	getGames: async () => {
		return fetchAPI('games/list-create/');
	},
	getMatches: async (tournamentId: number) => {
		return fetchAPI(`tournaments/${tournamentId}/matches/`);
	},
	createGame: async (userId: number) => {
		return fetchAPI('games/create/', {
			method: 'POST',
			body: JSON.stringify({ user_id: userId }),
		});
	},
	joinGame: async (gameId: number, userId: number) => {
		return fetchAPI(`games/${gameId}/join/`, {
			method: 'PATCH',
			body: JSON.stringify({ user_id: userId }),
		});
	},
	pauseGame: async (gameId: number) => {
		return fetchAPI(`games/${gameId}/pause/`, {
			method: 'PATCH',
			body: JSON.stringify({ game_id: gameId }),
		});
	},
	resumeGame: async (gameId: number) => {
		return fetchAPI(`games/${gameId}/resume/`, {
			method: 'PATCH',
			body: JSON.stringify({ game_id: gameId }),
		});
	},
	sendKeyPress: async (gameId: number, playerId: number, key: string) => {
		return fetchAPI('games/keypress/', {
			method: 'POST',
			body: JSON.stringify({ game_id: gameId, player_id: playerId, key }),
		});
	},
	sendPlayerReady: async (gameId: number) => {
		return fetchAPI(`games/${gameId}/player_ready/`, {
			method: 'POST',
		});
	},
	leaveGame: async (gameId: number) => {
		return fetchAPI(`games/${gameId}/leave_game/`, {
			method: 'POST',
		});
	},
	leaveLoading: async (gameId: number) => {
		return fetchAPI(`games/${gameId}/leave_loading/`, {
			method: 'POST',
		});
	},
	createTournament: async (creator_id: number, name: string, max_participants: number, max_score: number) => {
		return fetchAPI('tournaments/create/', {
			method: 'POST',
			body: JSON.stringify({
				creator_id: creator_id,
				name: name,
				max_participants: max_participants,
				max_score: max_score,
			}),
		});
	},
	joinTournament: async (tournamentId: number, userId: number) => {
		return fetchAPI(`tournaments/${tournamentId}/join/`, {
			method: 'PATCH',
			body: JSON.stringify({ user_id: userId }),
		});
	},
	leaveTournament: async (tournamentId: number, userId: number) => {
		return fetchAPI(`tournaments/${tournamentId}/leave/`, {
			method: 'PATCH',
			body: JSON.stringify({ user_id: userId }),
		});
	},
};

export default apiService;
