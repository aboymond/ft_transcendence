# Use the official Nginx image as a parent image
FROM nginx:1.24

# Copy the Nginx configuration file
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy static and media files
COPY --from=backend /app/staticfiles /app/staticfiles
COPY --from=backend /app/media /app/media