FROM node
WORKDIR /app/NestFS
COPY package.json .
RUN npm i
COPY . .
EXPOSE 4000

CMD [ "npm", "run", "start:dev"]