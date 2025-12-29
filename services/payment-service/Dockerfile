FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3008
HEALTHCHECK --interval=30s --timeout=3s CMD wget --spider http://localhost:3008/health || exit 1
CMD ["node", "src/app.js"]
