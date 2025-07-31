const amqp = require("amqplib");
const dotenv = require("../config/dotenv");

const RABBITMQ_URL = dotenv.RABBITMQ_URL;
let channel, connection;

const initRabbitMQ = async () => {
  if (!connection) {
    connection = await amqp.connect(RABBITMQ_URL);
    channel = await connection.createChannel();
  }
};

const notifyService = async (uploadData) => {
  try {
    await initRabbitMQ();
    await channel.assertQueue(uploadData.serviceName, {
      durable: true,
      arguments: {
        "x-dead-letter-exchange": "", // DLQ padrão
        "x-dead-letter-routing-key": "dead-letter-queue",
      },
    });

    channel.sendToQueue(uploadData.serviceName, Buffer.from(JSON.stringify(uploadData)), {
      persistent: true,
    });
  } catch (error) {
    console.error("Erro ao enviar mensagem para fila:", error);
  }
};

module.exports = { notifyService };
