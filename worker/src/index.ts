import { Kafka } from "kafkajs";

const TOPIC_NAME = "autoflow-events";

const kafka = new Kafka({
  clientId: "worker",
  brokers: ["localhost:9092"],
});

async function worker() {
  const consumer = kafka.consumer({
    groupId: "free-users",
  });
  await consumer.connect();
  console.log("worker started");
  consumer.subscribe({
    topic: TOPIC_NAME,
    fromBeginning: true,
  });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      console.log(
        `topic-${topic}, partition-${partition}, message-${message.value.toString()}`
      );
      await consumer.commitOffsets([
        {
          topic: TOPIC_NAME,
          partition: partition,
          offset: (parseInt(message.offset) + 1).toString(),
        },
      ]);
    },
  });
}
worker();
