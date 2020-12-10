# socket.io-kafkajs

### Install npm

```shell
npm i socket.io-kafkajs
```
### Install yarn
```shell
yarn add socket.io-kafkajs
```

### Use Adapter

```js
import http from "http";
import { Server } from "socket.io";
import { createAdapter } from "socket.io-kafkajs";

const httpServer = http.createServer(app);
const io = new Server(httpServer);

const adapter = createAdapter({
    brokers: "localhost:9092",
    clientId: "SocketIO",
    groupId: "SocketIO",
    topic: "SocketIO",
});

io.adapter(adapter);
```

### Option Config
Read package [kafkajs](https://www.npmjs.com/package/kafkajs)

### Support version
socket.io-kafkajs 2.x -- support -- socket.io 2.x

socket.io-kafkajs 3.x -- support -- socket.io 3.x

### Similar Packages
[socket.io-redis](https://www.npmjs.com/package/socket.io-redis)

[socket.io-kfk](https://www.npmjs.com/package/socket.io-kfk)

### License

[MIT](https://github.com/xmanh/socket.io-kafkajs/blob/main/LICENSE)
