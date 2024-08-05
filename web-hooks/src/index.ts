import express from "express";
import { PrismaClient } from "@prisma/client";

const prismaClient = new PrismaClient();
const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  console.log("Web hook health check");
  return res.json({ message: "Web hook is healthy" });
});

app.post("/hook/catch/:user_id/:workflow_id", async (req, res) => {
  console.log("request params", req.params);
  const body = req.body;
  const workflow_id = parseInt(req.params.workflow_id);
  // check for a secret password here to authenticate only good ones
  console.log("body", body);
  await prismaClient.$transaction(async (tx) => {
    await prismaClient.workflowRun.create({
      data: {
        workflowId: workflow_id,
        meta: body,
        creationTime: new Date(),
      },
    });
    await prismaClient.workflowRunOutput.create({
      data: {
        workflowRunId: workflow_id,
        creationTime: new Date(),
      },
    });
  });
  return res.json({ message: "web hook received" });
});
app.listen(3001, () => {
  console.log("Web hook is up and running");
});
