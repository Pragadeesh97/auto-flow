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
exports.userRouter = void 0;
const express_1 = require("express");
const index_1 = require("../db/index");
const bcrypt_1 = __importDefault(require("bcrypt"));
const types_1 = require("../types");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const middleware_1 = require("../middleware");
exports.userRouter = (0, express_1.Router)();
exports.userRouter.get("/", middleware_1.AuthMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // @ts-ignore
    const id = req.id;
    console.log("Get user end point.. user-id", id);
    const userData = yield index_1.prismaClient.user.findUnique({
        where: {
            id: id,
        },
        select: {
            name: true,
            email: true,
        },
    });
    if (!userData) {
        return res.status(400).json({
            message: "Invalid input",
        });
    }
    return res.status(200).json({
        message: "User details fetched",
        user: userData,
    });
}));
exports.userRouter.post("/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const body = req.body;
        const parsedBody = types_1.SignupSchema.safeParse(body);
        if (!parsedBody.success) {
            console.log("Invalid user details");
            res.status(400);
            return res.json({
                message: "Invalid user details",
            });
        }
        const hashedPassword = yield bcrypt_1.default.hash(parsedBody.data.password, 10);
        yield index_1.prismaClient.user.create({
            data: {
                email: parsedBody.data.email,
                password: hashedPassword,
                name: parsedBody.data.name,
                planType: "Free",
            },
        });
        res.status(200);
        return res.json({
            message: "User signed up sucessfully",
        });
    }
    catch (e) {
        console.log(e);
        res.status(500);
        return res.json({
            message: "Some internal error occured, please check later.",
        });
    }
}));
exports.userRouter.post("/signin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    const parsedBody = types_1.SignInSchema.safeParse(body);
    try {
        if (!parsedBody.success) {
            console.log("Invalid input format");
            return res.status(400).json({ message: "Invalid input format" });
        }
        const user = yield index_1.prismaClient.user.findFirst({
            where: {
                email: parsedBody.data.email,
            },
        });
        if (!user) {
            return res.status(400).json({
                message: "Invalid Input",
            });
        }
        const isMatch = bcrypt_1.default.compare(parsedBody.data.password, user.password);
        if (!isMatch) {
            return res.status(400).json({
                message: "Invalid Input",
            });
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id }, process.env.JWT_SECRET || "hello world");
        return res.status(200).json({
            message: "User signed in!",
            token: token,
        });
    }
    catch (e) {
        console.log("Some error in signin module");
        return res.status(500).json({
            message: "Some internal error occured",
        });
    }
}));
