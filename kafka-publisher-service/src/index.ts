import { PrismaClient } from "@prisma/client";
import { Kafka } from "kafkajs";

const prismaClient = new PrismaClient();

const TOPIC_NAME = "autoflow-events";

//create the kafka client
const kafka = new Kafka({
  clientId: "task-publisher",
  brokers: ["localhost:9092"],
});

//create kafka producer
const producer = kafka.producer();

async function publish() {
  console.log("Kafka publisher running...");

  while (1) {
    // pull all the records to be published
    const pendingData = await prismaClient.workflowRunOutput.findMany();
    // bulk publish all the data in kafka
    producer.send({
      topic: TOPIC_NAME,
      messages: pendingData.map((e) => {
        return { value: JSON.stringify({ workflowId: e.id }) };
      }),
    });
    // delete the published data
    await prismaClient.workflowRunOutput.deleteMany({
      where: {
        id: {
          in: pendingData.map((ele) => ele.id),
        },
      },
    });
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
}

publish();
