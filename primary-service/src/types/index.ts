import { z } from "zod";

export const SignupSchema = z.object({
  email: z.string().min(5),
  name: z.string().min(4),
  password: z.string().min(4),
});

export const SignInSchema = z.object({
  email: z.string(),
  password: z.string(),
});

export const createWorkflowSchema = z.object({
  availableTriggerId: z.number(),
  triggerMeta: z.any().optional(),
  workflowName: z.string(),
  actions: z.array(
    z.object({
      availableActionId: z.number(),
      actionMeta: z.any().optional(),
    })
  ),
});
