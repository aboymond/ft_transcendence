# API Documentation

This document provides detailed descriptions of the API endpoints used in the application.

## User API

### Verify Token

- **Endpoint:** `POST /api/users/token/verify/`
- **Description:** Verifies the provided token.
- **Request Body:** `{ "token": "<token>" }`
- **Response:** `true` if the token is valid, `false` otherwise.

### Auth Login

- **Endpoint:** `GET /api/users/auth/`
- **Description:** Authenticates the user.
- **Response:** User data if authentication is successful, `false` otherwise.

### Get User Profile

- **Endpoint:** `GET /api/users/profile/`
- **Description:** Fetches the profile of the current user.
- **Response:** User profile data.

### Get User

- **Endpoint:** `GET /api/users/{userId}/`
- **Description:** Fetches the data of a specific user.
- **Response:** User data.

### Get User Game History

- **Endpoint:** `GET /api/users/{userId}/game_history/`
- **Description:** Fetches the game history of a specific user.
- **Response:** Array of game history data.

### Register

- **Endpoint:** `POST /api/users/register/`
- **Description:** Registers a new user.
- **Request Body:** `{ "username": "<username>", "password": "<password>", "display_name": "<display_name>" }`
- **Response:** User data if registration is successful.

### Login

- **Endpoint:** `POST /api/users/login/`
- **Description:** Logs in a user.
- **Request Body:** `{ "username": "<username>", "password": "<password>" }`
- **Response:** User data if login is successful.

### Update User Profile

- **Endpoint:** `PATCH /api/users/update/`
- **Description:** Updates the profile of the current user.
- **Request Body:** `{ "username": "<username>", "display_name": "<display_name>" }`
- **Response:** Updated user data.

### Upload User Avatar

- **Endpoint:** `PUT /api/users/avatar/upload/`
- **Description:** Uploads an avatar for the current user.
- **Request Body:** Form data with the file under the key 'avatar'.
- **Response:** User data if upload is successful.

### Get Friends

- **Endpoint:** `GET /api/users/friends/list/`
- **Description:** Fetches the list of friends of the current user.
- **Response:** Array of user data.

### Get Friend Requests

- **Endpoint:** `GET /api/users/friends/requests-list/`
- **Description:** Fetches the list of friend requests of the current user.
- **Response:** Array of friend request data.

### Send Friend Request

- **Endpoint:** `POST /api/users/friends/request/`
- **Description:** Sends a friend request to a user.
- **Request Body:** `{ "receiver": "<username>" }`
- **Response:** Friend request data if the request is successful.

### Accept Friend Request

- **Endpoint:** `PATCH /api/users/friends/request-accept/{requestId}/`
- **Description:** Accepts a friend request.
- **Response:** Friend request data if the acceptance is successful.

### Reject Friend Request

- **Endpoint:** `DELETE /api/users/friends/request-reject-cancel/{requestId}/`
- **Description:** Rejects a friend request.
- **Response:** `204 No Content` if the rejection is successful.

### Remove Friend

- **Endpoint:** `DELETE /api/users/friends/remove/{friendId}/`
- **Description:** Removes a friend.
- **Response:** `204 No Content` if the removal is successful.

### Get Game History

- **Endpoint:** `GET /api/users/game_histories/`
- **Description:** Fetches the game history of the current user.
- **Response:** Array of game history data.

## Tournament API

### Get Tournaments

- **Endpoint:** `GET /api/tournaments/tournaments/`
- **Description:** Fetches the list of all tournaments.
- **Response:** Array of tournament data.

### Get Tournament

- **Endpoint:** `GET /api/tournaments/tournaments/{tournamentId}/`
- **Description:** Fetches the data of a specific tournament.
- **Response:** Tournament data.

### Add Participant to Tournament

- **Endpoint:** `PATCH /api/tournaments/tournaments/{tournamentId}/add_participant/`
- **Description:** Adds a participant to a tournament.
- **Response:** `204 No Content` if the addition is successful.

### Get Matches

- **Endpoint:** `GET /api/tournaments/matches/`
- **Description:** Fetches the list of all matches of a tournament.

### Get Match

- **Endpoint:** `GET /api/tournaments/matches/{matchId}/`
- **Description:** Fetches the data of a specific match.
- **Response:** Match data.
