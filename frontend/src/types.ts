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
	twofa: boolean;
}

export interface APIResponse {
	error?: string;
	detail?: string;
}

export interface GameHistory {
	id: number;
	player1: User;
	player2: User;
	player1_score: number;
	player2_score: number;
	winner: User;
	played_at: string;
}

export interface GameState {
	ballVelocity: { x: number; y: number };
	ballPosition: { x: number; y: number };

	player1_score: number;
	player2_score: number;

	playerTurn: number;

	pad1: { x: number; y: number };
	pad2: { x: number; y: number };

	winWidth: number;
	winHeight: number;
}

export interface Game {
	id: number;
	player1: User | null;
	player2: User | null;
	max_score: number;
	status: 'waiting' | 'in_progress' | 'pending' | 'completed';
	start_time?: string;
	end_time?: string;
	winner?: User;
	loser?: User;
	game_state?: GameState;
}

export interface Tournament {
	id: number;
	name: string;
	creator: User;
	max_participants: number;
	max_score: number;
	participants: User[];
	participants_usernames: string[];
	games: Game[]; // Assuming GameHistory can represent the games in a tournament
	start_date?: string; // Optional to handle null values
	end_date?: string; // Optional to handle null values
	status: 'waiting' | 'in_progress' | 'completed';
	winner?: User; // Optional to handle null values
}

export interface UserStatusData {
	user_id: number;
	status: string;
}

export interface GameEventData {
	game_id: number;
}

export interface GameErrorData {
	error: string;
}

type MessageData = UserStatusData | GameEventData | GameErrorData;

export interface WebSocketMessage {
	type:
		| 'user_event'
		| 'game_event'
		| 'general_request'
		| 'friend_request'
		| 'game_state'
		| 'game_error'
		| 'game_update';
	payload: {
		action: string;
		data: MessageData;
	};
}

export interface Match {
	id: number;
	player1: number;
	player2: number;
	match_order: number;
	round_number: number;
	game: number;
	player1_username: string;
	player2_username: string;
}

export interface FriendRequest {
	id: number;
	requester: User;
	receiver: User;
	status: 'sent' | 'accepted';
	created_at: string;
}
