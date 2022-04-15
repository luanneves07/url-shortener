const amqp = require('amqplib/callback_api');

let amqpConnection = null;
let mainChannel = null;

const publishToQueue = async (queueName, data) => {
    mainChannel.sendToQueue(queueName, new Buffer.from(data));
    mainChannel.publishToQueue
}

module.exports = {
    connect: (finishConnect) => {
        amqp.connect(process.env.CLOUDAMQP_URL, (err, conn) => {
            conn.createChannel((err, channel) => {
                mainChannel = channel;
            });
            conn.on('error', (err) => {
                console.error("[AMQP] conn error", err.message);
            });
            conn.on('exit', (code) => {
                ch.close();
                console.log(`Closing rabbitmq channel -> ${code}`);
            });
            conn.on("close", () => {
                // Reconnect when connection was closed
                console.error("[AMQP] reconnecting");
                return setTimeout(() => { module.exports.connect(finishConnect) }, 1000);
            });
            console.log("[AMQP] connected");
            amqpConnection = conn;
            finishConnect();
        });
    },
    publishToQueue: publishToQueue,
}
