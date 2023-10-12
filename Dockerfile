# Install dependencies only when needed
FROM node:lts-alpine AS deps

WORKDIR /opt/app
COPY package.json ./
RUN yarn install --frozen-lockfile

# Rebuild the source code only when needed
# This is where because may be the case that you would try
# to build the app based on some `X_TAG` in my case (Git commit hash)
# but the code hasn't changed.
FROM node:lts-alpine AS builder

# Accept the --build-arg values from the command line for setting the Pinecone 
# API key and environment variables
ARG PINECONE_API_KEY
ARG PINECONE_ENVIRONMENT

# Re-set the ENV variables for the runtime stage
ENV PINECONE_API_KEY=$PINECONE_API_KEY
ENV PINECONE_ENVIRONMENT=$PINECONE_ENVIRONMENT

ENV NODE_ENV=production
WORKDIR /opt/app
COPY . .
COPY --from=deps /opt/app/node_modules ./node_modules
RUN yarn build

# Production image, copy all the files and run next
FROM node:lts-alpine AS runner

# Accept the --build-arg values from the command line for setting the Pinecone 
# API key and environment variables. Yes, we need to do this in both stages, 
# because the prior build step will fail if the Pinecone client can't find 
# the env vars it needs
ARG PINECONE_API_KEY
ARG PINECONE_ENVIRONMENT

# Re-set the ENV variables for the runtime stage
ENV PINECONE_API_KEY=$PINECONE_API_KEY
ENV PINECONE_ENVIRONMENT=$PINECONE_ENVIRONMENT

ARG X_TAG
WORKDIR /opt/app
ENV NODE_ENV=production
COPY --from=builder /opt/app/next.config.js ./
COPY --from=builder /opt/app/public ./public
COPY --from=builder /opt/app/.next ./.next
COPY --from=builder /opt/app/node_modules ./node_modules
CMD ["node_modules/.bin/next", "start"]
