# Use Node 20 Alpine
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy package files first to leverage caching
COPY package.json pnpm-lock.yaml* ./

# Install dependencies
RUN pnpm install

# Copy all app files
COPY . .

# Start with an interactive shell
CMD ["sh"]
