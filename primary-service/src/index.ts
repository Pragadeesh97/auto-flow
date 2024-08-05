import express from "express";
import { userRouter } from "./router/user";
import { workFlowRouter } from "./router/workflow";

const app = express();

app.use(express.json());

app.use("/user", userRouter);
app.use("/workflow", workFlowRouter);

app.get("/", (req, res) => {
  console.log("Primary backend service is healthy");
  return res.json({
    message: "Primary backend is up and running",
  });
});

app.listen(3000, () => {
  console.log("Backend is up and running");
});
