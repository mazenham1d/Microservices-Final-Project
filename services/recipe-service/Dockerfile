FROM node:18-alpine

WORKDIR /app

# Install wget for health checks
RUN apk add --no-cache wget

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 3005

CMD ["npm", "start"]
