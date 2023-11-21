import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './pages/AuthContext';
import './App.css';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import Profile from './pages/Profile';
import FriendsPage from './pages/FriendsPage';
import Navbar from './components/Navbar';

const App: React.FC = () => {
	return (
		<AuthProvider>
			<Router>
				<Navbar />
				<Routes>
					<Route path="/" element={<Home />} />
					<Route path="/register" element={<Register />} />
					<Route path="/login" element={<Login />} />
					<Route path="/profile" element={<Profile />} />
					<Route path="/friends" element={<FriendsPage />} />
				</Routes>
			</Router>
		</AuthProvider>
	);
};

export default App;
