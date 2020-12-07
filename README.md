# socket.io-kafkajs

### Install

```shell
npm i socket.io-kafkajs
```

### Use Adapter

```js
import http from "http";
import SocketIO from "socket.io";
import { createAdapter } from "socket.io-kafkajs";

const httpServer = http.createServer(app);
const io = SocketIO(httpServer);

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

### Similar Packages  
[socket.io-redis](https://www.npmjs.com/package/socket.io-redis)

[socket.io-kfk](https://www.npmjs.com/package/socket.io-kfk)

### License

[MIT](https://github.com/xmanh/socket.io-kafkajs/blob/main/LICENSE)