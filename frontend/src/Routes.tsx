import { useAuth } from './hooks/useAuth';
import { Route, Routes, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Profile from './pages/Profile';
import FriendsPage from './pages/FriendsPage';
import ProfileUpdate from './pages/ProfileUpdate';
import LoadingScreen from './components/LoadingScreen';
import LogPage from './pages/LogPage';
import Navbar from './components/Navbar';

const AppRoutes: React.FC = () => {
	const { isAuthenticated, loading } = useAuth();

	return (
		<Routes>
			<Route path="/" element={isAuthenticated ? <Navigate to="/home" replace /> : <LogPage />} />
			<Route
				path="/home"
				element={
					isAuthenticated ? (
						<>
							<Navbar />
							<Home />
						</>
					) : (
						<Navigate to="/" replace />
					)
				}
			/>
			<Route
				path="/profile"
				element={
					<>
						<Navbar />
						<Profile />
					</>
				}
			/>
			<Route
				path="/profile/update"
				element={
					isAuthenticated ? (
						<>
							<Navbar />
							<ProfileUpdate />
						</>
					) : (
						<Navigate to="/" replace />
					)
				}
			/>
			<Route
				path="/friends"
				element={
					loading ? (
						<LoadingScreen />
					) : isAuthenticated ? (
						<>
							<Navbar />
							<FriendsPage />
						</>
					) : (
						<Navigate to="/" replace />
					)
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
