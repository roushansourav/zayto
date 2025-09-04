# Build stage
FROM nginx:alpine

# Use prebuilt static export from local context (out/)
COPY out /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]

