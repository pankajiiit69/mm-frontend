# Use a lightweight Nginx image as the base image for serving static files
FROM nginx:alpine
WORKDIR /usr/share/nginx/html
RUN rm -rf ./*
# Copy the pre-built 'dist' folder from your local machine to the Nginx web directory in the container
# The default directory for Nginx static content is /usr/share/nginx/html
COPY ./dist .

# The default Nginx CMD will start the server, so no explicit CMD is needed here.
# The command below is the default for the nginx:alpine image, included for clarity.
ENTRYPOINT ["nginx", "-g", "daemon off;"]
