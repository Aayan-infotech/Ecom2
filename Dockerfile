# Use an official Node.js runtime as a parent image
FROM node:20-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy the package.json and package-lock.json to the working directory
COPY package*.json ./

# Install the dependencies
RUN npm install --production

# Copy the rest of the application code to the working directory
COPY . .

# Expose the port the application will run on
EXPOSE 3003

# Define the command to run the application
CMD ["node", "app.js"]
