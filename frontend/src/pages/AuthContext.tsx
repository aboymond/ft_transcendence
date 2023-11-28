import { createContext, useState, useEffect, ReactNode } from 'react';
import apiService from '../services/apiService';
import { User } from '../types';

interface AuthContextType {
	token: string | null;
	isAuthenticated: boolean;
	user: User | null;
	login: (token: string, user: User) => void;
	logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
	const [token, setToken] = useState<string | null>(null);
	const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
	const [user, setUser] = useState<User | null>(null);

	useEffect(() => {
		const storedToken = localStorage.getItem('token');
		if (storedToken) {
			setToken(storedToken);
			apiService.verifyToken(storedToken).then((isValid) => {
				setIsAuthenticated(isValid);
				if (isValid) {
					apiService.getUserProfile().then((userData) => setUser(userData));
				} else {
					setUser(null);
					setToken(null);
				}
			});
		}
	}, []);

	const login = (newToken: string, newUser: User) => {
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
