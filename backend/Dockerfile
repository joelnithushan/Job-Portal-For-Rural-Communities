# Use the official Node.js 18-slim image as the base image
FROM node:18-slim

# Set the working directory to /app
WORKDIR /app

# Copy the package.json and package-lock.json files to the working directory
COPY package*.json ./

# Install the production dependencies only
RUN npm install --omit=dev

# Copy the rest of the application files to the working directory
COPY . .

# Set the PORT environment variable (default 5000)
# Cloud Run or Northflank will override this if configured
ENV PORT=5000

# Expose the configured PORT
EXPOSE 5000

# Run the command to start the application
CMD ["npm", "start"]
