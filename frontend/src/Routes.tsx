import { useAuth } from './hooks/useAuth';
import { Route, Routes, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Profile from './components/Profile';
import Friends from './components/Friends';
import LoadingScreen from './components/LoadingScreen';
import LogPage from './pages/LogPage';
import TestNavbar from './components/TestNavbar';
import TestPage from './pages/TestPage';

const AuthenticatedRoutes: React.FC = () => (
	<>
		<TestNavbar />
		<Routes>
			<Route path="/home" element={<Home />} />
			<Route path="/test" element={<TestPage />} />
			<Route path="/profile" element={<Profile />} />
			<Route path="/friends" element={<Friends />} />
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
