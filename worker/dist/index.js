"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const kafkajs_1 = require("kafkajs");
const client_1 = require("@prisma/client");
const resend_1 = require("resend");
const TOPIC_NAME = "autoflow-events";
const resend = new resend_1.Resend(process.env.RESEND_API_KEY);
const kafka = new kafkajs_1.Kafka({
    clientId: "worker",
    brokers: ["localhost:9092"],
});
const prismaClient = new client_1.PrismaClient();
function worker() {
    return __awaiter(this, void 0, void 0, function* () {
        const consumer = kafka.consumer({
            groupId: "free-users",
        });
        yield consumer.connect();
        console.log("worker started");
        consumer.subscribe({
            topic: TOPIC_NAME,
            fromBeginning: true,
        });
        yield consumer.run({
            eachMessage: (_a) => __awaiter(this, [_a], void 0, function* ({ topic, partition, message }) {
                var _b, _c;
                console.log(`topic-${topic}, partition-${partition}, message-${(_b = message.value) === null || _b === void 0 ? void 0 : _b.toString()}`);
                const jsonMessage = JSON.parse(((_c = message.value) === null || _c === void 0 ? void 0 : _c.toString()) || "");
                console.log("jsonMessage is", jsonMessage);
                if (jsonMessage instanceof Object) {
                    const workflowRunId = jsonMessage.workflowRunId;
                    console.log("Workflow run id", workflowRunId);
                    const workflow = yield prismaClient.workflowRun.findFirst({
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
                    if (workflow) {
                        const workflowMeta = workflow === null || workflow === void 0 ? void 0 : workflow.meta;
                        console.log("actions are - ", workflow === null || workflow === void 0 ? void 0 : workflow.workflow.actions);
                        workflow === null || workflow === void 0 ? void 0 : workflow.workflow.actions.forEach((action) => __awaiter(this, void 0, void 0, function* () {
                            var _d;
                            if (((_d = action === null || action === void 0 ? void 0 : action.type) === null || _d === void 0 ? void 0 : _d.name) == "Email") {
                                //action - templated contains the format in which the data from webhook has to be parsed
                                //workflowMeta - the actual data that has to be substitued in the templated actionMeta
                                const actionMeta = action.meta;
                                console.log("action Meta", actionMeta);
                                console.log("workflow Meta", workflowMeta);
                                if (actionMeta && workflowMeta) {
                                    const emailTo = resolveTemplate(actionMeta["to"], workflowMeta);
                                    const emailBody = resolveTemplate(actionMeta["body"], workflowMeta);
                                    const subject = resolveTemplate(actionMeta["subject"], workflowMeta);
                                    console.log("email to  :", emailTo);
                                    console.log("email body:", emailBody);
                                    console.log("subject   :", subject);
                                    const { data, error } = yield resend.emails.send({
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
                        }));
                    }
                }
                yield consumer.commitOffsets([
                    {
                        topic: TOPIC_NAME,
                        partition: partition,
                        offset: (parseInt(message.offset) + 1).toString(),
                    },
                ]);
            }),
        });
    });
}
worker();
function resolveTemplate(template, data) {
    return template.replace(/\{([^{}]+)\}/g, (match, key) => {
        const keys = key
            .split(".")
            .reduce((acc, k) => (acc ? acc[k] : undefined), data);
        return keys !== undefined ? keys : match;
    });
}
