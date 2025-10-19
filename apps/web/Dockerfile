FROM node:18 as builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml ./

# Install pnpm 9 (to match lockfile version)
RUN npm install -g pnpm@9

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Force reinstall to fix native module issues
RUN rm -rf node_modules && pnpm install --frozen-lockfile

# Build the application (from workspace root)
RUN pnpm build

# Production stage
FROM nginx:alpine

# Copy built files from builder stage
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html

# Copy nginx configuration
COPY apps/web/nginx.conf /etc/nginx/nginx.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
