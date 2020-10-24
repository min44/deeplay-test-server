FROM node:latest

ADD package.json /app/package.json
ADD package-lock.json /app/package-lock.json

WORKDIR /app

COPY src /app/src

RUN npm run build
CMD npm run start

EXPOSE 4000