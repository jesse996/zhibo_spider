FROM buildkite/puppeteer:latest as builder
WORKDIR /app/zhibo_url/
COPY . .
RUN yarn install && yarn run build
ENTRYPOINT ["node","dist/main.js"]