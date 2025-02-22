FROM node:latest

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci

COPY . .

RUN echo "" > credentials/google-credentials.json

RUN npm run build

EXPOSE 8000

CMD ["npm", "start"]    