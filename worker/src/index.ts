import { Kafka } from "kafkajs";
import { PrismaClient } from "@prisma/client";
import { Resend } from "resend";

const TOPIC_NAME = "autoflow-events";

const resend = new Resend(process.env.RESEND_API_KEY);

const kafka = new Kafka({
  clientId: "worker",
  brokers: ["localhost:9092"],
});

const prismaClient = new PrismaClient();

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
        `topic-${topic}, partition-${partition}, message-${message.value?.toString()}`
      );
      const jsonMessage = JSON.parse(message.value?.toString() || "");
      console.log("jsonMessage is", jsonMessage);
      if (jsonMessage instanceof Object) {
        const workflowRunId = jsonMessage.workflowRunId;
        console.log("Workflow run id", workflowRunId);
        const workflow = await prismaClient.workflowRun.findFirst({
          where: {
            id: workflowRunId,
          },
          include: {
            workflow: {
              include: {
                actions: {
                  include: {
                    type: true,
                  },
                },
              },
            },
          },
        });

        console.log("worklfow to process - ", workflow);
        type emailActionMeta = {
          to: string;
          body: string;
          subject: string;
        };
        if (workflow) {
          const workflowMeta = workflow?.meta;
          console.log("actions are - ", workflow?.workflow.actions);
          workflow?.workflow.actions.forEach(async (action) => {
            if (action?.type?.name == "Email") {
              //action - templated contains the format in which the data from webhook has to be parsed
              //workflowMeta - the actual data that has to be substitued in the templated actionMeta
              const actionMeta =
                action.meta as unknown as emailActionMeta | null;
              console.log("action Meta", actionMeta);
              console.log("workflow Meta", workflowMeta);
              if (actionMeta && workflowMeta) {
                const emailTo = resolveTemplate(actionMeta["to"], workflowMeta);
                const emailBody = resolveTemplate(
                  actionMeta["body"],
                  workflowMeta
                );
                const subject = resolveTemplate(
                  actionMeta["subject"],
                  workflowMeta
                );

                console.log("email to  :", emailTo);
                console.log("email body:", emailBody);
                console.log("subject   :", subject);
                const { data, error } = await resend.emails.send({
                  from: "Autoflow <onboarding@resend.dev>",
                  to: emailTo,
                  subject: subject,
                  html: emailBody,
                });

                if (error) {
                  return console.error({ error });
                }

                console.log({ data });
              }
            }
          });
        }
      }

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

function resolveTemplate(template: string, data: any) {
  return template.replace(/\{([^{}]+)\}/g, (match, key) => {
    const keys = key
      .split(".")
      .reduce((acc: any, k: any) => (acc ? acc[k] : undefined), data);
    return keys !== undefined ? keys : match;
  });
}
