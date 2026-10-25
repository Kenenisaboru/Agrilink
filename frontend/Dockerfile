FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG VITE_API_URL=http://localhost:5000
ARG VITE_FLASK_API_URL=http://localhost:5001/api
ARG VITE_RECOMMENDER_URL=http://localhost:8001
ENV VITE_API_URL=$VITE_API_URL \
    VITE_FLASK_API_URL=$VITE_FLASK_API_URL \
    VITE_RECOMMENDER_URL=$VITE_RECOMMENDER_URL
RUN npm run build

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
