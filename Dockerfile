FROM buildkite/puppeteer:latest 
WORKDIR /app/zhibo_apider/
COPY . .
RUN yarn install && yarn run build
ENTRYPOINT ["node","dist/main.js"]