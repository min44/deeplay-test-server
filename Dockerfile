FROM node:latest

ADD package.json /app/package.json
ADD package-lock.json /app/package-lock.json

WORKDIR /app

COPY src /app/src

# RUN apk --update --no-cache add --virtual build-dependencies git \
#     && npm install \
#     && apk del build-dependencies

CMD npm run buld && npm run start

EXPOSE 4000