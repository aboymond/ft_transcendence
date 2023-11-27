export interface User {
	id: number;
	username: string;
	display_name: string;
	bio: string;
	wins: number;
	losses: number;
	// Include any other fields that your profile might have
}

export interface Friend {
	id: number;
	user: User;
	status: 'online' | 'offline' | 'in-game' | 'queueing';
}

export interface FriendRequest {
	id: number;
	requester: User;
	receiver: User;
	status: 'sent' | 'accepted' | 'rejected';
	created_at: string;
}

export interface ApiError extends Error {
	message: string;
}
