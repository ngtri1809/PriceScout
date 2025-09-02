FROM node:18-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml* ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY apps/api/ ./apps/api/
COPY packages/shared/ ./packages/shared/

# Generate Prisma client
WORKDIR /app/apps/api
RUN pnpm db:generate

# Build the application
RUN pnpm build

# Expose port
EXPOSE 8080

# Start the application
CMD ["pnpm", "start"]
