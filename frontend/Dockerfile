# Use an official Node.js LTS (Long Term Support) image as the base image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json separately to leverage Docker layer caching
COPY package.json .
COPY package-lock.json .

# Install Node.js dependencies
RUN npm install
RUN npm install react-scripts

# Copy the rest of the application code
COPY . .

# Expose the default React Native development server port
EXPOSE 3000

# Start the React Native development server
CMD ["npm", "start"]
