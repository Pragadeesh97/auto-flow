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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const prismaClient = new client_1.PrismaClient();
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.get("/", (req, res) => {
    console.log("Web hook health check");
    return res.json({ message: "Web hook is healthy" });
});
app.post("/hook/catch/:user_id/:workflow_id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("request params", req.params);
    const body = req.body;
    const workflow_id = parseInt(req.params.workflow_id);
    // check for a secret password here to authenticate only correct ones
    console.log("Body is", body);
    try {
        yield prismaClient.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            const workflowRun = yield prismaClient.workflowRun.create({
                data: {
                    workflowId: workflow_id,
                    meta: body,
                    creationTime: new Date(),
                },
            });
            yield prismaClient.workflowRunOutput.create({
                data: {
                    workflowRunId: workflowRun.id,
                    creationTime: new Date(),
                },
            });
        }));
    }
    catch (e) {
        console.log("Error while processing web hook", e);
    }
    return res.json({ message: "web hook received" });
}));
app.listen(3010, () => {
    console.log("Web hook is up and running at port 3010");
});
