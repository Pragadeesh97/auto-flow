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
  // check for a secret password here to authenticate only correct ones
  console.log("Body is", body);
  try {
    await prismaClient.$transaction(async (tx) => {
      const workflowRun = await prismaClient.workflowRun.create({
        data: {
          workflowId: workflow_id,
          meta: body,
          creationTime: new Date(),
        },
      });
      await prismaClient.workflowRunOutput.create({
        data: {
          workflowRunId: workflowRun.id,
          creationTime: new Date(),
        },
      });
    });
  } catch (e) {
    console.log("Error while processing web hook", e);
  }
  return res.json({ message: "web hook received" });
});
app.listen(3010, () => {
  console.log("Web hook is up and running at port 3010");
});
