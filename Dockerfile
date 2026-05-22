FROM --platform=linux/amd64 node:18-alpine3.15

WORKDIR /app

# Install root dependencies
COPY --chown=node:node package.json package-lock.json ./
RUN npm ci

# Install dashboard dependencies fresh inside the container so npm picks up
# the correct platform-specific rollup binary (linux-x64-musl on Alpine)
COPY --chown=node:node dashboard/package.json dashboard/package-lock.json ./dashboard/
RUN cd dashboard && npm install

# Copy source and compile TypeScript
COPY --chown=node:node . /app
RUN npm run build

USER node

EXPOSE 3000

CMD ["npm", "run", "start"]
