FROM nginx:1.29.6-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY . /usr/share/nginx/html

# documentation
# EXPOSE 80

# CMD ["nginx", "-g", "daemon off;"]
