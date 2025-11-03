    # Use the official Node.js LTS (Long Term Support) image as the base
    # This provides a stable, production-ready environment
    FROM node:18-alpine

    # Set the working directory inside the container
    # All subsequent commands will be run from this directory
    WORKDIR /app

    # Copy package files first to leverage Docker layer caching
    # If dependencies haven't changed, Docker will use cached layers
    COPY package*.json ./

    # Install dependencies
    # --production flag installs only production dependencies (excludes devDependencies)
    # Remove this flag if you need dev dependencies for testing
    RUN npm ci --only=production

    # Copy the rest of the application code
    # This includes all source files, but excludes files listed in .dockerignore
    COPY . .

    # Expose port 3000 to allow external access to the application
    # This is the port the Node.js server listens on
    EXPOSE 3000

    # Set environment variable for the port
    # This can be overridden at runtime if needed
    ENV PORT=3000

    # Define the command to run the application
    # This starts the Node.js server using index.js
    CMD ["node", "index.js"]