import { Router } from "express";

import { prismaClient } from "../db/index";
import bcrypt from "bcrypt";
import { SignInSchema, SignupSchema } from "../types";
import jwt from "jsonwebtoken";
import { AuthMiddleware } from "../middleware";
export const userRouter = Router();

userRouter.get("/", AuthMiddleware, async (req, res) => {
  // @ts-ignore
  const id = req.id;
  console.log("Get user end point.. user-id", id);
  const userData = await prismaClient.user.findUnique({
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
});

userRouter.post("/signup", async (req, res) => {
  try {
    const body = req.body;
    const parsedBody = SignupSchema.safeParse(body);
    if (!parsedBody.success) {
      console.log("Invalid user details");
      res.status(400);
      return res.json({
        message: "Invalid user details",
      });
    }
    const hashedPassword = await bcrypt.hash(parsedBody.data.password, 10);
    await prismaClient.user.create({
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
  } catch (e) {
    console.log(e);
    res.status(500);
    return res.json({
      message: "Some internal error occured, please check later.",
    });
  }
});

userRouter.post("/signin", async (req, res) => {
  const body = req.body;
  const parsedBody = SignInSchema.safeParse(body);
  try {
    if (!parsedBody.success) {
      console.log("Invalid input format");
      return res.status(400).json({ message: "Invalid input format" });
    }
    const user = await prismaClient.user.findFirst({
      where: {
        email: parsedBody.data.email,
      },
    });
    if (!user) {
      return res.status(400).json({
        message: "Invalid Input",
      });
    }
    const isMatch = bcrypt.compare(parsedBody.data.password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid Input",
      });
    }
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET || "hello world"
    );
    return res.status(200).json({
      message: "User signed in!",
      token: token,
    });
  } catch (e) {
    console.log("Some error in signin module");
    return res.status(500).json({
      message: "Some internal error occured",
    });
  }
});
