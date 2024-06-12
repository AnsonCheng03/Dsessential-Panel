# Base image
FROM node:latest

# Set Memory limit
ENV NODE_OPTIONS=--max_old_space_size=2048

# Create app directory
WORKDIR /usr/src/app

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

# Remove existing node_modules and package-lock.json if they exist
RUN rm -rf node_modules package-lock.json

# Install app dependencies
RUN npm install --force

# Bundle app source
COPY . .

# Creates a "dist" folder with the production build
RUN npm run build

# Start the server using the production build
CMD [ "node", "dist/main.js" ]
