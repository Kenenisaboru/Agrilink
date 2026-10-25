FROM node:20-alpine

ENV NODE_ENV=production
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .
RUN mkdir -p uploads && chown -R node:node /app

USER node
EXPOSE 5000
CMD ["npm", "start"]
