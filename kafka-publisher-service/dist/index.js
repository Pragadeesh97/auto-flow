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
const client_1 = require("@prisma/client");
const kafkajs_1 = require("kafkajs");
const prismaClient = new client_1.PrismaClient();
const TOPIC_NAME = "autoflow-events";
//create the kafka client
const kafka = new kafkajs_1.Kafka({
    clientId: "task-publisher",
    brokers: ["localhost:9092"],
});
function publish() {
    return __awaiter(this, void 0, void 0, function* () {
        //create kafka producer
        const producer = kafka.producer({ allowAutoTopicCreation: false });
        yield producer.connect();
        console.log("Kafka publisher running...");
        while (1) {
            // pull all the records to be published
            const pendingData = yield prismaClient.workflowRunOutput.findMany();
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
            const deleted = yield prismaClient.workflowRunOutput.deleteMany({
                where: {
                    id: {
                        in: pendingData.map((ele) => ele.id),
                    },
                },
            });
            console.log("deleted workflow outputs", deleted);
            yield new Promise((resolve) => setTimeout(resolve, 3000));
        }
    });
}
publish();
