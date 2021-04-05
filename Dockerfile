FROM buildkite/puppeteer:latest as builder
WORKDIR /app/zhibo_url/
COPY . .
RUN yarn install\
    &&yarn run build

FROM buildkite/puppeteer:latest as prod
WORKDIR /app/zhibo_url/
COPY --from=0 /app/zhibo_url/dist .
ENTRYPOINT ["node",'main.js']