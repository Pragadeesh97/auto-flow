"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createWorkflowSchema = exports.SignInSchema = exports.SignupSchema = void 0;
const zod_1 = require("zod");
exports.SignupSchema = zod_1.z.object({
    email: zod_1.z.string().min(5),
    name: zod_1.z.string().min(4),
    password: zod_1.z.string().min(4),
});
exports.SignInSchema = zod_1.z.object({
    email: zod_1.z.string(),
    password: zod_1.z.string(),
});
exports.createWorkflowSchema = zod_1.z.object({
    availableTriggerId: zod_1.z.number(),
    triggerMeta: zod_1.z.any().optional(),
    workflowName: zod_1.z.string(),
    actions: zod_1.z.array(zod_1.z.object({
        availableActionId: zod_1.z.number(),
        actionMeta: zod_1.z.any().optional(),
    })),
});
