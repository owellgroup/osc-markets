# Build (from this directory):
#   docker build -t osc-markets-web .
# Run:
#   docker run -d --name osc-markets-web --restart unless-stopped -p 5173:5173 osc-markets-web
# VITE_API_URL is taken from .env during the build (default http://92.4.136.176:8286).

FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# Vite reads .env in this directory. Pass --build-arg VITE_API_URL=... to override it.
ARG VITE_API_URL
RUN if [ -z "$VITE_API_URL" ]; then unset VITE_API_URL; else export VITE_API_URL; fi \
    && npm run build

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 5173
