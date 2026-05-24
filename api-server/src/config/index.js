import { config } from "dotenv";

config();

const {
    MONGO_URI,
    PORT = 8081,
    JWT_SECRET,
    NODE_ENV = "development",
    MESSAGE_BROKER_URL
} = process.env;

const queue = { 
  imageProcessing: "IMAGE_PROCESSING_TASKS" 
};

export default {
    MONGO_URI,
    PORT: parseInt(PORT, 10),
    JWT_SECRET,
    env: NODE_ENV,
    msgBrokerURL: MESSAGE_BROKER_URL,
    queue
};
















