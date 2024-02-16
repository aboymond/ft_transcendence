import { createContext, useState, useEffect, ReactNode } from 'react';
import apiService from '../services/apiService';
import { User } from '../types';
import { jwtDecode } from 'jwt-decode';

interface AuthContextType {
	token: string | null;
	isAuthenticated: boolean;
	user: User | null;
	TwoFa: boolean;
	loading: boolean;
	login: (token: string, user: User, TwoFa: boolean) => void;
	logout: () => void;
	verifyOtp: (username: string, otp:string) => void;
	updateUser: (user: User) => void;
}

interface DecodedToken {
	[key: string]: unknown;
	exp: number;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
	const [token, setToken] = useState<string | null>(null);
	const [TwoFa, setTwoFa] = useState<boolean>(false);
	const [OtpValidated, setOtpValidated] = useState(false);
	const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		setLoading(true);
		const storedToken = localStorage.getItem('token');
		if (storedToken) {
			const decodedToken: DecodedToken = jwtDecode(storedToken);
			const currentTime = Date.now() / 1000;

			if (decodedToken.exp > currentTime) {
				setToken(storedToken);
				setIsAuthenticated(true);
				apiService.getUserProfile().then((userData) => setUser(userData));
			} else {
				// Token is expired
				localStorage.removeItem('token');
				setUser(null);
				setToken(null);
				setIsAuthenticated(false);
			}
		}
		setLoading(false);
	}, []);

	const login = (newToken: string, newUser: User, newTwoFa:boolean) => {
		localStorage.setItem('token', newToken);
		setTwoFa(newTwoFa);
		setToken(newToken);
		setIsAuthenticated(true);
		setUser(newUser);
	};

	const logout = () => {
		localStorage.removeItem('token');
		localStorage.removeItem('isTwoFAToggled');
		localStorage.removeItem('username_otp');
		setToken(null);
		setIsAuthenticated(false);
		setUser(null);
	};

	const verifyOtp = (username: string,  otp: string) => {
		apiService.verifyOtp(username, otp).then((isValid) => {
			if (isValid) 
				return (true);
			else 
			{
				console.error("OTP verification failed:");
				return (false);
			}
		})
	};

	const updateUser = (updatedUser: User) => {
		setUser(updatedUser);
	};

	const authContextValue: AuthContextType = {
		token,
		isAuthenticated,
		user,
		TwoFa,
		verifyOtp,
		loading,
		login,
		logout,
		updateUser,
	};

	return <AuthContext.Provider value={authContextValue}>{children}</AuthContext.Provider>;
};
