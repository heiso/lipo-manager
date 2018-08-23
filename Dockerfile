FROM node:latest-alpine

WORKDIR /usr/app
COPY src .
COPY index.js .
COPY package.json .
COPY package-lock.json .

RUN npm i

CMD ["node", "index.js"]
