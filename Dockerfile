FROM node:alpine AS build

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY . /usr/src/app/
RUN npm install
RUN npx tsc

FROM node:alpine

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY --from=build /usr/src/app/node_modules /usr/src/app/node_modules
COPY --from=build /usr/src/app/build /usr/src/app/build

CMD ["node", "build/index.js"]
