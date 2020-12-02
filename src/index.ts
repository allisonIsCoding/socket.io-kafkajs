import { Adapter, BroadcastOptions } from "socket.io-adapter";
import { Kafka, KafkaConfig, Producer, Consumer } from "kafkajs";
import { Namespace } from "socket.io";
import msgpack from "notepack.io";
import uid2 from "uid2";
import Debug from "debug";

const debug = new Debug("KafkaJsAdapter");

interface KafkaAdapterConfig extends KafkaConfig {
  topic: string;
  groupId: string;
}

export function createAdapter(opts: KafkaAdapterConfig) {
  return function (nsp: Namespace) {
    return new KafkaJsAdapter(nsp, opts);
  };
}

export class KafkaJsAdapter extends Adapter {
  protected uid: string;
  protected opts: KafkaAdapterConfig;
  protected pubClient: Producer;
  protected subClient: Consumer;

  constructor(nsp: Namespace, opts: KafkaAdapterConfig) {
    super(nsp);

    this.uid = uid2(6);
    this.opts = Object.assign(
      {
        brokers: "localhost:9092",
        clientId: "SocketIO",
        groupId: "SocketIO",
        topic: "SocketIO",
      },
      opts
    );

    this.initKafkaJs.call(this, this.opts);

    process.on("SIGINT", this.gracefulDeath.bind(this));
    process.on("SIGQUIT", this.gracefulDeath.bind(this));
    process.on("SIGTERM", this.gracefulDeath.bind(this));
  }

  protected async gracefulDeath() {
    if (this.pubClient) {
      await this.pubClient.disconnect();
    }
    if (this.subClient) {
      await this.subClient.disconnect();
    }
    process.exit(0);
  }

  protected async initKafkaJs(opts: KafkaAdapterConfig) {
    const kafka = new Kafka(opts);

    this.pubClient = kafka.producer();
    await this.pubClient.connect();

    this.subClient = kafka.consumer({ groupId: this.opts.groupId });
    await this.subClient.connect();
    await this.subClient.subscribe({ topic: this.opts.topic });
    await this.subClient.run({
      eachMessage: async ({ topic, partition, message }) => {
        const msg = message.value;
        this.handleMsg.call(this, msg);
      },
    });
  }

  protected handleMsg(msg: any) {
    const { uid, packet, opts } = msgpack.decode(msg);

    if (!(uid && packet && opts)) return debug("invalid params");
    if (this.uid === uid) return debug("ignore same uid");

    if (packet.nsp === undefined) packet.nsp = "/";
    if (packet.nsp !== this.nsp.name) {
      return debug("ignore different namespace");
    }

    if (opts.rooms && opts.rooms.length === 1) {
      const room = opts.rooms[0];
      if (room !== "" && !this.rooms.hasOwnProperty(room)) {
        return debug("ignore unknown room %s", room);
      }
    }

    this.broadcast.call(this, packet, opts);
  }

  public broadcast(packet: any, opts: BroadcastOptions) {
    packet.nsp = this.nsp.name;
    let onlyLocal = opts && opts.flags && opts.flags.local;
    if (!onlyLocal && this.pubClient) {
      const msg = msgpack.encode({ uid: this.uid, packet, opts });
      this.pubClient.send({
        topic: this.opts.topic,
        messages: [{ value: Buffer.from(msg) }],
      });
    }
    super.broadcast(packet, opts);
  }
}
