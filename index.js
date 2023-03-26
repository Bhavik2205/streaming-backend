import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import "./node_modules/dotenv/config.js";
import mongoose from "mongoose";
import amqp from 'amqplib';
import product from "./routes/product.route.js";
import streaming from "./routes/streaming.route.js";

const app = express();

app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());

app.use('/api', product);
app.use('/api', streaming);

let channel = null;

const connectToRabbitMQ = async () => {
  try {
    const connection = await amqp.connect('amqp://127.0.0.1');
    channel = await connection.createChannel();
    await channel.assertQueue('myQueue');
    console.log('Connected to RabbitMQ!');
  } catch (error) {
    console.error('Failed to connect to RabbitMQ:', error);
    throw error;
  }
};

const initRabbitMQ = async () => {
  try {
    await connectToRabbitMQ();
  } catch (error) {
    console.error('Failed to initialize RabbitMQ:', error);
    throw error;
  }
};

initRabbitMQ();

const sendMessageToQueue = async (message) => {
    try {
      await channel.sendToQueue('myQueue', Buffer.from(message));
      console.log('Message sent to RabbitMQ:', message);
    } catch (error) {
      console.error('Failed to send message to RabbitMQ:', error);
    }
  };

export { sendMessageToQueue };

app.listen(process.env.PORT)

console.log(`Server is started at ${process.env.PORT}`)
mongoose.connect(process.env.DB_CONNECTION, {useUnifiedTopology: true, useNewUrlParser: true}).then(() => {
    console.log(`Connected to Database`)
}).catch((err) => {
    console.log(err.message);
})