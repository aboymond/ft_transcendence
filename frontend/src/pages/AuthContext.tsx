import { createContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
	token: string | null;
	isAuthenticated: boolean;
	login: (token: string) => void;
	logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
	const [token, setToken] = useState<string | null>(null);
	const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

	useEffect(() => {
		// Check if token exists in localStorage and update state accordingly
		const storedToken = localStorage.getItem('token');
		if (storedToken) {
			setToken(storedToken);
			setIsAuthenticated(true);
		}
	}, []); // Empty dependency array to run only once

	const login = (newToken: string) => {
		localStorage.setItem('token', newToken);
		setToken(newToken);
		setIsAuthenticated(true);
	};

	const logout = () => {
		localStorage.removeItem('token');
		setToken(null);
		setIsAuthenticated(false);
	};

	const authContextValue: AuthContextType = {
		token,
		isAuthenticated,
		login,
		logout,
	};

	return (
		<AuthContext.Provider value={authContextValue}>
			{children}
		</AuthContext.Provider>
	);
};
