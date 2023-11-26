import { createContext, useState, useEffect, ReactNode } from 'react';
import apiService from '../services/apiService';
import { UserProfile } from '../types';

interface AuthContextType {
	token: string | null;
	isAuthenticated: boolean;
	user: UserProfile | null;
	login: (token: string, user: UserProfile) => void;
	logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
	const [token, setToken] = useState<string | null>(null);
	const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
	const [user, setUser] = useState<UserProfile | null>(null);

	useEffect(() => {
		const storedToken = localStorage.getItem('token');
		if (storedToken) {
			setToken(storedToken);
			setIsAuthenticated(true);
			apiService.getUserProfile().then((userData) => setUser(userData));
		}
	}, []); // Empty dependency array to run only once

	const login = (newToken: string, newUser: UserProfile) => {
		localStorage.setItem('token', newToken);
		setToken(newToken);
		setIsAuthenticated(true);
		setUser(newUser);
	};

	const logout = () => {
		localStorage.removeItem('token');
		setToken(null);
		setIsAuthenticated(false);
		setUser(null);
	};

	const authContextValue: AuthContextType = {
		token,
		isAuthenticated,
		user,
		login,
		logout,
	};

	return (
		<AuthContext.Provider value={authContextValue}>
			{children}
		</AuthContext.Provider>
	);
};
