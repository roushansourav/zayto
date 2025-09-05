FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --production=false
COPY . .
EXPOSE 3006
CMD ["npm", "start"]


