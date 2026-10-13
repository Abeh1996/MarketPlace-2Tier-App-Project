FROM nginx:alpine

# Copy frontend files into Nginx web root
COPY index.html /usr/share/nginx/html/
COPY app.js /usr/share/nginx/html/
COPY config.js /usr/share/nginx/html/
COPY styles.css /usr/share/nginx/html/

# Replace default Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf