FROM node:10.12-alpine

COPY ./src /usr/src/app
WORKDIR /usr/src/app

RUN npm install

EXPOSE 3000

CMD ["npm", "start"]