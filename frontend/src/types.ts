export interface UserProfile {
	username: string;
	display_name: string;
	bio: string;
	wins: number;
	losses: number;
	// Include any other fields that your profile might have
}

export interface Friend {
	id: number;
	username: string;
	status: 'online' | 'offline' | 'in-game' | 'queueing';
	sender?: {
		id: number;
		username: string;
	};
}

export interface ApiError extends Error {
	message: string;
}
