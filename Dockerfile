FROM        node:alpine
RUN         mkdir -p /home/node/app/node_modules /home/node/app/data /home/node/app/ts-build && \
    chown -R node:node /home/node/app && \
    npm install -g nodemon

WORKDIR     /home/node/app
COPY        ./node_modules  /home/node/app/node_modules
COPY        ./ts-build      /home/node/app/ts-build
EXPOSE      8082
CMD         [ "nodemon", "ts-build/index.js" ]