FROM node:9.11.2

COPY ./src /usr/src/app
WORKDIR /usr/src/app

RUN npm install

EXPOSE 3000

CMD ["npm", "start"]