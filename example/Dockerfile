FROM node:14.15-alpine

ENV DIR_APP /home/app

RUN mkdir -p $DIR_APP/node_modules \
    && chown -R node:node $DIR_APP

WORKDIR $DIR_APP

COPY --chown=node:node . .

USER node

RUN yarn && yarn build

EXPOSE 3000

CMD ["yarn", "start"]
