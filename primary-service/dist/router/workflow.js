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
exports.workFlowRouter = void 0;
const db_1 = require("../db");
const express_1 = require("express");
const middleware_1 = require("../middleware");
const types_1 = require("../types");
exports.workFlowRouter = (0, express_1.Router)();
exports.workFlowRouter.get("/", middleware_1.AuthMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user_id = req.body;
    const workflows = yield db_1.prismaClient.workflow.findMany({
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
}));
exports.workFlowRouter.post("/", middleware_1.AuthMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    // @ts-ignore
    const userId = req.id;
    const parsedBody = types_1.createWorkflowSchema.safeParse(body);
    if (!parsedBody.success) {
        console.log("Error while parsing", parsedBody.error);
        return res.status(400).json({ message: "Invalid input format" });
    }
    try {
        yield db_1.prismaClient.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            const workflow = yield db_1.prismaClient.workflow.create({
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
            yield db_1.prismaClient.trigger.create({
                data: {
                    meta: parsedBody.data.triggerMeta,
                    availableTriggerId: parsedBody.data.availableTriggerId,
                    workflowId: workflow.id,
                },
            });
        }));
        res.status(200).json({
            message: "Workflow Created Successfully",
        });
    }
    catch (e) {
        console.log("Error occured while creating worklflow", e);
        return res.status(500).json({
            message: "Some internal error occured, please try later",
        });
    }
}));
exports.workFlowRouter.get("/:workflow_id", middleware_1.AuthMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    //@ts-ignore
    const user_id = req.id;
    const workflow = yield db_1.prismaClient.workflow.findMany({
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
}));
