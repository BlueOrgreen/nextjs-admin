FROM node:20-alpine AS builder

WORKDIR /app

# NEXT_PUBLIC_* must be set at build time (inlined into client bundle).
ARG NEXT_PUBLIC_API_BASE_URL=https://api.chenchar.com
ARG NEXT_PUBLIC_ORDER_API_BASE_URL=https://api.chenchar.com
ARG NEXT_PUBLIC_ORDER_SERVICE_BASE_URL=https://api.chenchar.com
ARG NEXT_PUBLIC_USER_API_BASE_URL=https://api.chenchar.com

ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_ORDER_API_BASE_URL=$NEXT_PUBLIC_ORDER_API_BASE_URL
ENV NEXT_PUBLIC_ORDER_SERVICE_BASE_URL=$NEXT_PUBLIC_ORDER_SERVICE_BASE_URL
ENV NEXT_PUBLIC_USER_API_BASE_URL=$NEXT_PUBLIC_USER_API_BASE_URL

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

RUN npm run build

FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000

CMD ["node", "server.js"]
