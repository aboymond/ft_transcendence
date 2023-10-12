FROM node:16-alpine

COPY /app /usr/src/

WORKDIR /usr/src/app

#COPY package.json .


RUN npm install

EXPOSE 3000

CMD ["npm", "start"]

