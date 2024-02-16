import React, { useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import { Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import Home from './pages/Home';
import VerifyTwoFa from './pages/VerifyTwoFa';
import LoadingScreen from './components/LoadingScreen';
import LogPage from './pages/LogPage';
import Credits from './pages/CreditsPage';

const AuthenticatedRoutes: React.FC = () => (
	<>
		<Routes>
			<Route path="/home" element={<Home />} />
			<Route path="/credits" element={<Credits />} />
			<Route path="*" element={<Navigate to="/home" replace />} />
		</Routes>
	</>
);

const NonAuthenticatedRoutes: React.FC = () => (
	<Routes>
		<Route path="/" element={<LogPage />} />
		<Route path="/verify-2fa/*" element={<VerifyTwoFa />} />
		<Route path="*" element={<Navigate to="/" replace />} />
	</Routes>
);

const AppRoutes: React.FC = () => {
	const { isAuthenticated, loading } = useAuth();
	const navigate = useNavigate();

	useEffect(() => {
		if (!loading && !isAuthenticated) {
			navigate('/');
		}
	}, [isAuthenticated, loading, navigate]);

	if (loading) {
		return <LoadingScreen />;
	}

	return isAuthenticated ? <AuthenticatedRoutes /> : <NonAuthenticatedRoutes />;
};

export default AppRoutes;
