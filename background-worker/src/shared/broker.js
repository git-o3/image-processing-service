import amqp from "amqplib";

const MESSAGE_BROKER_URL = process.env.MESSAGE_BROKER_URL || "amqp://localhost:5672"

let connection = null;
let channel = null;
let isConnecting = false;

/**
 * establishes a connection to RabbitMQ and initializes a channel
 */
export async function connectBroker() {
    if (connection && channel) return { connection, channel };
    if (isConnecting) {
        await new Promise(resolve => setTimeout(resolve, 1000)); //limit on reconnect loop
        return connectBroker()
    }

    isConnecting = true;
    console.log("🔌 Connecting to RabbitMQ broker...");

    try {
        
        connection = await amqp.connect(MESSAGE_BROKER_URL);
        channel = await connection.createChannel();
        
        channel.on("error", (err) => console.error("Channel error:", err.message));
        channel.on("close", () => { channel = null; });

        await channel.prefetch(1);

        isConnecting = false;
        console.log("🚀 Successfully connected to RabbitMQ infrastructure.");

        // handle unexpected connection drops gracefully
        connection.on("error", (err) => {
            console.error("RabbitMQ connection error:", err.message);
            handleReconnect()
        });

        connection.on("close", () => {
            console.warn("RabbitMQ connection closed. Attempting reconnect...");
            handleReconnect()
        });
        
        return { connection, channel };
    } catch (error) {
        isConnecting = false;
        console.error(`Failed to connect to RabbitMQ: ${error.message}`);
        handleReconnect()
    }
}

/**
 * handles reconnection attemtps with a basic delay loop
 */
function handleReconnect() {
    connection = null;
    channel = null;
    console.log("🔁 Scheduling RabbitMQ reconnection in 5 seconds...");
    setTimeout(connectBroker, 5000);
}

/**
 * Public API: publish a message directly to a specific queue
 * @param {string} queueName 
 * @param {Object} payload 
 */

export async function publishToQueue(queueName, payload) {
    try {
        if (!channel) {
            await connectBroker();
        }

        // asserting the queue ensure it exists befor sending messages to it
        await channel.assertQueue(queueName, {durable: true })

        const messageBuffer = Buffer.from(JSON.stringify(payload));
        channel.sendToQueue(queueName, messageBuffer, { persistent: true });

        console.log(`Message successfully published to queue [${queueName}]`);
    } catch (error) {
        console.error(`Failed to publis message to queue [${queueName}]:`, error.message);
        throw error;
    }
}

/**
 * Public API: register a consumer function for a specific queue
 * @param {string} queueName 
 * @param {Function} onMessageAck 
 */

export async function subscribeToQueue(queueName, onMessageAck) {
    try {
        if (!channel) {
            await connectBroker();
        }

        await channel.assertQueue(queueName, { durable: true });

        console.log(` Subscribed and listening to queue [${queueName}]`);

        await channel.consume(queueName, (msg) => {
            if (msg !== null) {
                try {
                    const content = JSON.parse(msg.content.toString());
                    // trigger a callback logic from the module layer
                    onMessageAck(content, () => channel.ack(msg));
                } catch (parseError) {
                    console.error("Error parsing incoming queue message:", parseError.message);
                    // reject malformed JSON messages entirely so they don't clog the queue
                    channel.nack(msg, false, false);
                }
            }
        });
    } catch (error) {
        console.error(`Failed to intialize subscriber on queue [${queueName}]:`, error.message);
        throw error;
    }
}