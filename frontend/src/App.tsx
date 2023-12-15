// frontend/src/App.tsx
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import WebSocketHandler from './components/WebSocketHandler';
import './App.css';
import AppRoutes from './Routes';

const App: React.FC = () => {
	return (
		<AuthProvider>
			<WebSocketHandler>
				<Router>
					<div id="image-container">
						<img src="./img/light.png" alt="Light" id="light" />
						<img src="./img/scanlines.png" alt="Scanlines" id="scan" />
						<img src="./img/bezel.png" alt="Bezel" id="bezel" />
					</div>
					
					<AppRoutes />
				</Router>
			</WebSocketHandler>
		</AuthProvider>
	);
};

export default App;
