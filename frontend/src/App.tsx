import React from 'react';
import { BrowserRouter as Router} from 'react-router-dom';
import { AuthProvider } from './pages/AuthContext';
import './App.css';
import Navbar from './components/Navbar';
import AppRoutes from './Routes';

const App: React.FC = () => {
	return (
		<AuthProvider>
			<Router>
				<Navbar />
				<AppRoutes />
			</Router>
		</AuthProvider>
	);
};

export default App;
