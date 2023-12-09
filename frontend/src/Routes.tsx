import { useAuth } from './hooks/useAuth';
import { Route, Routes, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Profile from './components/Profile';
import FriendsPage from './pages/FriendsPage';
import LoadingScreen from './components/LoadingScreen';
import LogPage from './pages/LogPage';
import Navbar from './components/Navbar';
import TestPage from './pages/TestPage';

const AuthenticatedRoutes: React.FC = () => (
	<>
		<Navbar />
		<Routes>
			<Route path="/home" element={<Home />} />
			<Route path="/test" element={<TestPage />} />
			<Route path="/profile" element={<Profile />} />
			<Route path="/friends" element={<FriendsPage />} />
			<Route path="*" element={<Navigate to="/home" replace />} />
		</Routes>
	</>
);

const NonAuthenticatedRoutes: React.FC = () => (
	<Routes>
		<Route path="/" element={<LogPage />} />
		<Route path="*" element={<Navigate to="/" replace />} />
	</Routes>
);

const AppRoutes: React.FC = () => {
	const { isAuthenticated, loading } = useAuth();

	if (loading) {
		return <LoadingScreen />;
	}

	return isAuthenticated ? <AuthenticatedRoutes /> : <NonAuthenticatedRoutes />;
};

export default AppRoutes;
