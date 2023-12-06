// src/main.tsx
import { createRoot } from 'react-dom/client';
import App from './App';
import 'bootstrap/dist/css/bootstrap.min.css';
import { StrictMode } from 'react';

const container = document.getElementById('root');
const root = createRoot(container!); // '!' to assert that container is non-null
root.render(
	<StrictMode>
		<App />
	</StrictMode>,
);
