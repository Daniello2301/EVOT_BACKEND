FROM node:18.19.0-slim
WORKDIR /app
COPY . .
RUN npm install
CMD ["npm", "start"]