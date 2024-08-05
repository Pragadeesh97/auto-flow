import { prismaClient } from "../db";
import { Router } from "express";
import { AuthMiddleware } from "../middleware";
import { createWorkflowSchema } from "../types";
export const workFlowRouter = Router();

workFlowRouter.get("/", AuthMiddleware, async (req, res) => {
  const user_id = req.body;
  const workflows = await prismaClient.workflow.findMany({
    where: {
      createdBy: user_id,
    },
    include: {
      actions: {
        include: {
          type: true,
        },
      },
      trigger: {
        include: {
          type: true,
        },
      },
    },
  });
  return res.status(400).json({
    workflows,
  });
});

workFlowRouter.post("/", AuthMiddleware, async (req, res) => {
  const body = req.body;
  // @ts-ignore
  const userId = req.id;
  const parsedBody = createWorkflowSchema.safeParse(body);
  if (!parsedBody.success) {
    console.log("Error while parsing", parsedBody.error);
    return res.status(400).json({ message: "Invalid input format" });
  }
  try {
    await prismaClient.$transaction(async (tx) => {
      const workflow = await prismaClient.workflow.create({
        data: {
          name: parsedBody.data.workflowName,
          createdBy: userId,
          createdAt: new Date().toDateString(),
          isActive: true,
          actions: {
            create: parsedBody.data.actions.map((action, index) => ({
              availableActionId: action.availableActionId,
              meta: action.actionMeta,
              order: index,
            })),
          },
        },
      });
      await prismaClient.trigger.create({
        data: {
          meta: parsedBody.data.triggerMeta,
          availableTriggerId: parsedBody.data.availableTriggerId,
          workflowId: workflow.id,
        },
      });
    });
    res.status(200).json({
      message: "Workflow Created Successfully",
    });
  } catch (e) {
    console.log("Error occured while creating worklflow", e);
    return res.status(500).json({
      message: "Some internal error occured, please try later",
    });
  }
});

workFlowRouter.get("/:workflow_id", AuthMiddleware, async (req, res) => {
  const body = req.body;
  //@ts-ignore
  const user_id = req.id;
  const workflow = await prismaClient.workflow.findMany({
    where: {
      createdBy: user_id,
      id: parseInt(req.params.workflow_id),
    },
    include: {
      actions: {
        include: {
          type: true,
        },
      },
      trigger: {
        include: {
          type: true,
        },
      },
    },
  });
  return res.status(200).json({
    workflow,
  });
});
