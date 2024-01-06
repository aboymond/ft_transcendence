// import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react';

// // https://vitejs.dev/config/
// export default defineConfig({
// 	plugins: [react()],
// 	server: {
// 		watch: {
// 			usePolling: true,
// 		},
// 		host: true, // needed for the Docker Container port mapping to work
// 		strictPort: true,
// 		port: 3001, // you can replace this port with any port
// 	},
// });


import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      usePolling: true,
    },
    host: true, // needed for the Docker Container port mapping to work
    strictPort: true,
    port: 3001, // you can replace this port with any port
    configureServer: ({ middlewares }) => {
      middlewares.use((req, res, next) => {
        // Enable CORS for all routes
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', '*');
        next();
      });
    },
  },
});