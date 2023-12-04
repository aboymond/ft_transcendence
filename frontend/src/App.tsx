import React from 'react';
import { BrowserRouter as Router} from 'react-router-dom';
import { AuthProvider } from './pages/AuthContext';
import './App.css';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import AppRoutes from './Routes';

const App: React.FC = () => {
	return (
		<AuthProvider>
			<Router>
				<div id="page">
					<div id="image-container">
						<img src="./img/light.png" alt="Light" id="light" />
						<img src="./img/scanlines.png" alt="Scanlines" id="scan" />
						<img src="./img/bezel.png" alt="Bezel" id="bezel" />
					</div>
					<AppRoutes />
				</div>
			</Router>
		</AuthProvider>
	);
};

export default App;
