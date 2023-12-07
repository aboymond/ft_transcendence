import { useAuth } from './hooks/useAuth';
import { Route, Routes, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Profile from './pages/Profile';
import FriendsPage from './pages/FriendsPage';
import ProfileUpdate from './pages/ProfileUpdate';
import LoadingScreen from './components/LoadingScreen';
import LogPage from './pages/LogPage';

const AppRoutes: React.FC = () => {
	const { isAuthenticated, loading } = useAuth();

	return (
		<Routes>
			<Route path="/" element={isAuthenticated ? <Navigate to="/home" replace /> : <LogPage />} />
			<Route path="/home" element={isAuthenticated ? <Home /> : <Navigate to="/" replace />} />
			<Route path="/profile" element={<Profile />} />
			<Route
				path="/profile/update"
				element={isAuthenticated ? <ProfileUpdate /> : <Navigate to="/" replace />}
			/>
			<Route
				path="/friends"
				element={
					loading ? <LoadingScreen /> : isAuthenticated ? <FriendsPage /> : <Navigate to="/" replace />
				}
			/>
			<Route
				path="*"
				element={isAuthenticated ? <Navigate to="/home" replace /> : <Navigate to="/" replace />}
			/>
		</Routes>
	);
};

export default AppRoutes;
