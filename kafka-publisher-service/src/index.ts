import { PrismaClient } from "@prisma/client";
import { Kafka } from "kafkajs";

const prismaClient = new PrismaClient();

const TOPIC_NAME = "autoflow-events";

//create the kafka client
const kafka = new Kafka({
  clientId: "task-publisher",
  brokers: ["localhost:9092"],
});

async function publish() {
  //create kafka producer
  const producer = kafka.producer({ allowAutoTopicCreation: false });
  await producer.connect();
  console.log("Kafka publisher running...");

  while (1) {
    // pull all the records to be published
    const pendingData = await prismaClient.workflowRunOutput.findMany();
    console.log("pendingData", pendingData);
    // bulk publish all the data in kafka
    if (pendingData.length < 0) {
      continue;
    }
    producer.send({
      topic: TOPIC_NAME,
      messages: pendingData.map((e) => {
        return { value: JSON.stringify({ workflowRunId: e.id }) };
      }),
    });
    // delete the published data
    const deleted = await prismaClient.workflowRunOutput.deleteMany({
      where: {
        id: {
          in: pendingData.map((ele) => ele.id),
        },
      },
    });
    console.log("deleted workflow outputs", deleted);
    await new Promise((resolve) => setTimeout(resolve, 3000));
  }
}

publish();
