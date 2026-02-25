# ---- Dependencies ----
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# ---- Build ----
FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time env vars (NEXT_PUBLIC_* must be set at build time)
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_APP_NAME=JobPortal
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_APP_NAME=$NEXT_PUBLIC_APP_NAME

RUN npm run build

# ---- Runtime ----
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/public ./public
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
