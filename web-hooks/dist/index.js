"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.get("/", (req, res) => {
    console.log("Web hook health check");
    return res.json({ message: "Web hook is healthy" });
});
app.post("/hook/catch/:user_id/:workflow_id", (req, res) => {
    console.log("request params", req.params);
    const body = req.body;
    // check for a secret
    console.log("body");
    return res.json({ message: "web hook received" });
});
app.listen(3000, () => {
    console.log("Web hook is up and running");
});
