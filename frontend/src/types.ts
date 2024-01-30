export interface User {
	id: number;
	username: string;
	display_name: string;
	wins: number;
	losses: number;
	tournament_wins: number;
	status: 'online' | 'offline' | 'in-game' | 'queueing';
	avatar?: string;
	friendship_id?: number;
}

export interface FriendRequest {
	id: number;
	requester: User;
	receiver: User;
	status: 'sent' | 'accepted';
	created_at: string;
}

export type ApiError = {
	message: string;
	response?: {
		data?: {
			detail?: string;
		};
	};
};

export interface GameHistory {
	id: number;
	players: User[];
	winner: User;
	played_at: string;
	player1_score: number;
	player2_score: number;
}

export interface GameState {
	ballVelocity: { x: number; y: number };
	ballPosition: { x: number; y: number };

	player1_score: number;
	player2_score: number;

	//TODO change to player1 and player2 ?
	playerTurnA: boolean;

	pad1_position: { x: number; y: number };
	pad2_position: { x: number; y: number };
}
