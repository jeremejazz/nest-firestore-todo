# --- STAGE 1: BUILD ---
FROM node:25-alpine AS build

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build the NestJS app (outputs to /app/dist)
RUN npm run build


# --- STAGE 2: RUN (Production) ---
# Use a lean base image for the final runtime environment
FROM node:22-alpine AS final

# Set working directory
WORKDIR /app

# Copy production dependencies from the build stage
COPY --from=build /app/package*.json ./
RUN npm ci --omit=dev

# Copy the compiled application code
COPY --from=build /app/dist ./dist

# The default port for Cloud Run is 8080
ENV PORT=8080

# Command to run the NestJS application
CMD [ "node", "dist/main" ]