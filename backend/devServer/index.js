const fs = require('fs');
const { fork } = require('node:child_process');

let apiServer = fork(`${__dirname}/../build/index.js`, {});

fs.watch(`${__dirname}/../build`,{persistent: true, recursive: true}, (event, filename) => {
  apiServer.kill();
  apiServer = fork(`${__dirname}/../build/index.js`, {});
});