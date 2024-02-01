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

//TODO move game state to GameState ?
export interface Game {
	id: number;
	player1: User | null;
	player2: User | null;
	max_score: number;
	status: 'waiting' | 'in_progress' | 'completed';
	start_time?: string;
	end_time?: string;
	group_name?: string;
	winner?: User;
	loser?: User;
	ball_x: number;
	ball_y: number;
	ball_velocity_x: number;
	ball_velocity_y: number;
	player1_score: number;
	player2_score: number;
	pad1_x: number;
	pad1_y: number;
	pad2_x: number;
	pad2_y: number;
	player_turn: number; //TODO
}

export interface Tournament {
	id: number;
	name: string;
	creator: User;
	max_participants: number;
	max_score: number;
	participants: User[];
	games: Game[]; // Assuming GameHistory can represent the games in a tournament
	start_date?: string; // Optional to handle null values
	end_date?: string; // Optional to handle null values
	tournament_type: 'SE' | 'RR'; // 'SE' for Single Elimination, 'RR' for Round Robin
	status: 'CR' | 'IP' | 'CO'; // 'CR' for Created, 'IP' for In Progress, 'CO' for Completed
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
