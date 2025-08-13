import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/auth.routes";
import digioRoutes from "./routes/digio.routes";
import cashfreeRoutes from "./routes/cashfree.routes";
import otpRoutes from "./routes/otp.routes";
import cookieParser from "cookie-parser";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3003;

// Middleware
app.use(
  cors({
    origin: "http://localhost:8080",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// Healthcheck endpoint
app.get("/healthcheck", (req: Request, res: Response) => {
  res.status(200).json({ status: "ok", message: "Server is healthy" });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/digio", digioRoutes);
app.use("/api/cashfree", cashfreeRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/otp", otpRoutes);

// Root endpoint
app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});

export default app;
