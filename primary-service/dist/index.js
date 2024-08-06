"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_1 = require("./router/user");
const workflow_1 = require("./router/workflow");
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.use("/user", user_1.userRouter);
app.use("/workflow", workflow_1.workFlowRouter);
app.get("/", (req, res) => {
    console.log("Primary backend service is healthy");
    return res.json({
        message: "Primary backend is up and running",
    });
});
app.listen(3000, () => {
    console.log("Backend is up and running on port 3000");
});
