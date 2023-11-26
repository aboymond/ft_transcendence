import { useAuth } from './hooks/useAuth';
import { Route, Routes, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import Profile from './pages/Profile';
import FriendsPage from './pages/FriendsPage';

const AppRoutes: React.FC = () => {
	const { isAuthenticated } = useAuth();

	return (
		<Routes>
			<Route path="/" element={<Home />} />
			<Route path="/register" element={<Register />} />
			<Route
				path="/login"
				element={
					isAuthenticated ? <Navigate to="/profile" replace /> : <Login />
				}
			/>
			<Route path="/profile" element={<Profile />} />
			<Route
				path="/friends"
				element={
					isAuthenticated ? <FriendsPage /> : <Navigate to="/login" replace />
				}
			/>
		</Routes>
	);
};

export default AppRoutes;
