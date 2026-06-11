import amqp from "amqplib";
import env from "../config/env";

const RABBITMQ_URL = env.RABBITMQ_URL;
let channel: amqp.Channel | null = null;
let connection: any = null;

const initRabbitMQ = async () => {
  try {
    if (!connection) {
      connection = await amqp.connect(RABBITMQ_URL);
      
      connection.on("error", (err: Error) => {
        console.error("RabbitMQ Connection error", err);
        connection = null;
        channel = null;
      });

      connection.on("close", () => {
        console.warn("RabbitMQ Connection closed, resetting...");
        connection = null;
        channel = null;
      });

      const newChannel = await connection.createChannel();
      
      newChannel.on("error", (err: Error) => {
        console.error("RabbitMQ Channel error", err);
        channel = null;
      });

      newChannel.on("close", () => {
        console.warn("RabbitMQ Channel closed");
        channel = null;
      });

      channel = newChannel;
    }
  } catch (err) {
    console.error("Falha ao inicializar o RabbitMQ: ", err);
    connection = null;
    channel = null;
    throw err;
  }
};

export const notifyService = async (uploadData: any) => {
  try {
    await initRabbitMQ();

    if (!channel) {
      throw new Error("Canal do RabbitMQ não está disponível.");
    }

    await channel.assertQueue(uploadData.serviceName, { durable: true });

    channel.sendToQueue(uploadData.serviceName, Buffer.from(JSON.stringify(uploadData)), {
      persistent: true,
    });
  } catch (error) {
    console.error("Erro ao enviar mensagem para fila:", error);
    throw error;
  }
};
