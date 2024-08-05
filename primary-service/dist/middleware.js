"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthMiddleware = AuthMiddleware;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function AuthMiddleware(req, res, next) {
    const token = req.headers.authorization;
    if (!token) {
        return res.sendStatus(401);
    }
    try {
        console.log("token is", token);
        console.log("SECRET", process.env.JWT_SECRET);
        const user = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || "hello world");
        //@ts-ignore
        req.id = user === null || user === void 0 ? void 0 : user.id;
        next();
    }
    catch (e) {
        console.log("Middleware: Error while verifying jwt", e);
        return res.status(401);
    }
}
