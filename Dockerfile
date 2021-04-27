FROM node:15.14.0-alpine3.13

WORKDIR /app
RUN chown node:node .
USER node

COPY package.json .
RUN npm i --verbose

COPY . .

EXPOSE 4000

CMD [ "npm", "start" ]